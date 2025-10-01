import OpenAI from 'openai';
import { AIAnalysis } from '../models/AIAnalysis';
import { Post } from '../models/Post';

interface TextAnalysisResult {
  labels: string[];
  scores: Record<string, number>;
  overall_risk: number;
  raw_response: any;
}

interface ImageAnalysisResult {
  labels: string[];
  scores: Record<string, number>;
  overall_risk: number;
  raw_response: any;
}

class AIService {
  private openai: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async analyzeText(text: string, postId?: string): Promise<TextAnalysisResult> {
    if (!this.openai) {
      // Return mock data for development/testing
      return this.getMockTextAnalysis(text);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a content moderation AI. Analyze the following text for harmful content and return a JSON response with:
            - labels: array of detected issues (toxicity, hate_speech, harassment, spam, violence, sexual_content, self_harm)
            - scores: object with confidence scores (0-1) for each category
            - overall_risk: single risk score (0-1)
            - explanation: brief explanation of the analysis
            
            Be objective and consider context. Return only valid JSON.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      const analysis = JSON.parse(content);
      
      const result: TextAnalysisResult = {
        labels: analysis.labels || [],
        scores: analysis.scores || {},
        overall_risk: analysis.overall_risk || 0,
        raw_response: response,
      };

      // Save analysis to database if postId provided
      if (postId) {
        await AIAnalysis.create({
          post_id: postId,
          type: 'text',
          raw_response: response,
          labels: result.labels,
          scores: result.scores,
          overall_risk: result.overall_risk,
        });
      }

      return result;
    } catch (error) {
      console.error('AI text analysis error:', error);
      return this.getMockTextAnalysis(text);
    }
  }

  async analyzeImage(imageUrl: string, postId?: string): Promise<ImageAnalysisResult> {
    if (!this.openai) {
      return this.getMockImageAnalysis();
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: `You are a content moderation AI for images. Analyze the image for harmful content and return JSON with:
            - labels: array of detected issues (nudity, violence, hate_symbols, graphic_content, inappropriate)
            - scores: confidence scores (0-1) for each category
            - overall_risk: single risk score (0-1)
            - explanation: brief explanation
            
            Return only valid JSON.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          }
        ],
        max_tokens: 500,
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      const analysis = JSON.parse(content);
      
      const result: ImageAnalysisResult = {
        labels: analysis.labels || [],
        scores: analysis.scores || {},
        overall_risk: analysis.overall_risk || 0,
        raw_response: response,
      };

      // Save analysis to database if postId provided
      if (postId) {
        await AIAnalysis.create({
          post_id: postId,
          type: 'image',
          raw_response: response,
          labels: result.labels,
          scores: result.scores,
          overall_risk: result.overall_risk,
        });
      }

      return result;
    } catch (error) {
      console.error('AI image analysis error:', error);
      return this.getMockImageAnalysis();
    }
  }

  private getMockTextAnalysis(text: string): TextAnalysisResult {
    // Simple mock analysis based on keywords
    const toxicWords = ['hate', 'stupid', 'idiot', 'kill', 'die'];
    const spamWords = ['buy now', 'click here', 'free money', 'urgent'];
    
    const lowerText = text.toLowerCase();
    const labels: string[] = [];
    const scores: Record<string, number> = {
      toxicity: 0,
      hate_speech: 0,
      harassment: 0,
      spam: 0,
      violence: 0,
      sexual_content: 0,
    };

    // Check for toxic content
    const toxicCount = toxicWords.filter(word => lowerText.includes(word)).length;
    if (toxicCount > 0) {
      labels.push('toxicity');
      scores.toxicity = Math.min(toxicCount * 0.3, 0.9);
    }

    // Check for spam
    const spamCount = spamWords.filter(word => lowerText.includes(word)).length;
    if (spamCount > 0) {
      labels.push('spam');
      scores.spam = Math.min(spamCount * 0.4, 0.8);
    }

    const overall_risk = Math.max(...Object.values(scores));

    return {
      labels,
      scores,
      overall_risk,
      raw_response: { mock: true, analysis: 'Mock analysis for development' },
    };
  }

  private getMockImageAnalysis(): ImageAnalysisResult {
    // Random mock analysis for images
    const possibleLabels = ['safe_content', 'text_overlay', 'people'];
    const labels = [possibleLabels[Math.floor(Math.random() * possibleLabels.length)]];
    
    const scores = {
      nudity: Math.random() * 0.2,
      violence: Math.random() * 0.1,
      inappropriate: Math.random() * 0.15,
    };

    return {
      labels,
      scores,
      overall_risk: Math.max(...Object.values(scores)),
      raw_response: { mock: true, analysis: 'Mock image analysis for development' },
    };
  }

  async shouldAutoRemove(riskScore: number): Promise<boolean> {
    const threshold = parseFloat(process.env.AUTO_REMOVE_THRESHOLD || '0.9');
    return riskScore >= threshold;
  }

  async shouldFlag(riskScore: number): Promise<boolean> {
    const threshold = parseFloat(process.env.FLAG_REVIEW_THRESHOLD || '0.6');
    return riskScore >= threshold;
  }
}

export const aiService = new AIService();