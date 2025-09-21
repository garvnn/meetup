-- PennApps Private Meetups Seed Data
-- Run this after schema.sql for local demo

-- Insert test users
INSERT INTO users (id, clerk_id, handle, photo_url) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'user_2test123456789', 'testhost', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'),
    ('550e8400-e29b-41d4-a716-446655440001', 'user_2test123456790', 'testmember1', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'),
    ('550e8400-e29b-41d4-a716-446655440002', 'user_2test123456791', 'testmember2', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face');

-- Insert test meetup (starting in 30 minutes, ending in 2 hours)
INSERT INTO meetups (
    id,
    host_id,
    title,
    desc,
    start_ts,
    end_ts,
    lat,
    lng,
    attendee_count
) VALUES (
    '660e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    'PennApps XXVI 2025',
    'PennApps XXVI - Fall 2025 Hackathon! 36-hour coding marathon with free food, workshops, and networking. Open to all students.',
    NOW() + INTERVAL '30 minutes',
    NOW() + INTERVAL '2 hours',
    39.9505,
    -75.1910,
    1200
);

-- Insert memberships
INSERT INTO memberships (meetup_id, user_id, role, joined_at) VALUES
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'host', NOW() - INTERVAL '1 hour'),
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'member', NOW() - INTERVAL '45 minutes'),
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'member', NOW() - INTERVAL '30 minutes');

-- Insert invite token
INSERT INTO invite_tokens (id, meetup_id, token, expires_at, created_by) VALUES
    ('770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'test123abc', NOW() + INTERVAL '2 hours', '550e8400-e29b-41d4-a716-446655440000');

-- Insert test messages
INSERT INTO messages (meetup_id, user_id, type, text, created_at) VALUES
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'announcement', 'Welcome everyone! The meetup will start in 30 minutes. Please bring your laptops and any project ideas you want to work on.', NOW() - INTERVAL '1 hour'),
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'chat', 'Excited to be here! I have some ideas for a mobile app we could work on.', NOW() - INTERVAL '45 minutes'),
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'chat', 'Sounds great! I have experience with React Native if that helps.', NOW() - INTERVAL '30 minutes'),
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'chat', 'Perfect! We can start brainstorming once everyone arrives.', NOW() - INTERVAL '15 minutes');

-- Insert test files (simulated - in real app these would be uploaded to storage)
INSERT INTO files (meetup_id, user_id, type, storage_path, filename, size_bytes, note_title, note_body) VALUES
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'note', 'meetups/660e8400-e29b-41d4-a716-446655440000/notes/meeting-agenda.txt', 'Meeting Agenda', 1024, 'Meeting Agenda', '1. Introductions\n2. Project brainstorming\n3. Team formation\n4. Development time\n5. Demo and wrap-up'),
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'note', 'meetups/660e8400-e29b-41d4-a716-446655440000/notes/project-ideas.txt', 'Project Ideas', 512, 'Project Ideas', 'Mobile app ideas:\n- Task management app\n- Social networking app\n- Educational platform\n- Fitness tracker');

-- Update file stats
UPDATE meetups SET 
    files_count = 2,
    total_bytes = 1536
WHERE id = '660e8400-e29b-41d4-a716-446655440000';

-- Create a second test meetup (already ended)
INSERT INTO meetups (
    id,
    host_id,
    title,
    desc,
    start_ts,
    end_ts,
    lat,
    lng,
    ended_at,
    attendee_count
) VALUES (
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Previous Study Session',
    'This was our previous study session that has already ended.',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' + INTERVAL '2 hours',
    39.9526,
    -75.1652,
    NOW() - INTERVAL '1 day' + INTERVAL '2 hours',
    2
);

-- Insert membership for ended meetup
INSERT INTO memberships (meetup_id, user_id, role, joined_at) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'host', NOW() - INTERVAL '1 day' - INTERVAL '1 hour'),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'member', NOW() - INTERVAL '1 day' - INTERVAL '30 minutes');

-- Insert messages for ended meetup
INSERT INTO messages (meetup_id, user_id, type, text, created_at) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'announcement', 'Thanks everyone for a great study session!', NOW() - INTERVAL '1 day' + INTERVAL '2 hours' - INTERVAL '5 minutes'),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'chat', 'It was really helpful, thanks for organizing!', NOW() - INTERVAL '1 day' + INTERVAL '2 hours' - INTERVAL '2 minutes');

-- Create a third test meetup (future meetup)
INSERT INTO meetups (
    id,
    host_id,
    title,
    desc,
    start_ts,
    end_ts,
    lat,
    lng,
    attendee_count
) VALUES (
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    'Future Project Planning',
    'Planning session for our next big project. All ideas welcome!',
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day' + INTERVAL '3 hours',
    39.9526,
    -75.1652,
    1
);

-- Insert membership for future meetup
INSERT INTO memberships (meetup_id, user_id, role, joined_at) VALUES
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'host', NOW() - INTERVAL '1 hour');

-- Insert invite token for future meetup
INSERT INTO invite_tokens (id, meetup_id, token, expires_at, created_by) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'future456def', NOW() + INTERVAL '1 day' + INTERVAL '3 hours', '550e8400-e29b-41d4-a716-446655440002');

-- Insert a test report (to demonstrate reporting functionality)
INSERT INTO reports (meetup_id, target_type, target_id, reporter_id, reason, created_at) VALUES
    ('660e8400-e29b-41d4-a716-446655440000', 'message', (SELECT id FROM messages WHERE text LIKE '%mobile app%' LIMIT 1), '550e8400-e29b-41d4-a716-446655440000', 'Test report for demonstration', NOW() - INTERVAL '10 minutes');

-- Create a test user with soft-ban status
INSERT INTO users (id, clerk_id, handle, photo_url) VALUES
    ('550e8400-e29b-41d4-a716-446655440003', 'user_2test123456792', 'softbanneduser', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face');

-- Insert membership with soft-ban
INSERT INTO memberships (meetup_id, user_id, role, soft_banned, soft_ban_reason, joined_at) VALUES
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'member', true, 'Test soft-ban for demonstration', NOW() - INTERVAL '2 hours');

-- Insert soft-ban event
INSERT INTO soft_ban_events (meetup_id, target_user_id, enacted_by, reason, created_at) VALUES
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Test soft-ban event', NOW() - INTERVAL '1 hour');

-- Update attendee count for the main meetup
UPDATE meetups SET attendee_count = 4 WHERE id = '660e8400-e29b-41d4-a716-446655440000';

-- Insert some additional test reports to demonstrate the soft-ban threshold
INSERT INTO reports (meetup_id, target_type, target_id, reporter_id, reason, created_at) VALUES
    ('660e8400-e29b-41d4-a716-446655440000', 'user', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Inappropriate behavior', NOW() - INTERVAL '5 minutes'),
    ('660e8400-e29b-41d4-a716-446655440000', 'user', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Spam messages', NOW() - INTERVAL '3 minutes');

-- Display summary of seeded data
SELECT 
    'Users' as table_name, 
    COUNT(*) as count 
FROM users
UNION ALL
SELECT 
    'Meetups' as table_name, 
    COUNT(*) as count 
FROM meetups
UNION ALL
SELECT 
    'Memberships' as table_name, 
    COUNT(*) as count 
FROM memberships
UNION ALL
SELECT 
    'Messages' as table_name, 
    COUNT(*) as count 
FROM messages
UNION ALL
SELECT 
    'Files' as table_name, 
    COUNT(*) as count 
FROM files
UNION ALL
SELECT 
    'Invite Tokens' as table_name, 
    COUNT(*) as count 
FROM invite_tokens
UNION ALL
SELECT 
    'Reports' as table_name, 
    COUNT(*) as count 
FROM reports
UNION ALL
SELECT 
    'Soft Ban Events' as table_name, 
    COUNT(*) as count 
FROM soft_ban_events;
