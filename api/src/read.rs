//! Bootstrap: frontend store kutgan JSON shaklini to'g'ridan-to'g'ri Postgres'da yig'adi.
//! Email va parol hash hech qachon chiqarilmaydi.
use crate::error::ApiResult;
use serde_json::{Value, json};
use sqlx::PgPool;
use uuid::Uuid;

const POST_LIMIT: i64 = 500;

async fn scalar(pool: &PgPool, sql: &str, me: Uuid) -> ApiResult<Value> {
    Ok(sqlx::query_scalar::<_, Value>(sqlx::AssertSqlSafe(sql.to_owned())).bind(me).fetch_one(pool).await?)
}

const USER_FIELDS: &str = r#"
    'id', u.id, 'username', u.username, 'name', u.name, 'avatar', u.avatar, 'sector', u.sector,
    'bio', u.bio, 'location', u.location, 'joined', to_char(u.joined_at, 'YYYY-MM-DD'),
    'followers', (SELECT count(*) FROM follows f WHERE f.followee_id = u.id),
    'following', (SELECT count(*) FROM follows f WHERE f.follower_id = u.id),
    'banner', u.banner, 'website', u.website, 'telegram', u.telegram,
    'isVerified', u.is_verified, 'portfolio', u.portfolio"#;

pub async fn bootstrap(pool: &PgPool, me: Uuid) -> ApiResult<Value> {
    // Men birinchi: frontend `users[0]` ni joriy foydalanuvchi deb biladi.
    let users = scalar(
        pool,
        &format!(
            "SELECT coalesce(jsonb_agg(j ORDER BY first DESC, joined_at), '[]'::jsonb) FROM (
                SELECT (u.id = $1) AS first, u.joined_at,
                       jsonb_strip_nulls(jsonb_build_object({USER_FIELDS})) AS j
                FROM users u) t"
        ),
        me,
    )
    .await?;

    let channels = scalar(
        pool,
        r#"SELECT coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
            'id', c.id, 'name', c.name, 'handle', c.handle, 'avatar', c.avatar,
            'description', c.description, 'sector', c.sector, 'ownerId', c.owner_id,
            'memberCount', (SELECT count(*) FROM channel_members m WHERE m.channel_id = c.id),
            'joined', EXISTS (SELECT 1 FROM channel_members m WHERE m.channel_id = c.id AND m.user_id = $1)
        )) ORDER BY c.created_at), '[]'::jsonb) FROM channels c"#,
        me,
    )
    .await?;

    let posts = scalar(
        pool,
        &format!(
            r#"SELECT coalesce(jsonb_agg(j ORDER BY created_at DESC), '[]'::jsonb) FROM (
                SELECT p.created_at, jsonb_strip_nulls(jsonb_build_object(
                    'id', p.id, 'authorId', p.author_id, 'content', p.content,
                    'createdAt', iso(p.created_at), 'editedAt', iso(p.edited_at),
                    'comments', (SELECT count(*) FROM comments c WHERE c.post_id = p.id),
                    'shares', (SELECT count(*) FROM post_shares s WHERE s.post_id = p.id),
                    'views', p.views, 'channelId', p.channel_id, 'mediaUrl', p.media_url,
                    'audioUrl', p.audio_url, 'audioDuration', p.audio_duration,
                    'poll', p.poll)) AS j
                FROM posts p ORDER BY p.created_at DESC LIMIT {POST_LIMIT}) t"#
        ),
        me,
    )
    .await?;

    let comments = scalar(
        pool,
        &format!(
            r#"SELECT coalesce(jsonb_agg(jsonb_build_object(
                'id', c.id, 'postId', c.post_id, 'authorId', c.author_id,
                'content', c.content, 'createdAt', iso(c.created_at)) ORDER BY c.created_at), '[]'::jsonb)
            FROM comments c
            WHERE c.post_id IN (SELECT id FROM posts ORDER BY created_at DESC LIMIT {POST_LIMIT}) AND $1 IS NOT NULL"#
        ),
        me,
    )
    .await?;

    let chats = scalar(
        pool,
        r#"SELECT coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
            'id', c.id, 'isGroup', c.is_group, 'title', c.title,
            'participantIds', (SELECT jsonb_agg(m.user_id) FROM chat_members m WHERE m.chat_id = c.id)
        )) ORDER BY c.created_at), '[]'::jsonb)
        FROM chats c WHERE EXISTS (SELECT 1 FROM chat_members m WHERE m.chat_id = c.id AND m.user_id = $1)"#,
        me,
    )
    .await?;

    let messages = scalar(
        pool,
        r#"SELECT coalesce(jsonb_agg(jsonb_build_object(
            'id', g.id, 'chatId', g.chat_id, 'senderId', g.sender_id,
            'content', g.content, 'createdAt', iso(g.created_at)) ORDER BY g.created_at), '[]'::jsonb)
        FROM (SELECT * FROM messages m
              WHERE EXISTS (SELECT 1 FROM chat_members cm WHERE cm.chat_id = m.chat_id AND cm.user_id = $1)
              ORDER BY m.created_at DESC LIMIT 2000) g"#,
        me,
    )
    .await?;

    let notifications = scalar(
        pool,
        r#"SELECT coalesce(jsonb_agg(j ORDER BY created_at DESC), '[]'::jsonb) FROM (
            SELECT n.created_at, jsonb_strip_nulls(jsonb_build_object(
                'id', n.id, 'type', n.type, 'actorId', n.actor_id, 'postId', n.post_id,
                'channelId', n.channel_id, 'createdAt', iso(n.created_at), 'read', n.read)) AS j
            FROM notifications n WHERE n.user_id = $1 ORDER BY n.created_at DESC LIMIT 200) t"#,
        me,
    )
    .await?;

    let campaigns = scalar(
        pool,
        r#"SELECT coalesce(jsonb_agg(jsonb_build_object(
            'id', k.id, 'channelId', k.channel_id, 'title', k.title, 'summary', k.summary,
            'goal', k.goal, 'deadline', iso(k.deadline), 'createdAt', iso(k.created_at),
            'milestones', k.milestones,
            'pledges', (SELECT coalesce(jsonb_agg(jsonb_build_object(
                'id', p.id, 'userId', p.user_id, 'amount', p.amount, 'createdAt', iso(p.created_at)
            ) ORDER BY p.created_at), '[]'::jsonb) FROM pledges p WHERE p.campaign_id = k.id)
        ) ORDER BY k.created_at), '[]'::jsonb) FROM campaigns k WHERE $1 IS NOT NULL"#,
        me,
    )
    .await?;

    let ids = |sql: &'static str| async move { sqlx::query_scalar::<_, Uuid>(sql).bind(me).fetch_all(pool).await };
    let following = ids("SELECT followee_id FROM follows WHERE follower_id = $1").await?;
    let shared = ids("SELECT post_id FROM post_shares WHERE user_id = $1").await?;
    let bookmarked = ids("SELECT post_id FROM bookmarks WHERE user_id = $1").await?;

    Ok(json!({
        "me": users.get(0).cloned().unwrap_or(Value::Null),
        "users": users,
        "channels": channels,
        "posts": posts,
        "comments": comments,
        "chats": chats,
        "messages": messages,
        "notifications": notifications,
        "campaigns": campaigns,
        "followingIds": following,
        "sharedIds": shared,
        "bookmarkedIds": bookmarked,
    }))
}
