import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { validateRegistration, validateLogin } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', validateRegistration, asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create user
  const user = await User.create({ email, name, role: 'user' });
  await user.setPassword(password);
  await user.save();

  // Generate JWT
  const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret';
  const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '7d' });


  res.status(201).json({
    message: 'User created successfully',
    token,
    user: user.toJSON(),
  });
}));

// Login
router.post('/login', validateLogin, asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Validate password
  const isValidPassword = await user.validatePassword(password);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate JWT
  const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret';
  const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '7d' });


  res.json({
    message: 'Login successful',
    token,
    user: user.toJSON(),
  });
}));

// Get current user
router.get('/me', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  res.json(req.user);
}));

// OAuth routes (placeholder for Google/GitHub)
router.get('/oauth/google', (req, res) => {
  res.status(501).json({ message: 'OAuth not implemented yet' });
});

router.get('/oauth/github', (req, res) => {
  res.status(501).json({ message: 'OAuth not implemented yet' });
});

export default router;