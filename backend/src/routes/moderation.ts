import express from 'express';
import { Flag } from '../models/Flag';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { ModerationLog } from '../models/ModerationLog';
import { AIAnalysis } from '../models/AIAnalysis';
import { requireRole } from '../middleware/auth';
import { validateModerationAction } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { io } from '../server';
import { emitToUser } from '../config/socket';
import { Op } from 'sequelize';

const router = express.Router();

// All moderation routes require moderator or admin role
router.use(requireRole(['moderator', 'admin']));

// Get moderation queue
router.get('/queue', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string || 'pending';
  const sort = req.query.sort as string || 'created_at';

  const offset = (page - 1) * limit;

  const whereClause: any = {};
  if (status !== 'all') {
    whereClause.status = status;
  }

  const orderClause: any = [];
  switch (sort) {
    case 'risk_score':
      orderClause.push([{ model: AIAnalysis, as: 'aiAnalyses' }, 'overall_risk', 'DESC']);
      break;
    case 'priority':
      orderClause.push(['reason_category', 'ASC'], ['created_at', 'ASC']);
      break;
    default:
      orderClause.push(['created_at', 'DESC']);
  }

  const { count, rows: flags } = await Flag.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Post,
        as: 'post',
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name'],
          },
          {
            model: AIAnalysis,
            as: 'aiAnalyses',
            limit: 1,
            order: [['created_at', 'DESC']],
          },
        ],
      },
      {
        model: User,
        as: 'flaggedBy',
        attributes: ['id', 'name'],
      },
    ],
    order: orderClause,
    limit,
    offset,
  });

  res.json({
    flags: flags.map(flag => ({
      ...flag.toJSON(),
      ai_analysis: flag.post?.aiAnalyses?.[0] || null,
    })),
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    total: count,
    pending: await Flag.count({ where: { status: 'pending' } }),
  });
}));

// Get specific flag details
router.get('/:flagId', asyncHandler(async (req, res) => {
  const flag = await Flag.findByPk(req.params.flagId, {
    include: [
      {
        model: Post,
        as: 'post',
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name'],
          },
          {
            model: AIAnalysis,
            as: 'aiAnalyses',
          },
        ],
      },
      {
        model: User,
        as: 'flaggedBy',
        attributes: ['id', 'name'],
      },
      {
        model: ModerationLog,
        as: 'moderationLogs',
        include: [
          {
            model: User,
            as: 'moderator',
            attributes: ['id', 'name'],
          },
        ],
      },
    ],
  });

  if (!flag) {
    return res.status(404).json({ message: 'Flag not found' });
  }

  res.json({
    ...flag.toJSON(),
    ai_analysis: flag.post?.aiAnalyses?.[0] || null,
  });
}));

// Take moderation action
router.post('/:flagId/action', validateModerationAction, asyncHandler(async (req, res) => {
  const { action, reason } = req.body;
  const flagId = req.params.flagId;

  const flag = await Flag.findByPk(flagId, {
    include: [
      {
        model: Post,
        as: 'post',
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name'],
          },
        ],
      },
    ],
  });

  if (!flag) {
    return res.status(404).json({ message: 'Flag not found' });
  }

  if (flag.status !== 'pending') {
    return res.status(400).json({ message: 'Flag has already been processed' });
  }

  // Update flag status
  flag.status = action === 'approve' ? 'approved' : action === 'remove' ? 'removed' : 'escalated';
  await flag.save();

  // Update post status if removing
  if (action === 'remove' && flag.post) {
    flag.post.status = 'removed';
    await flag.post.save();
  }

  // Create moderation log
  await ModerationLog.create({
    moderator_id: req.user!.id,
    flag_id: flagId,
    action,
    notes: reason,
  });

  // Update user reputation based on moderation outcome
  if (flag.post?.author) {
    const author = await User.findByPk(flag.post.author.id);
    if (author) {
      if (action === 'remove') {
        author.reputation_score = Math.max(0, author.reputation_score - 10);
      } else if (action === 'approve') {
        author.reputation_score += 5;
      }
      await author.save();
    }
  }

  // Emit real-time notification to post author
  if (flag.post?.author) {
    emitToUser(io, flag.post.author.id, 'moderation:action', {
      action,
      postId: flag.post.id,
      reason,
      moderator: req.user!.name,
    });
  }

  res.json({
    message: `Flag ${action}d successfully`,
    flag: await Flag.findByPk(flagId, {
      include: [
        {
          model: Post,
          as: 'post',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: User,
          as: 'flaggedBy',
          attributes: ['id', 'name'],
        },
      ],
    }),
  });
}));

// Get moderation logs
router.get('/logs', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = (page - 1) * limit;

  const { count, rows: logs } = await ModerationLog.findAndCountAll({
    include: [
      {
        model: User,
        as: 'moderator',
        attributes: ['id', 'name'],
      },
      {
        model: Flag,
        as: 'flag',
        include: [
          {
            model: Post,
            as: 'post',
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'name'],
              },
            ],
          },
        ],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  res.json({
    logs,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    total: count,
  });
}));

export default router;