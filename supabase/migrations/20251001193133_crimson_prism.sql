-- Insert sample moderation logs for resolved flags
INSERT INTO moderation_logs (id, moderator_id, flag_id, action, notes, created_at) VALUES
-- Actions by moderator 1
('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440007', 'approve', 'Content is appropriate - book recommendation is valuable to community', NOW() - INTERVAL '2 days'),
('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440008', 'approve', 'Restaurant recommendation is helpful community content', NOW() - INTERVAL '1 day'),
('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440009', 'approve', 'Technical discussion promotes learning and knowledge sharing', NOW() - INTERVAL '12 hours'),

-- Actions by moderator 2
('850e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440010', 'approve', 'Nature appreciation post adds positive value to community', NOW() - INTERVAL '6 hours')

ON CONFLICT (id) DO NOTHING;