-- Insert sample users
-- Note: In a real application, passwords would be properly hashed
-- These are bcrypt hashes for 'password123'

INSERT INTO users (id, email, name, role, password_hash, reputation_score) VALUES
-- Admin user
('550e8400-e29b-41d4-a716-446655440001', 'admin@example.com', 'Admin User', 'admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJBzwESWy', 100),

-- Moderator users
('550e8400-e29b-41d4-a716-446655440002', 'moderator1@example.com', 'Jane Moderator', 'moderator', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJBzwESWy', 75),
('550e8400-e29b-41d4-a716-446655440003', 'moderator2@example.com', 'Bob Moderator', 'moderator', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJBzwESWy', 80),

-- Regular users
('550e8400-e29b-41d4-a716-446655440004', 'user1@example.com', 'Alice Johnson', 'user', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJBzwESWy', 45),
('550e8400-e29b-41d4-a716-446655440005', 'user2@example.com', 'Charlie Brown', 'user', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJBzwESWy', 32),
('550e8400-e29b-41d4-a716-446655440006', 'user3@example.com', 'Diana Prince', 'user', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJBzwESWy', 28),
('550e8400-e29b-41d4-a716-446655440007', 'user4@example.com', 'Edward Smith', 'user', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJBzwESWy', 15),
('550e8400-e29b-41d4-a716-446655440008', 'user5@example.com', 'Fiona Green', 'user', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJBzwESWy', 22),
('550e8400-e29b-41d4-a716-446655440009', 'user6@example.com', 'George Wilson', 'user', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJBzwESWy', 38),
('550e8400-e29b-41d4-a716-446655440010', 'user7@example.com', 'Helen Davis', 'user', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJBzwESWy', 41)
ON CONFLICT (email) DO NOTHING;