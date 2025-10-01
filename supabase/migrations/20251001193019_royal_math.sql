-- Insert sample posts
INSERT INTO posts (id, author_id, content, status, created_at) VALUES
-- Posts by various users
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'Welcome to our community! Looking forward to great discussions.', 'active', NOW() - INTERVAL '5 days'),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'Just finished reading an amazing book about AI ethics. Highly recommend it!', 'active', NOW() - INTERVAL '4 days'),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', 'Has anyone tried the new restaurant downtown? The reviews look promising.', 'active', NOW() - INTERVAL '4 days'),
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440007', 'Working on a new project using React and TypeScript. The developer experience is fantastic!', 'active', NOW() - INTERVAL '3 days'),
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440008', 'Beautiful sunset today! Nature never fails to amaze me.', 'active', NOW() - INTERVAL '3 days'),
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440009', 'Question about database optimization: What are your favorite indexing strategies?', 'active', NOW() - INTERVAL '2 days'),
('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440010', 'Attended a great conference on sustainable technology. Lots of innovative ideas!', 'active', NOW() - INTERVAL '2 days'),
('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', 'Coffee shop recommendation: The new place on Main Street has excellent espresso.', 'active', NOW() - INTERVAL '1 day'),
('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', 'Learning Docker and containerization. Any tips for beginners?', 'active', NOW() - INTERVAL '1 day'),
('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440006', 'Movie night recommendations? Looking for something in the sci-fi genre.', 'active', NOW() - INTERVAL '20 hours'),

-- More posts for variety
('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440007', 'Tips for remote work productivity: 1) Dedicated workspace 2) Regular breaks 3) Clear boundaries', 'active', NOW() - INTERVAL '18 hours'),
('650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440008', 'Gardening season is here! Started my tomato seedlings today.', 'active', NOW() - INTERVAL '16 hours'),
('650e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440009', 'Interesting article about renewable energy trends. The future looks bright!', 'active', NOW() - INTERVAL '14 hours'),
('650e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440010', 'Weekend hiking trip was amazing. The mountain views were breathtaking!', 'active', NOW() - INTERVAL '12 hours'),
('650e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440004', 'Cooking experiment: Tried making homemade pasta. Results were surprisingly good!', 'active', NOW() - INTERVAL '10 hours'),

-- Some posts that might be flagged
('650e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440005', 'This is spam content trying to sell you something you dont need! Click here now!', 'active', NOW() - INTERVAL '8 hours'),
('650e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440006', 'I disagree with the previous post, but lets keep the discussion respectful.', 'active', NOW() - INTERVAL '6 hours'),
('650e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440007', 'Free money! Get rich quick! This is definitely not a scam!', 'active', NOW() - INTERVAL '4 hours'),
('650e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440008', 'Photography tips: Golden hour lighting makes everything look better.', 'active', NOW() - INTERVAL '2 hours'),
('650e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440009', 'Local community event next weekend. Hope to see everyone there!', 'active', NOW() - INTERVAL '1 hour'),

-- Additional posts for more content
('650e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440010', 'Book club meeting tomorrow. Were discussing "The Future of Work".', 'active', NOW() - INTERVAL '30 minutes'),
('650e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440004', 'Fitness journey update: Completed my first 5K run today!', 'active', NOW() - INTERVAL '15 minutes'),
('650e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440005', 'Weather forecast looks great for the weekend. Perfect for outdoor activities!', 'active', NOW() - INTERVAL '10 minutes'),
('650e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440006', 'Tech meetup was informative. Learned about new frameworks and tools.', 'active', NOW() - INTERVAL '5 minutes'),
('650e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440007', 'Volunteer opportunity at the local shelter. Great way to give back to the community.', 'active', NOW()),

-- Some older posts
('650e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440008', 'Travel memories: Last years trip to Japan was unforgettable.', 'active', NOW() - INTERVAL '7 days'),
('650e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440009', 'Learning a new language is challenging but rewarding. Practice makes perfect!', 'active', NOW() - INTERVAL '6 days'),
('650e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440010', 'Home improvement project: Finally finished the kitchen renovation.', 'active', NOW() - INTERVAL '8 days'),
('650e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440004', 'Music recommendation: Discovered a great new indie band last week.', 'active', NOW() - INTERVAL '9 days'),
('650e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440005', 'Pet care tips: Regular vet checkups are essential for your furry friends.', 'active', NOW() - INTERVAL '10 days'),

-- Posts with different content types
('650e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440006', 'Code review best practices: 1) Be constructive 2) Focus on the code, not the person 3) Explain the why', 'active', NOW() - INTERVAL '11 days'),
('650e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440007', 'Environmental tip: Reduce, reuse, recycle. Small actions make a big difference.', 'active', NOW() - INTERVAL '12 days'),
('650e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440008', 'Art exhibition opening next month. The local gallery is showcasing emerging artists.', 'active', NOW() - INTERVAL '13 days'),
('650e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440009', 'Productivity hack: Time-blocking has revolutionized my daily schedule.', 'active', NOW() - INTERVAL '14 days'),
('650e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440010', 'Community garden project is growing! Thanks to all the volunteers.', 'active', NOW() - INTERVAL '15 days'),

-- Some posts that will be flagged
('650e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440004', 'Buy now! Limited time offer! Dont miss out on this amazing deal!', 'active', NOW() - INTERVAL '3 hours'),
('650e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440005', 'This content might be considered inappropriate by some users.', 'active', NOW() - INTERVAL '2 hours'),
('650e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440006', 'Urgent! Act now! Make money fast with this one weird trick!', 'active', NOW() - INTERVAL '1 hour'),
('650e8400-e29b-41d4-a716-446655440039', '550e8400-e29b-41d4-a716-446655440007', 'Sharing some controversial opinions that might need moderation.', 'active', NOW() - INTERVAL '45 minutes'),
('650e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440008', 'Final post for our sample data. Thanks for reading!', 'active', NOW() - INTERVAL '30 minutes')

ON CONFLICT (id) DO NOTHING;