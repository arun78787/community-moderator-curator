import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

export const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  handleValidationErrors,
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

export const validatePost = [
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Content must be between 1 and 2000 characters'),
  handleValidationErrors,
];

export const validateFlag = [
  body('post_id').isUUID().withMessage('Valid post ID is required'),
  body('reason_category').isIn(['spam', 'harassment', 'hate-speech', 'violence', 'nudity', 'misinformation', 'copyright', 'other']),
  body('reason_text').optional().trim().isLength({ max: 500 }).withMessage('Reason text must be less than 500 characters'),
  handleValidationErrors,
];

export const validateModerationAction = [
  body('action').isIn(['approve', 'remove', 'escalate']).withMessage('Invalid action'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters'),
  handleValidationErrors,
];