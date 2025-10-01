import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { Flag } from '../models/Flag';
import { AIAnalysis } from '../models/AIAnalysis';
import { authenticateToken } from '../middleware/auth';
import { validatePost } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { aiService } from '../services/aiService';
import { Op } from 'sequelize';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Get all posts (public feed)
router.get('/', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const author = req.query.author as string;

  const offset = (page - 1) * limit;

  const whereClause: any = {
    status: 'active',
  };

  if (search) {
    whereClause.content = {
      [Op.iLike]: `%${search}%`,
    };
  }

  if (author) {
    whereClause.author_id = author;
  }

  const { count, rows: posts } = await Post.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'role'],
      },
      {
        model: Flag,
        as: 'flags',
        attributes: ['id'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  res.json({
    posts: posts.map(post => ({
      ...post.toJSON(),
      _count: {
        flags: post.flags?.length || 0,
      },
    })),
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    total: count,
  });
}));

// Get single post
router.get('/:id', asyncHandler(async (req, res) => {
  const post = await Post.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'role'],
      },
      {
        model: Flag,
        as: 'flags',
        include: [
          {
            model: User,
            as: 'flaggedBy',
            attributes: ['id', 'name'],
          },
        ],
      },
      {
        model: AIAnalysis,
        as: 'aiAnalyses',
      },
    ],
  });

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  // Include AI analysis in response for moderators/admins
  const user = req.user;
  const includeAIAnalysis = user && (user.role === 'moderator' || user.role === 'admin');

  const response: any = {
    ...post.toJSON(),
    _count: {
      flags: post.flags?.length || 0,
    },
  };

  if (includeAIAnalysis && post.aiAnalyses && post.aiAnalyses.length > 0) {
    response.ai_analysis = post.aiAnalyses[0];
  }

  res.json(response);
}));

// Create post
router.post('/', authenticateToken, upload.single('media'), validatePost, asyncHandler(async (req, res) => {
  const { content } = req.body;
  const media_url = req.file ? `/uploads/${req.file.filename}` : undefined;

  // Create post
  const post = await Post.create({
    author_id: req.user!.id,
    content,
    media_url,
  });

  // Analyze content with AI
  try {
    const textAnalysis = await aiService.analyzeText(content, post.id);
    
    // Check if content should be auto-removed or flagged
    if (await aiService.shouldAutoRemove(textAnalysis.overall_risk)) {
      post.status = 'removed';
      await post.save();
    } else if (await aiService.shouldFlag(textAnalysis.overall_risk)) {
      // Auto-flag for review
      await Flag.create({
        post_id: post.id,
        flagged_by: req.user!.id, // System flag
        reason_category: 'other',
        reason_text: 'Automatically flagged by AI for review',
      });
    }

    // Analyze image if present
    if (media_url) {
      const imageUrl = `${req.protocol}://${req.get('host')}${media_url}`;
      const imageAnalysis = await aiService.analyzeImage(imageUrl, post.id);
      
      if (await aiService.shouldAutoRemove(imageAnalysis.overall_risk)) {
        post.status = 'removed';
        await post.save();
      }
    }
  } catch (error) {
    console.error('AI analysis failed:', error);
    // Continue without AI analysis
  }

  // Fetch the complete post with author info
  const completePost = await Post.findByPk(post.id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'role'],
      },
    ],
  });

  res.status(201).json(completePost);
}));

// Update post
router.patch('/:id', authenticateToken, validatePost, asyncHandler(async (req, res) => {
  const { content } = req.body;
  
  const post = await Post.findByPk(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  // Check ownership
  if (post.author_id !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to edit this post' });
  }

  post.content = content;
  await post.save();

  // Re-analyze updated content
  try {
    await aiService.analyzeText(content, post.id);
  } catch (error) {
    console.error('AI analysis failed:', error);
  }

  const updatedPost = await Post.findByPk(post.id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'role'],
      },
    ],
  });

  res.json(updatedPost);
}));

// Delete post
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  // Check ownership or admin role
  if (post.author_id !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete this post' });
  }

  await post.destroy();
  res.json({ message: 'Post deleted successfully' });
}));

export default router;