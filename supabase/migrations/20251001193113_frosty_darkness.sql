-- Insert sample flags for some posts
INSERT INTO flags (id, post_id, flagged_by, reason_category, reason_text, status, created_at) VALUES
-- Spam flags
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440004', 'spam', 'This looks like spam content trying to sell something', 'pending', NOW() - INTERVAL '7 hours'),
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440009', 'spam', 'Obvious get-rich-quick scheme', 'pending', NOW() - INTERVAL '3 hours'),
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440010', 'spam', 'Promotional content that doesnt belong here', 'pending', NOW() - INTERVAL '2 hours'),
('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440008', 'spam', 'Another spam post with urgent call to action', 'pending', NOW() - INTERVAL '30 minutes'),

-- Other category flags
('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440007', 'other', 'Content might be inappropriate for general audience', 'pending', NOW() - INTERVAL '1 hour'),
('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440039', '550e8400-e29b-41d4-a716-446655440006', 'other', 'Controversial content that needs review', 'pending', NOW() - INTERVAL '15 minutes'),

-- Some resolved flags (for analytics)
('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440008', 'other', 'False alarm - content is fine', 'approved', NOW() - INTERVAL '2 days'),
('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440009', 'spam', 'Not spam, just a restaurant recommendation', 'approved', NOW() - INTERVAL '1 day'),
('750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440010', 'other', 'Technical discussion is appropriate', 'approved', NOW() - INTERVAL '12 hours'),
('750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440007', 'other', 'Nature post is perfectly fine', 'approved', NOW() - INTERVAL '6 hours')

ON CONFLICT (id) DO NOTHING;