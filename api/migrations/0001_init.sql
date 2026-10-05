-- graduss: boshlang'ich sxema. Vaqtlar UTC; JSON ko'rinishi uchun iso() yordamchi funksiya.

CREATE OR REPLACE FUNCTION iso(ts timestamptz) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
    SELECT to_char(ts AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
$$;

CREATE TABLE users (
    id            uuid PRIMARY KEY,
    username      text NOT NULL,
    email         text NOT NULL,
    password_hash text NOT NULL,
    name          text NOT NULL,
    avatar        text NOT NULL DEFAULT '#2F855A',
    sector        text NOT NULL DEFAULT 'Tadbirkor',
    bio           text NOT NULL DEFAULT '',
    location      text NOT NULL DEFAULT '',
    banner        text,
    website       text,
    telegram      text,
    is_verified   boolean NOT NULL DEFAULT false,
    portfolio     jsonb NOT NULL DEFAULT '[]',
    joined_at     timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_username_lower ON users (lower(username));
CREATE UNIQUE INDEX users_email_lower ON users (lower(email));

-- Sessiya tokeni bazada faqat SHA-256 hash ko'rinishida saqlanadi.
CREATE TABLE sessions (
    token_hash text PRIMARY KEY,
    user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL
);
CREATE INDEX sessions_user ON sessions (user_id);

CREATE TABLE follows (
    follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (follower_id, followee_id),
    CHECK (follower_id <> followee_id)
);
CREATE INDEX follows_followee ON follows (followee_id);

CREATE TABLE channels (
    id          uuid PRIMARY KEY,
    name        text NOT NULL,
    handle      text NOT NULL,
    avatar      text NOT NULL,
    description text NOT NULL DEFAULT '',
    sector      text,
    owner_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX channels_handle_lower ON channels (lower(handle));

CREATE TABLE channel_members (
    channel_id uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (channel_id, user_id)
);
CREATE INDEX channel_members_user ON channel_members (user_id);

CREATE TABLE posts (
    id             uuid PRIMARY KEY,
    author_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel_id     uuid REFERENCES channels(id) ON DELETE CASCADE,
    content        text NOT NULL,
    media_url      text,
    audio_url      text,
    audio_duration integer,
    poll           jsonb,
    reactions      jsonb NOT NULL DEFAULT '{}',
    views          integer NOT NULL DEFAULT 0,
    created_at     timestamptz NOT NULL DEFAULT now(),
    edited_at      timestamptz
);
CREATE INDEX posts_created ON posts (created_at DESC);
CREATE INDEX posts_author ON posts (author_id);
CREATE INDEX posts_channel ON posts (channel_id);

CREATE TABLE post_shares (
    post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE bookmarks (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE comments (
    id         uuid PRIMARY KEY,
    post_id    uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX comments_post ON comments (post_id, created_at);

CREATE TABLE chats (
    id         uuid PRIMARY KEY,
    is_group   boolean NOT NULL DEFAULT false,
    title      text,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE chat_members (
    chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (chat_id, user_id)
);
CREATE INDEX chat_members_user ON chat_members (user_id);

CREATE TABLE messages (
    id         uuid PRIMARY KEY,
    chat_id    uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_chat ON messages (chat_id, created_at);

CREATE TABLE stories (
    id         uuid PRIMARY KEY,
    user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_url  text,
    gradient   text,
    caption    text,
    viewers    uuid[] NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL
);
CREATE INDEX stories_expires ON stories (expires_at);

CREATE TABLE notifications (
    id         uuid PRIMARY KEY,
    user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       text NOT NULL,
    actor_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id    uuid REFERENCES posts(id) ON DELETE CASCADE,
    channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
    read       boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user ON notifications (user_id, created_at DESC);

-- Kampaniya: bosqichlar (milestones) jsonb'da, qoidalar serverda (campaign.rs).
CREATE TABLE campaigns (
    id         uuid PRIMARY KEY,
    channel_id uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    title      text NOT NULL,
    summary    text NOT NULL DEFAULT '',
    goal       bigint NOT NULL CHECK (goal > 0),
    deadline   timestamptz NOT NULL,
    milestones jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX campaigns_channel ON campaigns (channel_id, created_at);

CREATE TABLE pledges (
    id          uuid PRIMARY KEY,
    campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount      bigint NOT NULL CHECK (amount >= 1000),
    created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX pledges_campaign ON pledges (campaign_id);
