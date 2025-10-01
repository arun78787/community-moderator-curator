# Moderation Workflow Documentation

This document describes the AI-powered moderation workflow, human-in-the-loop processes, and how moderator decisions are stored and utilized.

## Overview

The Community Moderator platform implements a hybrid approach combining AI automation with human oversight to ensure effective and fair content moderation. The system is designed to scale while maintaining high accuracy and community trust.

## AI Analysis Pipeline

### Text Analysis Workflow

1. **Content Submission**
   - User submits a post with text content
   - Content is immediately queued for AI analysis
   - Post is initially set to 'active' status (visible to users)

2. **AI Processing**
   - Text is sent to configured AI provider (OpenAI GPT-4 by default)
   - Analysis returns:
     - **Labels**: Array of detected issues (toxicity, hate_speech, harassment, spam, violence, sexual_content, self_harm)
     - **Scores**: Confidence scores (0-1) for each category
     - **Overall Risk**: Single aggregated risk score (0-1)
     - **Raw Response**: Complete AI provider response for audit

3. **Threshold-Based Actions**
   ```
   if (overall_risk >= AUTO_REMOVE_THRESHOLD) {
     // Automatically remove content
     post.status = 'removed'
     // Optional: notify user of removal
   } else if (overall_risk >= FLAG_REVIEW_THRESHOLD) {
     // Flag for human review
     create_flag(post_id, reason: 'AI_FLAGGED', auto_generated: true)
     // Notify moderators
   } else {
     // Content passes automated screening
     // No action required
   }
   ```

### Image Analysis Workflow

1. **Image Upload**
   - User uploads image with post
   - Image is stored securely with access controls
   - Image URL is queued for AI analysis

2. **AI Processing**
   - Image is analyzed using vision model (GPT-4V by default)
   - Analysis detects:
     - **Content Categories**: nudity, violence, hate_symbols, graphic_content, inappropriate
     - **Confidence Scores**: Per-category risk assessment
     - **Bounding Boxes**: Location of detected content (if supported)
     - **Overall Risk**: Aggregated risk score

3. **Action Determination**
   - Same threshold logic as text analysis
   - Image-specific thresholds can be configured separately
   - Failed analysis defaults to human review

## Human-in-the-Loop Process

### Moderation Queue

The moderation queue is the central hub for human reviewers:

```sql
-- Queue prioritization logic
SELECT f.*, p.*, ai.overall_risk
FROM flags f
JOIN posts p ON f.post_id = p.id
LEFT JOIN ai_analysis ai ON p.id = ai.post_id
WHERE f.status = 'pending'
ORDER BY 
  ai.overall_risk DESC,  -- Highest risk first
  f.created_at ASC       -- Oldest flags first
```

### Moderator Actions

Moderators can take three primary actions:

1. **Approve** (`approve`)
   - Content is deemed appropriate
   - Flag is marked as resolved
   - User reputation may increase
   - Content remains visible

2. **Remove** (`remove`)
   - Content violates community guidelines
   - Post status changed to 'removed'
   - Content becomes invisible to users
   - User reputation decreases
   - User may receive notification

3. **Escalate** (`escalate`)
   - Complex case requiring senior review
   - Flag moved to escalation queue
   - Senior moderators/admins notified
   - Original content remains in current state

### Decision Recording

Every moderation action is logged:

```typescript
interface ModerationLog {
  id: string;
  moderator_id: string;
  flag_id: string;
  action: 'approve' | 'remove' | 'escalate';
  notes: string;
  created_at: Date;
}
```

## AI Threshold Configuration

### Default Thresholds

```env
AUTO_REMOVE_THRESHOLD=0.9    # 90% confidence for automatic removal
FLAG_REVIEW_THRESHOLD=0.6    # 60% confidence for human review
```

### Category-Specific Thresholds

Administrators can configure different thresholds per content category:

```json
{
  "thresholds": {
    "spam": {
      "auto_remove": 0.85,
      "flag_review": 0.6
    },
    "hate_speech": {
      "auto_remove": 0.95,
      "flag_review": 0.5
    },
    "violence": {
      "auto_remove": 0.9,
      "flag_review": 0.7
    }
  }
}
```

### Threshold Tuning

Regular analysis of moderation outcomes helps optimize thresholds:

1. **False Positive Analysis**
   - Content flagged by AI but approved by humans
   - May indicate thresholds are too low
   - Consider raising FLAG_REVIEW_THRESHOLD

2. **False Negative Analysis**
   - Problematic content missed by AI
   - May indicate thresholds are too high
   - Consider lowering thresholds or improving AI prompts

3. **Efficiency Metrics**
   - Percentage of flags requiring human review
   - Average time to resolution
   - Moderator workload distribution

## Feedback Loop and Learning

### Data Collection

The system collects comprehensive data for continuous improvement:

```sql
-- Training data extraction
SELECT 
  ai.labels,
  ai.scores,
  ai.overall_risk,
  ml.action as human_decision,
  ml.notes as human_reasoning,
  p.content,
  p.media_url
FROM ai_analysis ai
JOIN posts p ON ai.post_id = p.id
JOIN flags f ON p.id = f.post_id
JOIN moderation_logs ml ON f.id = ml.flag_id
WHERE ml.created_at >= NOW() - INTERVAL '30 days';
```

### Model Improvement

1. **Disagreement Analysis**
   - Cases where AI and human decisions differ significantly
   - Used to identify AI model weaknesses
   - Inform prompt engineering improvements

2. **Consistency Tracking**
   - Monitor inter-moderator agreement
   - Identify areas needing clearer guidelines
   - Training opportunities for moderation team

3. **Performance Metrics**
   - Precision: True positives / (True positives + False positives)
   - Recall: True positives / (True positives + False negatives)
   - F1 Score: Harmonic mean of precision and recall

## Community-Specific Rules

### Rule Configuration

Each community can customize moderation behavior:

```json
{
  "community_rules": {
    "auto_remove_threshold": 0.9,
    "flag_review_threshold": 0.6,
    "allowed_categories": [
      "spam", "harassment", "hate-speech", 
      "violence", "nudity", "misinformation"
    ],
    "escalation_categories": ["hate-speech", "violence"],
    "auto_approve_below": 0.3,
    "require_multiple_flags": true,
    "trusted_user_threshold": 100
  }
}
```

### Adaptive Thresholds

The system can automatically adjust thresholds based on:

- Community size and activity level
- Historical moderation patterns
- User reputation distributions
- Seasonal content variations

## Real-Time Notifications

### Moderator Alerts

```typescript
// New flag notification
socket.to('moderators').emit('moderation:new-flag', {
  flagId: flag.id,
  postId: post.id,
  reason: flag.reason_category,
  riskScore: aiAnalysis.overall_risk,
  priority: calculatePriority(aiAnalysis, flag),
  estimatedReviewTime: estimateReviewTime(flag.reason_category)
});
```

### User Notifications

```typescript
// Moderation outcome notification
socket.to(`user:${userId}`).emit('moderation:action', {
  action: 'removed',
  postId: post.id,
  reason: 'Community guidelines violation',
  appealProcess: true,
  appealDeadline: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
});
```

## Quality Assurance

### Audit Trail

Complete audit trail for compliance and quality assurance:

1. **Content Lifecycle**
   - Creation timestamp and author
   - AI analysis results and timing
   - Flag creation and details
   - Moderation actions and reasoning
   - Appeal processes (if applicable)

2. **Moderator Performance**
   - Decision consistency metrics
   - Response time tracking
   - Accuracy compared to peer reviews
   - Training completion status

3. **System Performance**
   - AI analysis response times
   - Threshold effectiveness
   - False positive/negative rates
   - User satisfaction metrics

### Regular Reviews

1. **Weekly Reviews**
   - High-risk decisions audit
   - Threshold performance analysis
   - Moderator feedback collection

2. **Monthly Reviews**
   - Community guideline updates
   - AI model performance assessment
   - Threshold optimization

3. **Quarterly Reviews**
   - Comprehensive system evaluation
   - Stakeholder feedback integration
   - Strategic improvements planning

## Error Handling and Fallbacks

### AI Service Failures

```typescript
try {
  const analysis = await aiService.analyzeText(content);
  // Process analysis
} catch (error) {
  // Fallback to human review
  await createFlag(postId, 'AI_SERVICE_ERROR', 'AI analysis failed');
  // Log error for investigation
  logger.error('AI analysis failed', { postId, error });
}
```

### Database Failures

- Graceful degradation with cached results
- Queue-based retry mechanisms
- Manual intervention procedures

### Network Issues

- Offline-capable moderation interface
- Sync mechanisms for reconnection
- Priority queuing for critical actions

## Compliance and Legal Considerations

### Data Retention

- AI analysis results: 2 years
- Moderation logs: 7 years
- User content: Per community policy
- Appeal records: 3 years

### Privacy Protection

- Personal data anonymization in training sets
- GDPR compliance for EU users
- Right to explanation for AI decisions
- Data portability for user content

### Transparency Reports

Regular public reports including:
- Total content processed
- Moderation action statistics
- AI vs human decision rates
- Appeal success rates
- Response time metrics

This workflow ensures fair, efficient, and transparent content moderation while maintaining the flexibility to adapt to different community needs and evolving challenges.