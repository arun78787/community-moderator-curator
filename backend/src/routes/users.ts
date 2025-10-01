import express from 'express';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Flag } from '../models/Flag';
import { requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// Get user profile
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password_hash'] },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Get user statistics
  const postCount = await Post.count({
    where: { author_id: user.id },
  });

  const flagCount = await Flag.count({
    where: { flagged_by: user.id },
  });

  res.json({
    ...user.toJSON(),
    stats: {
      posts: postCount,
      flags: flagCount,
    },
  });
}));

// Update user profile
router.patch('/:id', [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  handleValidationErrors,
], asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const userId = req.params.id;

  // Check if user can update this profile
  if (req.user!.id !== userId && req.user!.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to update this profile' });
  }

  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if email is already taken
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    user.email = email;
  }

  if (name) {
    user.name = name;
  }

  await user.save();

  res.json(user.toJSON());
}));

// Admin routes for user management
router.get('/', requireRole(['admin']), asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const role = req.query.role as string;

  const offset = (page - 1) * limit;
  const whereClause: any = {};

  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (role) {
    whereClause.role = role;
  }

  const { count, rows: users } = await User.findAndCountAll({
    where: whereClause,
    attributes: { exclude: ['password_hash'] },
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  res.json({
    users,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    total: count,
  });
}));

// Update user role (admin only)
router.patch('/:id/role', requireRole(['admin']), [
  body('role').isIn(['user', 'moderator', 'admin']).withMessage('Invalid role'),
  handleValidationErrors,
], asyncHandler(async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.role = role;
  await user.save();

  res.json({
    message: 'User role updated successfully',
    user: user.toJSON(),
  });
}));

export default router;