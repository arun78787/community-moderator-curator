import express from 'express';
import { Flag } from '../models/Flag';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { validateFlag } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { io } from '../server';
import { emitToModerators } from '../config/socket';

const router = express.Router();

// Create flag
router.post('/', validateFlag, asyncHandler(async (req, res) => {
  const { post_id, reason_category, reason_text } = req.body;

  // Check if post exists
  const post = await Post.findByPk(post_id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'name'],
      },
    ],
  });

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  // Check if user already flagged this post
  const existingFlag = await Flag.findOne({
    where: {
      post_id,
      flagged_by: req.user!.id,
    },
  });

  if (existingFlag) {
    return res.status(400).json({ message: 'You have already flagged this post' });
  }

  // Create flag
  const flag = await Flag.create({
    post_id,
    flagged_by: req.user!.id,
    reason_category,
    reason_text,
  });

  // Emit real-time notification to moderators
  emitToModerators(io, 'moderation:new-flag', {
    flagId: flag.id,
    postId: post_id,
    reason: reason_category,
    flaggedBy: req.user!.name,
    postAuthor: post.author?.name,
    postContent: post.content.substring(0, 100) + '...',
  });

  res.status(201).json({
    message: 'Post flagged successfully',
    flag,
  });
}));

// Get user's flags
router.get('/my-flags', asyncHandler(async (req, res) => {
  const flags = await Flag.findAll({
    where: {
      flagged_by: req.user!.id,
    },
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
    order: [['created_at', 'DESC']],
  });

  res.json(flags);
}));

export default router;