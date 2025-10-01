import express from 'express';
import { aiService } from '../services/aiService';
import { requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// AI routes require moderator or admin role
router.use(requireRole(['moderator', 'admin']));

// Analyze text
router.post('/analyze-text', [
  body('text').notEmpty().withMessage('Text is required'),
  body('postId').optional().isUUID().withMessage('Invalid post ID'),
  handleValidationErrors,
], asyncHandler(async (req, res) => {
  const { text, postId, context } = req.body;

  const analysis = await aiService.analyzeText(text, postId);

  res.json({
    success: true,
    analysis,
    recommendations: {
      shouldAutoRemove: await aiService.shouldAutoRemove(analysis.overall_risk),
      shouldFlag: await aiService.shouldFlag(analysis.overall_risk),
    },
  });
}));

// Analyze image
router.post('/analyze-image', [
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
  body('postId').optional().isUUID().withMessage('Invalid post ID'),
  handleValidationErrors,
], asyncHandler(async (req, res) => {
  const { imageUrl, postId } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ message: 'Image URL is required' });
  }

  const analysis = await aiService.analyzeImage(imageUrl, postId);

  res.json({
    success: true,
    analysis,
    recommendations: {
      shouldAutoRemove: await aiService.shouldAutoRemove(analysis.overall_risk),
      shouldFlag: await aiService.shouldFlag(analysis.overall_risk),
    },
  });
}));

// Get AI configuration
router.get('/config', asyncHandler(async (req, res) => {
  res.json({
    thresholds: {
      auto_remove: parseFloat(process.env.AUTO_REMOVE_THRESHOLD || '0.9'),
      flag_review: parseFloat(process.env.FLAG_REVIEW_THRESHOLD || '0.6'),
    },
    providers: {
      text: process.env.OPENAI_API_KEY ? 'OpenAI GPT-4' : 'Mock Provider',
      image: process.env.OPENAI_API_KEY ? 'OpenAI GPT-4V' : 'Mock Provider',
    },
  });
}));

export default router;