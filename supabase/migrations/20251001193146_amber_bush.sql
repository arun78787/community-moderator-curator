-- Insert sample AI analysis data for some posts
INSERT INTO ai_analysis (id, post_id, type, raw_response, labels, scores, overall_risk, created_at) VALUES
-- Analysis for spam posts (high risk)
('950e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440016', 'text', 
 '{"model": "gpt-4", "analysis": "Detected promotional language and spam indicators"}',
 ARRAY['spam', 'promotional'],
 '{"spam": 0.85, "toxicity": 0.1, "harassment": 0.05}',
 0.85, NOW() - INTERVAL '8 hours'),

('950e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440018', 'text',
 '{"model": "gpt-4", "analysis": "Clear spam content with financial scam indicators"}',
 ARRAY['spam', 'scam', 'financial'],
 '{"spam": 0.92, "toxicity": 0.15, "harassment": 0.08}',
 0.92, NOW() - INTERVAL '4 hours'),

('950e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440036', 'text',
 '{"model": "gpt-4", "analysis": "Commercial promotional content"}',
 ARRAY['spam', 'commercial'],
 '{"spam": 0.78, "toxicity": 0.05, "harassment": 0.02}',
 0.78, NOW() - INTERVAL '3 hours'),

('950e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440038', 'text',
 '{"model": "gpt-4", "analysis": "Urgent call-to-action spam pattern detected"}',
 ARRAY['spam', 'urgent', 'promotional'],
 '{"spam": 0.88, "toxicity": 0.12, "harassment": 0.06}',
 0.88, NOW() - INTERVAL '1 hour'),

-- Analysis for normal posts (low risk)
('950e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', 'text',
 '{"model": "gpt-4", "analysis": "Positive community welcome message"}',
 ARRAY['positive', 'community'],
 '{"spam": 0.02, "toxicity": 0.01, "harassment": 0.01}',
 0.02, NOW() - INTERVAL '5 days'),

('950e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440002', 'text',
 '{"model": "gpt-4", "analysis": "Educational content about AI ethics"}',
 ARRAY['educational', 'positive'],
 '{"spam": 0.01, "toxicity": 0.02, "harassment": 0.01}',
 0.02, NOW() - INTERVAL '4 days'),

('950e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440003', 'text',
 '{"model": "gpt-4", "analysis": "Restaurant recommendation and community discussion"}',
 ARRAY['recommendation', 'community'],
 '{"spam": 0.05, "toxicity": 0.01, "harassment": 0.01}',
 0.05, NOW() - INTERVAL '4 days'),

('950e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440004', 'text',
 '{"model": "gpt-4", "analysis": "Technical discussion about programming"}',
 ARRAY['technical', 'educational'],
 '{"spam": 0.03, "toxicity": 0.01, "harassment": 0.01}',
 0.03, NOW() - INTERVAL '3 days'),

-- Analysis for potentially problematic content (medium risk)
('950e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440037', 'text',
 '{"model": "gpt-4", "analysis": "Content flagged for potential inappropriateness"}',
 ARRAY['potentially_inappropriate'],
 '{"spam": 0.15, "toxicity": 0.45, "harassment": 0.25}',
 0.45, NOW() - INTERVAL '2 hours'),

('950e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440039', 'text',
 '{"model": "gpt-4", "analysis": "Controversial content requiring human review"}',
 ARRAY['controversial', 'requires_review'],
 '{"spam": 0.08, "toxicity": 0.52, "harassment": 0.18}',
 0.52, NOW() - INTERVAL '45 minutes'),

-- More analysis for variety
('950e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440005', 'text',
 '{"model": "gpt-4", "analysis": "Positive nature appreciation content"}',
 ARRAY['positive', 'nature'],
 '{"spam": 0.01, "toxicity": 0.01, "harassment": 0.01}',
 0.01, NOW() - INTERVAL '3 days'),

('950e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440011', 'text',
 '{"model": "gpt-4", "analysis": "Helpful productivity tips"}',
 ARRAY['helpful', 'productivity'],
 '{"spam": 0.02, "toxicity": 0.01, "harassment": 0.01}',
 0.02, NOW() - INTERVAL '18 hours'),

('950e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440019', 'text',
 '{"model": "gpt-4", "analysis": "Photography educational content"}',
 ARRAY['educational', 'photography'],
 '{"spam": 0.03, "toxicity": 0.01, "harassment": 0.01}',
 0.03, NOW() - INTERVAL '2 hours'),

('950e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440020', 'text',
 '{"model": "gpt-4", "analysis": "Community event promotion"}',
 ARRAY['community', 'event'],
 '{"spam": 0.08, "toxicity": 0.01, "harassment": 0.01}',
 0.08, NOW() - INTERVAL '1 hour'),

('950e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440025', 'text',
 '{"model": "gpt-4", "analysis": "Volunteer opportunity - positive community content"}',
 ARRAY['volunteer', 'community', 'positive'],
 '{"spam": 0.02, "toxicity": 0.01, "harassment": 0.01}',
 0.02, NOW())

ON CONFLICT (id) DO NOTHING;