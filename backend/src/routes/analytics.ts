import express from 'express';
import { sequelize } from '../config/database';
import { Flag } from '../models/Flag';
import { ModerationLog } from '../models/ModerationLog';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { AIAnalysis } from '../models/AIAnalysis';
import { requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { Op } from 'sequelize';

const router = express.Router();

// Analytics routes require moderator or admin role
router.use(requireRole(['moderator', 'admin']));

// Get moderation metrics
router.get('/moderation-metrics', asyncHandler(async (req, res) => {
  const timeRange = req.query.range as string || '7d';
  
  // Calculate date range
  const now = new Date();
  const startDate = new Date();
  
  switch (timeRange) {
    case '24h':
      startDate.setHours(now.getHours() - 24);
      break;
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }

  // Get flag statistics
  const totalFlags = await Flag.count({
    where: {
      created_at: {
        [Op.gte]: startDate,
      },
    },
  });

  const pendingFlags = await Flag.count({
    where: {
      status: 'pending',
      created_at: {
        [Op.gte]: startDate,
      },
    },
  });

  const approvedFlags = await Flag.count({
    where: {
      status: 'approved',
      created_at: {
        [Op.gte]: startDate,
      },
    },
  });

  const removedFlags = await Flag.count({
    where: {
      status: 'removed',
      created_at: {
        [Op.gte]: startDate,
      },
    },
  });

  // Calculate average response time
  const moderationLogs = await ModerationLog.findAll({
    include: [
      {
        model: Flag,
        as: 'flag',
        where: {
          created_at: {
            [Op.gte]: startDate,
          },
        },
      },
    ],
    raw: true,
  });

  let averageResponseTime = 0;
  if (moderationLogs.length > 0) {
    const totalResponseTime = moderationLogs.reduce((sum, log: any) => {
      const flagCreated = new Date(log['flag.created_at']);
      const actionTaken = new Date(log.created_at);
      const responseTime = (actionTaken.getTime() - flagCreated.getTime()) / (1000 * 60 * 60); // hours
      return sum + responseTime;
    }, 0);
    averageResponseTime = totalResponseTime / moderationLogs.length;
  }

  // Calculate accuracy (simplified - based on approved vs removed ratio)
  const totalProcessed = approvedFlags + removedFlags;
  const accuracy = totalProcessed > 0 ? ((approvedFlags + removedFlags) / totalProcessed) * 100 : 0;

  // Calculate false positive rate (simplified)
  const falsePositiveRate = totalProcessed > 0 ? (approvedFlags / totalProcessed) * 100 : 0;

  res.json({
    totalFlags,
    pendingFlags,
    approvedFlags,
    removedFlags,
    averageResponseTime: Math.round(averageResponseTime * 10) / 10,
    accuracy: Math.round(accuracy * 10) / 10,
    falsePositiveRate: Math.round(falsePositiveRate * 10) / 10,
    timeRange,
  });
}));

// Get community stats
router.get('/community-stats', asyncHandler(async (req, res) => {
  const timeRange = req.query.range as string || '7d';
  
  const now = new Date();
  const startDate = new Date();
  
  switch (timeRange) {
    case '24h':
      startDate.setHours(now.getHours() - 24);
      break;
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }

  // Get post statistics
  const totalPosts = await Post.count({
    where: {
      created_at: {
        [Op.gte]: startDate,
      },
    },
  });

  const activePosts = await Post.count({
    where: {
      status: 'active',
      created_at: {
        [Op.gte]: startDate,
      },
    },
  });

  const removedPosts = await Post.count({
    where: {
      status: 'removed',
      created_at: {
        [Op.gte]: startDate,
      },
    },
  });

  // Get user statistics
  const totalUsers = await User.count();
  const newUsers = await User.count({
    where: {
      created_at: {
        [Op.gte]: startDate,
      },
    },
  });

  // Get AI analysis statistics
  const aiAnalyses = await AIAnalysis.count({
    where: {
      created_at: {
        [Op.gte]: startDate,
      },
    },
  });

  // Get flag category breakdown
  const flagCategories = await Flag.findAll({
    attributes: [
      'reason_category',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    where: {
      created_at: {
        [Op.gte]: startDate,
      },
    },
    group: ['reason_category'],
    raw: true,
  });

  res.json({
    posts: {
      total: totalPosts,
      active: activePosts,
      removed: removedPosts,
      removalRate: totalPosts > 0 ? (removedPosts / totalPosts) * 100 : 0,
    },
    users: {
      total: totalUsers,
      new: newUsers,
    },
    ai: {
      totalAnalyses: aiAnalyses,
    },
    flagCategories: flagCategories.reduce((acc: any, item: any) => {
      acc[item.reason_category] = parseInt(item.count);
      return acc;
    }, {}),
    timeRange,
  });
}));

// Get trend data for charts
router.get('/trends', asyncHandler(async (req, res) => {
  const timeRange = req.query.range as string || '7d';
  const type = req.query.type as string || 'flags';
  
  const now = new Date();
  const startDate = new Date();
  let groupBy = 'day';
  
  switch (timeRange) {
    case '24h':
      startDate.setHours(now.getHours() - 24);
      groupBy = 'hour';
      break;
    case '7d':
      startDate.setDate(now.getDate() - 7);
      groupBy = 'day';
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      groupBy = 'day';
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      groupBy = 'week';
      break;
    default:
      startDate.setDate(now.getDate() - 7);
      groupBy = 'day';
  }

  let query = '';
  let model = Flag;
  
  switch (type) {
    case 'flags':
      query = `
        SELECT 
          DATE_TRUNC('${groupBy}', created_at) as period,
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'removed' THEN 1 END) as removed
        FROM flags 
        WHERE created_at >= :startDate 
        GROUP BY period 
        ORDER BY period
      `;
      break;
    case 'posts':
      query = `
        SELECT 
          DATE_TRUNC('${groupBy}', created_at) as period,
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'removed' THEN 1 END) as removed
        FROM posts 
        WHERE created_at >= :startDate 
        GROUP BY period 
        ORDER BY period
      `;
      break;
    default:
      return res.status(400).json({ message: 'Invalid trend type' });
  }

  const results = await sequelize.query(query, {
    replacements: { startDate },
    type: sequelize.QueryTypes.SELECT,
  });

  res.json({
    trends: results,
    timeRange,
    type,
    groupBy,
  });
}));

export default router;