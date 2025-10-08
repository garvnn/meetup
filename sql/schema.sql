-- PennApps Private Meetups Database Schema
-- Compatible with Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE role AS ENUM ('host', 'admin', 'member');
CREATE TYPE message_type AS ENUM ('chat', 'announcement');
CREATE TYPE file_type AS ENUM ('image', 'pdf', 'note');
CREATE TYPE target_type AS ENUM ('user', 'message', 'file');
CREATE TYPE visibility AS ENUM ('private', 'public');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,
    handle TEXT UNIQUE NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetups table
CREATE TABLE meetups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_ts TIMESTAMPTZ NOT NULL,
    end_ts TIMESTAMPTZ NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    visibility visibility NOT NULL DEFAULT 'private',
    public_lat DOUBLE PRECISION,
    public_lng DOUBLE PRECISION,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    attendee_count INTEGER DEFAULT 0,
    files_count INTEGER DEFAULT 0,
    total_bytes BIGINT DEFAULT 0
);

-- Memberships table
CREATE TABLE memberships (
    meetup_id UUID NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role role NOT NULL DEFAULT 'member',
    soft_banned BOOLEAN DEFAULT FALSE,
    soft_ban_reason TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (meetup_id, user_id)
);

-- Invite tokens table
CREATE TABLE invite_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meetup_id UUID NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meetup_id UUID NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type message_type NOT NULL DEFAULT 'chat',
    text TEXT NOT NULL,
    parent_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Files table
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meetup_id UUID NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type file_type NOT NULL,
    storage_path TEXT NOT NULL,
    filename TEXT,
    size_bytes BIGINT NOT NULL,
    note_title TEXT,
    note_body TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meetup_id UUID NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
    target_type target_type NOT NULL,
    target_id UUID NOT NULL,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Soft ban events table
CREATE TABLE soft_ban_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meetup_id UUID NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enacted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_meetups_host_id ON meetups(host_id);
CREATE INDEX idx_meetups_start_ts ON meetups(start_ts);
CREATE INDEX idx_meetups_end_ts ON meetups(end_ts);
CREATE INDEX idx_meetups_ended_at ON meetups(ended_at);

CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_soft_banned ON memberships(soft_banned);

CREATE INDEX idx_invite_tokens_meetup_id ON invite_tokens(meetup_id);
CREATE INDEX idx_invite_tokens_token ON invite_tokens(token);
CREATE INDEX idx_invite_tokens_expires_at ON invite_tokens(expires_at);

CREATE INDEX idx_messages_meetup_id_created_at ON messages(meetup_id, created_at);
CREATE INDEX idx_messages_user_id ON messages(user_id);

CREATE INDEX idx_files_meetup_id_created_at ON files(meetup_id, created_at);
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_deleted_at ON files(deleted_at);

CREATE INDEX idx_reports_meetup_id ON reports(meetup_id);
CREATE INDEX idx_reports_target_type_target_id ON reports(target_type, target_id);
CREATE INDEX idx_reports_created_at ON reports(created_at);

CREATE INDEX idx_soft_ban_events_meetup_id ON soft_ban_events(meetup_id);
CREATE INDEX idx_soft_ban_events_target_user_id ON soft_ban_events(target_user_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE soft_ban_events ENABLE ROW LEVEL SECURITY;

-- Users can read their own data and other users' public data
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can view other users' public data" ON users
    FOR SELECT USING (true);

-- Users can update their own data
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Meetups policies
CREATE POLICY "Users can view meetups they're members of" ON meetups
    FOR SELECT USING (
        id IN (
            SELECT meetup_id FROM memberships 
            WHERE user_id IN (
                SELECT id FROM users WHERE clerk_id = auth.uid()::text
            )
        )
    );

CREATE POLICY "Users can view public meetups" ON meetups
    FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can create meetups" ON meetups
    FOR INSERT WITH CHECK (
        host_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    );

CREATE POLICY "Hosts can update their meetups" ON meetups
    FOR UPDATE USING (
        host_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    );

-- Memberships policies
CREATE POLICY "Users can view memberships for their meetups" ON memberships
    FOR SELECT USING (
        meetup_id IN (
            SELECT id FROM meetups WHERE id IN (
                SELECT meetup_id FROM memberships 
                WHERE user_id IN (
                    SELECT id FROM users WHERE clerk_id = auth.uid()::text
                )
            )
        )
    );

CREATE POLICY "Users can insert memberships through controlled flow" ON memberships
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    );

-- Messages policies
CREATE POLICY "Users can view messages for their meetups" ON messages
    FOR SELECT USING (
        meetup_id IN (
            SELECT meetup_id FROM memberships 
            WHERE user_id IN (
                SELECT id FROM users WHERE clerk_id = auth.uid()::text
            )
        )
    );

CREATE POLICY "Users can insert messages for their meetups" ON messages
    FOR INSERT WITH CHECK (
        meetup_id IN (
            SELECT meetup_id FROM memberships 
            WHERE user_id IN (
                SELECT id FROM users WHERE clerk_id = auth.uid()::text
            )
        ) AND
        user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    );

-- Files policies
CREATE POLICY "Users can view files for their meetups" ON files
    FOR SELECT USING (
        meetup_id IN (
            SELECT meetup_id FROM memberships 
            WHERE user_id IN (
                SELECT id FROM users WHERE clerk_id = auth.uid()::text
            )
        ) AND
        deleted_at IS NULL
    );

CREATE POLICY "Users can insert files for their meetups" ON files
    FOR INSERT WITH CHECK (
        meetup_id IN (
            SELECT meetup_id FROM memberships 
            WHERE user_id IN (
                SELECT id FROM users WHERE clerk_id = auth.uid()::text
            )
        ) AND
        user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    );

-- Reports policies
CREATE POLICY "Users can view reports for their meetups" ON reports
    FOR SELECT USING (
        meetup_id IN (
            SELECT meetup_id FROM memberships 
            WHERE user_id IN (
                SELECT id FROM users WHERE clerk_id = auth.uid()::text
            )
        )
    );

CREATE POLICY "Users can insert reports for their meetups" ON reports
    FOR INSERT WITH CHECK (
        meetup_id IN (
            SELECT meetup_id FROM memberships 
            WHERE user_id IN (
                SELECT id FROM users WHERE clerk_id = auth.uid()::text
            )
        ) AND
        reporter_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    );

-- Functions for updating attendee count
CREATE OR REPLACE FUNCTION update_meetup_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE meetups 
        SET attendee_count = (
            SELECT COUNT(*) FROM memberships 
            WHERE meetup_id = NEW.meetup_id
        )
        WHERE id = NEW.meetup_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE meetups 
        SET attendee_count = (
            SELECT COUNT(*) FROM memberships 
            WHERE meetup_id = OLD.meetup_id
        )
        WHERE id = OLD.meetup_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update attendee count
CREATE TRIGGER trigger_update_attendee_count
    AFTER INSERT OR DELETE ON memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_meetup_attendee_count();

-- Function for updating file stats
CREATE OR REPLACE FUNCTION update_meetup_file_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE meetups 
        SET 
            files_count = (
                SELECT COUNT(*) FROM files 
                WHERE meetup_id = NEW.meetup_id AND deleted_at IS NULL
            ),
            total_bytes = (
                SELECT COALESCE(SUM(size_bytes), 0) FROM files 
                WHERE meetup_id = NEW.meetup_id AND deleted_at IS NULL
            )
        WHERE id = NEW.meetup_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE meetups 
        SET 
            files_count = (
                SELECT COUNT(*) FROM files 
                WHERE meetup_id = NEW.meetup_id AND deleted_at IS NULL
            ),
            total_bytes = (
                SELECT COALESCE(SUM(size_bytes), 0) FROM files 
                WHERE meetup_id = NEW.meetup_id AND deleted_at IS NULL
            )
        WHERE id = NEW.meetup_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE meetups 
        SET 
            files_count = (
                SELECT COUNT(*) FROM files 
                WHERE meetup_id = OLD.meetup_id AND deleted_at IS NULL
            ),
            total_bytes = (
                SELECT COALESCE(SUM(size_bytes), 0) FROM files 
                WHERE meetup_id = OLD.meetup_id AND deleted_at IS NULL
            )
        WHERE id = OLD.meetup_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update file stats
CREATE TRIGGER trigger_update_file_stats
    AFTER INSERT OR UPDATE OR DELETE ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_meetup_file_stats();

-- Function to generate fuzzed coordinates for public meetups
CREATE OR REPLACE FUNCTION generate_fuzzed_coords(
    base_lat DOUBLE PRECISION,
    base_lng DOUBLE PRECISION,
    meetup_id UUID
)
RETURNS TABLE(fuzzed_lat DOUBLE PRECISION, fuzzed_lng DOUBLE PRECISION) AS $$
DECLARE
    -- Use meetup_id as seed for deterministic fuzzing
    seed INTEGER;
    offset_meters DOUBLE PRECISION;
    offset_degrees DOUBLE PRECISION;
BEGIN
    -- Generate deterministic seed from meetup_id
    seed := ('x' || substr(meetup_id::text, 1, 8))::bit(32)::int;
    
    -- Random offset between 75-100 meters
    offset_meters := 75 + (seed % 25);
    
    -- Convert meters to degrees (approximate)
    offset_degrees := offset_meters / 111000.0;
    
    -- Apply offset in random direction
    fuzzed_lat := base_lat + (offset_degrees * cos(radians(seed % 360)));
    fuzzed_lng := base_lng + (offset_degrees * sin(radians(seed % 360)));
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Transactional function to create a meetup
CREATE OR REPLACE FUNCTION create_meetup(
    p_host_id UUID,
    p_title TEXT,
    p_start_ts TIMESTAMPTZ,
    p_end_ts TIMESTAMPTZ,
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_desc TEXT DEFAULT NULL,
    p_visibility visibility DEFAULT 'private',
    p_token_ttl_hours INTEGER DEFAULT NULL
)
RETURNS TABLE(
    meetup_id UUID,
    token TEXT,
    deep_link TEXT
) AS $$
DECLARE
    v_meetup_id UUID;
    v_token TEXT;
    v_deep_link TEXT;
    v_expires_at TIMESTAMPTZ;
    v_fuzzed_coords RECORD;
    v_clamped_end_ts TIMESTAMPTZ;
BEGIN
    -- Validate inputs
    IF p_title IS NULL OR length(trim(p_title)) = 0 THEN
        RAISE EXCEPTION 'Title is required';
    END IF;
    
    IF length(p_title) > 200 THEN
        RAISE EXCEPTION 'Title too long (max 200 characters)';
    END IF;
    
    IF p_start_ts >= p_end_ts THEN
        RAISE EXCEPTION 'Start time must be before end time';
    END IF;
    
    IF p_lat IS NULL OR p_lng IS NULL THEN
        RAISE EXCEPTION 'Location coordinates are required';
    END IF;
    
    -- Clamp public meetup duration to 6 hours max
    v_clamped_end_ts := p_end_ts;
    IF p_visibility = 'public' AND (p_end_ts - p_start_ts) > INTERVAL '6 hours' THEN
        v_clamped_end_ts := p_start_ts + INTERVAL '6 hours';
    END IF;
    
    -- Generate meetup ID
    v_meetup_id := uuid_generate_v4();
    
    -- Generate fuzzed coordinates for public meetups
    IF p_visibility = 'public' THEN
        SELECT * INTO v_fuzzed_coords FROM generate_fuzzed_coords(p_lat, p_lng, v_meetup_id);
    END IF;
    
    -- Insert meetup
    INSERT INTO meetups (
        id, host_id, title, description, start_ts, end_ts, 
        lat, lng, visibility, public_lat, public_lng
    ) VALUES (
        v_meetup_id, p_host_id, p_title, p_desc, p_start_ts, v_clamped_end_ts,
        p_lat, p_lng, p_visibility, 
        CASE WHEN p_visibility = 'public' THEN v_fuzzed_coords.fuzzed_lat ELSE NULL END,
        CASE WHEN p_visibility = 'public' THEN v_fuzzed_coords.fuzzed_lng ELSE NULL END
    );
    
    -- Insert host membership
    INSERT INTO memberships (meetup_id, user_id, role) 
    VALUES (v_meetup_id, p_host_id, 'host');
    
    -- Generate invite token
    v_token := encode(gen_random_bytes(16), 'hex');
    
    -- Set expiry if specified
    IF p_token_ttl_hours IS NOT NULL THEN
        v_expires_at := NOW() + (p_token_ttl_hours || ' hours')::INTERVAL;
    ELSE
        v_expires_at := v_clamped_end_ts; -- Valid until meetup ends
    END IF;
    
    -- Insert invite token
    INSERT INTO invite_tokens (meetup_id, token, expires_at, created_by)
    VALUES (v_meetup_id, v_token, v_expires_at, p_host_id);
    
    -- Generate deep link
    v_deep_link := 'pennapps://join/' || v_token;
    
    -- Return results
    meetup_id := v_meetup_id;
    token := v_token;
    deep_link := v_deep_link;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage bucket for meetup files
INSERT INTO storage.buckets (id, name, public) VALUES ('meetup-files', 'meetup-files', false);

-- Storage policies
CREATE POLICY "Users can upload files to their meetups" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'meetup-files' AND
        auth.uid()::text IN (
            SELECT clerk_id FROM users WHERE id IN (
                SELECT user_id FROM memberships WHERE meetup_id::text = (storage.foldername(name))[2]
            )
        )
    );

CREATE POLICY "Users can view files from their meetups" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'meetup-files' AND
        auth.uid()::text IN (
            SELECT clerk_id FROM users WHERE id IN (
                SELECT user_id FROM memberships WHERE meetup_id::text = (storage.foldername(name))[2]
            )
        )
    );

CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'meetup-files' AND
        auth.uid()::text IN (
            SELECT clerk_id FROM users WHERE id IN (
                SELECT user_id FROM files WHERE storage_path = name
            )
        )
    );
