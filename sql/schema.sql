-- PennApps Private Meetups Database Schema
-- Compatible with Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE role AS ENUM ('host', 'admin', 'member');
CREATE TYPE message_type AS ENUM ('chat', 'announcement');
CREATE TYPE file_type AS ENUM ('image', 'pdf', 'note');
CREATE TYPE target_type AS ENUM ('user', 'message', 'file');

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
    desc TEXT,
    start_ts TIMESTAMPTZ NOT NULL,
    end_ts TIMESTAMPTZ NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
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
