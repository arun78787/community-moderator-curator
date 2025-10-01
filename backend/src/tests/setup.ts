import { sequelize } from '../config/database';

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  
  // Connect to test database
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

// Mock AI service for tests
jest.mock('../services/aiService', () => ({
  aiService: {
    analyzeText: jest.fn().mockResolvedValue({
      labels: ['test'],
      scores: { toxicity: 0.1 },
      overall_risk: 0.1,
      raw_response: { mock: true },
    }),
    analyzeImage: jest.fn().mockResolvedValue({
      labels: ['safe'],
      scores: { nudity: 0.05 },
      overall_risk: 0.05,
      raw_response: { mock: true },
    }),
    shouldAutoRemove: jest.fn().mockResolvedValue(false),
    shouldFlag: jest.fn().mockResolvedValue(false),
  },
}));