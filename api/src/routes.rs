use crate::{
    AppState,
    auth::{self, AuthUser},
    campaign::{self, Milestone, Phase},
    error::{ApiError, ApiResult, bad},
    read,
};
use axum::{
    Json, Router,
    extract::{Path, State},
    http::{HeaderMap, HeaderValue, StatusCode, header::SET_COOKIE},
    response::{IntoResponse, Response},
    routing::{delete, get, patch, post},
};
use chrono::{DateTime, Duration, Utc};
use serde::Deserialize;
use serde_json::{Value, json};
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

pub const SECTORS: [&str; 15] = [
    "Dasturchi", "O'yin ishlab chiquvchi", "Dizayner", "Muhandis", "Arxitektor", "Shifokor", "O'qituvchi",
    "Huquqshunos", "Iqtisodchi", "Tadbirkor", "Jurnalist", "Siyosatchi", "San'atkor", "Musiqachi", "Kino va video",
];
const AVATARS: [&str; 8] = ["#2F855A", "#2B6CB0", "#C53030", "#6B46C1", "#D53F8C", "#DD6B20", "#0987A0", "#B7791F"];

type Tx<'a> = Transaction<'a, Postgres>;

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/api/health", get(|| async { "ok" }))
        .route("/api/auth/register", post(register))
        .route("/api/auth/login", post(login))
        .route("/api/auth/logout", post(logout))
        .route("/api/bootstrap", get(bootstrap))
        .route("/api/me", patch(update_me))
        .route("/api/me/portfolio", post(add_portfolio))
        .route("/api/me/portfolio/{id}", delete(remove_portfolio))
        .route("/api/follow/{id}", post(follow))
        .route("/api/posts", post(create_post))
        .route("/api/posts/{id}", patch(edit_post).delete(delete_post))
        .route("/api/posts/{id}/view", post(view_post))
        .route("/api/posts/{id}/vote", post(vote_post))
        .route("/api/posts/{id}/share", post(share_post))
        .route("/api/posts/{id}/bookmark", post(bookmark_post))
        .route("/api/posts/{id}/comments", post(add_comment))
        .route("/api/comments/{id}", delete(delete_comment))
        .route("/api/channels", post(create_channel))
        .route("/api/channels/{id}", patch(update_channel))
        .route("/api/channels/{id}/join", post(join_channel))
        .route("/api/channels/{id}/campaigns", post(create_campaign))
        .route("/api/campaigns/{id}/pledge", post(pledge))
        .route("/api/campaigns/{id}/report", post(report))
        .route("/api/campaigns/{id}/approve", post(approve))
        .route("/api/chats", post(open_chat))
        .route("/api/chats/{id}/messages", post(send_message))
        .route("/api/messages/{id}", delete(delete_message))
        .route("/api/notifications/read-all", post(read_all))
        .layer(tower_http::limit::RequestBodyLimitLayer::new(256 * 1024))
        .with_state(state)
}

// ---------- yordamchilar ----------

fn len_ok(s: &str, min: usize, max: usize) -> bool {
    let n = s.trim().chars().count();
    n >= min && n <= max
}

fn http_url(s: &str) -> bool {
    s.len() <= 500 && (s.starts_with("https://") || s.starts_with("http://")) && !s.contains(char::is_whitespace)
}

fn valid_username(s: &str) -> bool {
    (3..=32).contains(&s.len()) && s.bytes().all(|b| b.is_ascii_alphanumeric() || b == b'_')
}

const RESERVED_HANDLES: [&str; 18] = [
    "admin", "administrator", "root", "support", "help", "api", "www", "graduss", "official", "settings", "login",
    "register", "search", "feed", "chats", "channels", "notifications", "profile",
];

/// @username va kanal manzili: 3-30 belgi, kichik lotin harf/raqam/nuqta/defis; harf bilan boshlanadi,
/// harf yoki raqam bilan tugaydi, nuqta va defis ketma-ket kelmaydi, pastki chiziq (_) yo'q.
/// Qabul: kun.uz, kunuz, kun-uz. Rad: kun_uz, 123uz, kun__uz.
fn valid_handle(s: &str) -> bool {
    let b = s.as_bytes();
    if !(3..=30).contains(&b.len()) {
        return false;
    }
    if !b.iter().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || *c == b'.' || *c == b'-') {
        return false;
    }
    if !b[0].is_ascii_lowercase() || !(b[b.len() - 1].is_ascii_lowercase() || b[b.len() - 1].is_ascii_digit()) {
        return false;
    }
    if b.windows(2).any(|w| (w[0] == b'.' || w[0] == b'-') && (w[1] == b'.' || w[1] == b'-')) {
        return false;
    }
    let flat: String = s.chars().filter(|c| *c != '.' && *c != '-').collect();
    !RESERVED_HANDLES.contains(&flat.as_str())
}

fn valid_email(s: &str) -> bool {
    s.len() <= 254 && !s.contains(char::is_whitespace) && {
        let mut it = s.splitn(2, '@');
        let (l, d) = (it.next().unwrap_or(""), it.next().unwrap_or(""));
        !l.is_empty() && d.contains('.') && !d.starts_with('.') && !d.ends_with('.') && !d.contains('@')
    }
}

fn valid_sector(s: &str) -> bool {
    SECTORS.contains(&s)
}

fn ok() -> Response {
    StatusCode::NO_CONTENT.into_response()
}

async fn notify(
    tx: &mut Tx<'_>,
    to: Uuid,
    kind: &str,
    actor: Uuid,
    post: Option<Uuid>,
    channel: Option<Uuid>,
) -> ApiResult<()> {
    if to == actor {
        return Ok(());
    }
    sqlx::query("INSERT INTO notifications (id, user_id, type, actor_id, post_id, channel_id) VALUES ($1,$2,$3,$4,$5,$6)")
        .bind(Uuid::new_v4())
        .bind(to)
        .bind(kind)
        .bind(actor)
        .bind(post)
        .bind(channel)
        .execute(&mut **tx)
        .await?;
    Ok(())
}

async fn channel_owner(pool: &PgPool, id: Uuid) -> ApiResult<Uuid> {
    sqlx::query_scalar("SELECT owner_id FROM channels WHERE id = $1")
        .bind(id)
        .fetch_optional(pool)
        .await?
        .ok_or(ApiError::NotFound)
}

// ---------- autentifikatsiya ----------

#[derive(Deserialize)]
struct Register {
    name: String,
    username: String,
    email: String,
    password: String,
    sector: Option<String>,
}

async fn start_session(state: &AppState, user: Uuid) -> ApiResult<HeaderMap> {
    let token = auth::new_token();
    sqlx::query("DELETE FROM sessions WHERE expires_at < now()").execute(&state.pool).await?;
    sqlx::query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1,$2,$3)")
        .bind(auth::token_hash(&token))
        .bind(user)
        .bind(Utc::now() + Duration::days(auth::SESSION_DAYS))
        .execute(&state.pool)
        .await?;
    let mut h = HeaderMap::new();
    let v = HeaderValue::from_str(&auth::set_cookie(&token, state.cookie_secure))
        .map_err(|_| ApiError::Internal("cookie".into()))?;
    h.insert(SET_COOKIE, v);
    Ok(h)
}

async fn register(State(st): State<AppState>, Json(b): Json<Register>) -> ApiResult<Response> {
    let sector = b.sector.unwrap_or_else(|| "Tadbirkor".into());
    if !len_ok(&b.name, 2, 60) {
        return bad("Ism 2-60 belgi bo'lishi kerak");
    }
    let username = b.username.trim().to_lowercase();
    if !valid_handle(&username) {
        return bad("Foydalanuvchi nomi 3-30 belgi: kichik harf, raqam, nuqta, defis; harf bilan boshlanadi, _ mumkin emas");
    }
    if !valid_email(&b.email) {
        return bad("Email noto'g'ri formatda");
    }
    if b.password.chars().count() < 8 || b.password.len() > 128 {
        return bad("Parol kamida 8 belgi bo'lishi kerak");
    }
    if !valid_sector(&sector) {
        return bad("Noma'lum kasb yo'nalishi");
    }
    let id = Uuid::new_v4();
    let hash = auth::hash_password(b.password).await?;
    let avatar = AVATARS[(id.as_bytes()[0] as usize) % AVATARS.len()];
    let res = sqlx::query(
        "INSERT INTO users (id, username, email, password_hash, name, avatar, sector) VALUES ($1,$2,$3,$4,$5,$6,$7)",
    )
    .bind(id)
    .bind(&username)
    .bind(b.email.trim())
    .bind(hash)
    .bind(b.name.trim())
    .bind(avatar)
    .bind(&sector)
    .execute(&st.pool)
    .await;
    if let Err(e) = res {
        return Err(match ApiError::from(e) {
            ApiError::Conflict(_) => ApiError::Conflict("Bu foydalanuvchi nomi yoki email band".into()),
            other => other,
        });
    }
    let headers = start_session(&st, id).await?;
    Ok((StatusCode::CREATED, headers, Json(json!({ "id": id }))).into_response())
}

#[derive(Deserialize)]
struct Login {
    identifier: String,
    password: String,
}

async fn login(State(st): State<AppState>, Json(b): Json<Login>) -> ApiResult<Response> {
    let row: Option<(Uuid, String)> = sqlx::query_as(
        "SELECT id, password_hash FROM users WHERE lower(username) = lower($1) OR lower(email) = lower($1)",
    )
    .bind(b.identifier.trim())
    .fetch_optional(&st.pool)
    .await?;
    let (id, hash) = match row {
        Some((id, h)) => (Some(id), Some(h)),
        None => (None, None),
    };
    if !auth::verify_password(b.password, hash).await {
        return Err(ApiError::Unauthorized);
    }
    let headers = start_session(&st, id.ok_or(ApiError::Unauthorized)?).await?;
    Ok((headers, Json(json!({ "ok": true }))).into_response())
}

async fn logout(State(st): State<AppState>, parts: HeaderMap) -> ApiResult<Response> {
    if let Some(raw) = parts.get(axum::http::header::COOKIE).and_then(|v| v.to_str().ok()) {
        if let Some(tok) = raw.split(';').filter_map(|kv| kv.trim().split_once('=')).find(|(k, _)| *k == auth::COOKIE) {
            sqlx::query("DELETE FROM sessions WHERE token_hash = $1")
                .bind(auth::token_hash(tok.1))
                .execute(&st.pool)
                .await?;
        }
    }
    let mut h = HeaderMap::new();
    let v = HeaderValue::from_str(&auth::clear_cookie(st.cookie_secure)).map_err(|_| ApiError::Internal("cookie".into()))?;
    h.insert(SET_COOKIE, v);
    Ok((StatusCode::NO_CONTENT, h).into_response())
}

async fn bootstrap(State(st): State<AppState>, AuthUser(me): AuthUser) -> ApiResult<Json<Value>> {
    Ok(Json(read::bootstrap(&st.pool, me).await?))
}

// ---------- profil ----------

#[derive(Deserialize)]
struct ProfilePatch {
    name: Option<String>,
    username: Option<String>,
    bio: Option<String>,
    location: Option<String>,
    avatar: Option<String>,
    banner: Option<String>,
    website: Option<String>,
    telegram: Option<String>,
    sector: Option<String>,
}

async fn update_me(State(st): State<AppState>, AuthUser(me): AuthUser, Json(p): Json<ProfilePatch>) -> ApiResult<Response> {
    if p.name.as_deref().is_some_and(|v| !len_ok(v, 2, 60)) {
        return bad("Ism 2-60 belgi bo'lishi kerak");
    }
    let new_username = p.username.as_deref().map(|v| v.trim().to_lowercase());
    if new_username.as_deref().is_some_and(|v| !valid_handle(v)) {
        return bad("Foydalanuvchi nomi noto'g'ri: kichik harf, raqam, nuqta, defis; harf bilan boshlanadi, _ mumkin emas");
    }
    if p.bio.as_deref().is_some_and(|v| v.chars().count() > 300) || p.location.as_deref().is_some_and(|v| v.chars().count() > 80) {
        return bad("Matn juda uzun");
    }
    if p.avatar.as_deref().is_some_and(|v| !(v.len() == 7 && v.starts_with('#') && v[1..].bytes().all(|b| b.is_ascii_hexdigit()))) {
        return bad("Avatar rangi noto'g'ri");
    }
    if p.banner.as_deref().is_some_and(|v| v.len() > 80 || !v.bytes().all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b' ')) {
        return bad("Banner noto'g'ri");
    }
    if p.website.as_deref().is_some_and(|v| !v.is_empty() && !http_url(v)) {
        return bad("Veb-sayt https:// bilan boshlanishi kerak");
    }
    if p.telegram.as_deref().is_some_and(|v| !v.is_empty() && !valid_username(v.trim_start_matches('@'))) {
        return bad("Telegram nomi noto'g'ri");
    }
    if p.sector.as_deref().is_some_and(|v| !valid_sector(v)) {
        return bad("Noma'lum kasb yo'nalishi");
    }
    let res = sqlx::query(
        "UPDATE users SET
            name = coalesce($2, name), username = coalesce($3, username), bio = coalesce($4, bio),
            location = coalesce($5, location), avatar = coalesce($6, avatar), banner = coalesce($7, banner),
            website = CASE WHEN $8::text IS NULL THEN website WHEN $8 = '' THEN NULL ELSE $8 END,
            telegram = CASE WHEN $9::text IS NULL THEN telegram WHEN $9 = '' THEN NULL ELSE ltrim($9, '@') END,
            sector = coalesce($10, sector)
         WHERE id = $1",
    )
    .bind(me)
    .bind(p.name.map(|v| v.trim().to_string()))
    .bind(new_username)
    .bind(p.bio)
    .bind(p.location)
    .bind(p.avatar)
    .bind(p.banner)
    .bind(p.website)
    .bind(p.telegram)
    .bind(p.sector)
    .execute(&st.pool)
    .await;
    if let Err(e) = res {
        return Err(match ApiError::from(e) {
            ApiError::Conflict(_) => ApiError::Conflict("Bu foydalanuvchi nomi band".into()),
            other => other,
        });
    }
    Ok(ok())
}

#[derive(Deserialize)]
struct PortfolioIn {
    id: String,
    title: String,
    description: String,
    url: Option<String>,
}

async fn add_portfolio(State(st): State<AppState>, AuthUser(me): AuthUser, Json(b): Json<PortfolioIn>) -> ApiResult<Response> {
    if !len_ok(&b.title, 2, 100) || b.description.chars().count() > 500 || b.id.is_empty() || b.id.len() > 40 {
        return bad("Portfolio ma'lumoti noto'g'ri");
    }
    if b.url.as_deref().is_some_and(|u| !u.is_empty() && !http_url(u)) {
        return bad("Havola https:// bilan boshlanishi kerak");
    }
    let item = json!({ "id": b.id, "title": b.title.trim(), "description": b.description.trim(),
                       "url": b.url.filter(|u| !u.is_empty()) });
    // Bir foydalanuvchida portfolio elementlari soni cheklangan.
    let n = sqlx::query(
        "UPDATE users SET portfolio = portfolio || jsonb_build_array(jsonb_strip_nulls($2::jsonb))
         WHERE id = $1 AND jsonb_array_length(portfolio) < 50",
    )
    .bind(me)
    .bind(item)
    .execute(&st.pool)
    .await?
    .rows_affected();
    if n == 0 {
        return bad("Portfolio to'lgan (50 tagacha)");
    }
    Ok(ok())
}

async fn remove_portfolio(State(st): State<AppState>, AuthUser(me): AuthUser, Path(id): Path<String>) -> ApiResult<Response> {
    sqlx::query(
        "UPDATE users SET portfolio = coalesce((SELECT jsonb_agg(e) FROM jsonb_array_elements(portfolio) e WHERE e->>'id' <> $2), '[]'::jsonb)
         WHERE id = $1",
    )
    .bind(me)
    .bind(id)
    .execute(&st.pool)
    .await?;
    Ok(ok())
}

#[derive(Deserialize)]
struct On {
    on: bool,
}

async fn follow(State(st): State<AppState>, AuthUser(me): AuthUser, Path(id): Path<Uuid>, Json(b): Json<On>) -> ApiResult<Response> {
    if id == me {
        return bad("O'zingizni kuzata olmaysiz");
    }
    let mut tx = st.pool.begin().await?;
    if b.on {
        let n = sqlx::query("INSERT INTO follows (follower_id, followee_id) VALUES ($1,$2) ON CONFLICT DO NOTHING")
            .bind(me)
            .bind(id)
            .execute(&mut *tx)
            .await?
            .rows_affected();
        if n > 0 {
            notify(&mut tx, id, "follow", me, None, None).await?;
        }
    } else {
        sqlx::query("DELETE FROM follows WHERE follower_id=$1 AND followee_id=$2").bind(me).bind(id).execute(&mut *tx).await?;
    }
    tx.commit().await?;
    Ok(ok())
}

// ---------- postlar ----------

#[derive(Deserialize)]
struct PollOptIn {
    id: String,
    text: String,
}
#[derive(Deserialize)]
struct PollIn {
    question: String,
    options: Vec<PollOptIn>,
}
#[derive(Deserialize)]
struct NewPost {
    id: Uuid,
    content: String,
    #[serde(rename = "channelId")]
    channel_id: Option<Uuid>,
    #[serde(rename = "mediaUrl")]
    media_url: Option<String>,
    poll: Option<PollIn>,
}

async fn create_post(State(st): State<AppState>, AuthUser(me): AuthUser, Json(b): Json<NewPost>) -> ApiResult<Response> {
    let content = b.content.trim().to_string();
    if content.chars().count() > 1000 {
        return bad("Post 1000 belgidan oshmasligi kerak");
    }
    if content.is_empty() && b.media_url.is_none() && b.poll.is_none() {
        return bad("Post bo'sh bo'lishi mumkin emas");
    }
    if b.media_url.as_deref().is_some_and(|u| !http_url(u)) {
        return bad("Rasm havolasi noto'g'ri");
    }
    let poll = match b.poll {
        None => None,
        Some(p) => {
            if !len_ok(&p.question, 1, 200) || !(2..=4).contains(&p.options.len())
                || p.options.iter().any(|o| !len_ok(&o.text, 1, 100) || o.id.is_empty() || o.id.len() > 40)
            {
                return bad("So'rovnoma noto'g'ri");
            }
            Some(json!({ "id": Uuid::new_v4(), "question": p.question.trim(),
                "options": p.options.iter().map(|o| json!({"id": o.id, "text": o.text.trim(), "votes": []})).collect::<Vec<_>>() }))
        }
    };
    let mut tx = st.pool.begin().await?;
    if let Some(cid) = b.channel_id {
        let owner: Uuid = sqlx::query_scalar("SELECT owner_id FROM channels WHERE id = $1")
            .bind(cid)
            .fetch_optional(&mut *tx)
            .await?
            .ok_or(ApiError::NotFound)?;
        if owner != me {
            return Err(ApiError::Forbidden);
        }
    }
    sqlx::query("INSERT INTO posts (id, author_id, channel_id, content, media_url, poll) VALUES ($1,$2,$3,$4,$5,$6)")
        .bind(b.id)
        .bind(me)
        .bind(b.channel_id)
        .bind(&content)
        .bind(&b.media_url)
        .bind(poll)
        .execute(&mut *tx)
        .await?;
    if let Some(cid) = b.channel_id {
        let members: Vec<Uuid> = sqlx::query_scalar("SELECT user_id FROM channel_members WHERE channel_id = $1 AND user_id <> $2")
            .bind(cid)
            .bind(me)
            .fetch_all(&mut *tx)
            .await?;
        for m in members {
            notify(&mut tx, m, "channel", me, Some(b.id), Some(cid)).await?;
        }
    }
    // @mention
    let mut seen = std::collections::HashSet::new();
    for w in content.split_whitespace().filter_map(|w| w.strip_prefix('@')) {
        let name = w.trim_end_matches(|c: char| !c.is_ascii_alphanumeric());
        if valid_handle(&name.to_lowercase()) && seen.insert(name.to_lowercase()) {
            let uid: Option<Uuid> = sqlx::query_scalar("SELECT id FROM users WHERE lower(username) = lower($1)")
                .bind(name)
                .fetch_optional(&mut *tx)
                .await?;
            if let Some(u) = uid {
                notify(&mut tx, u, "mention", me, Some(b.id), None).await?;
            }
        }
    }
    tx.commit().await?;
    Ok((StatusCode::CREATED, Json(json!({ "id": b.id }))).into_response())
}

#[derive(Deserialize)]
struct Content {
    content: String,
}

async fn edit_post(State(st): State<AppState>, AuthUser(me): AuthUser, Path(id): Path<Uuid>, Json(b): Json<Content>) -> ApiResult<Response> {
    if !len_ok(&b.content, 1, 1000) {
        return bad("Post 1-1000 belgi bo'lishi kerak");
    }
    let n = sqlx::query("UPDATE posts SET content = $3, edited_at = now() WHERE id = $1 AND author_id = $2")
        .bind(id)
        .bind(me)
        .bind(b.content.trim())
        .execute(&st.pool)
        .await?
        .rows_affected();
    if n == 0 { Err(ApiError::Forbidden) } else { Ok(ok()) }
}

async fn delete_post(State(st): State<AppState>, AuthUser(me): AuthUser, Path(id): Path<Uuid>) -> ApiResult<Response> {
    let n = sqlx::query("DELETE FROM posts WHERE id = $1 AND author_id = $2").bind(id).bind(me).execute(&st.pool).await?.rows_affected();
    if n == 0 { Err(ApiError::Forbidden) } else { Ok(ok()) }
}

async fn view_post(State(st): State<AppState>, AuthUser(_): AuthUser, Path(id): Path<Uuid>) -> ApiResult<Response> {
    sqlx::query("UPDATE posts SET views = views + 1 WHERE id = $1").bind(id).execute(&st.pool).await?;
    Ok(ok())
}

#[derive(Deserialize)]
struct Vote {
    #[serde(rename = "optionId")]
    option_id: String,
}

async fn vote_post(State(st): State<AppState>, AuthUser(me): AuthUser, Path(id): Path<Uuid>, Json(b): Json<Vote>) -> ApiResult<Response> {
    let mut tx = st.pool.begin().await?;
    let poll: Option<Value> = sqlx::query_scalar("SELECT poll FROM posts WHERE id = $1 FOR UPDATE")
        .bind(id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or(ApiError::NotFound)?;
    let mut poll = poll.ok_or(ApiError::Bad("Bu postda so'rovnoma yo'q".into()))?;
    let me_s = Value::String(me.to_string());
    let opts = poll.get_mut("options").and_then(|o| o.as_array_mut()).ok_or(ApiError::Internal("poll".into()))?;
    if !opts.iter().any(|o| o["id"] == b.option_id) {
        return bad("Variant topilmadi");
    }
    for o in opts.iter_mut() {
        let is_target = o["id"] == b.option_id;
        if let Some(v) = o.get_mut("votes").and_then(|v| v.as_array_mut()) {
            v.retain(|x| *x != me_s);
            if is_target {
                v.push(me_s.clone());
            }
        }
    }
    sqlx::query("UPDATE posts SET poll = $2 WHERE id = $1").bind(id).bind(poll).execute(&mut *tx).await?;
    tx.commit().await?;
    Ok(ok())
}

async fn share_post(State(st): State<AppState>, AuthUser(me): AuthUser, Path(id): Path<Uuid>, Json(b): Json<On>) -> ApiResult<Response> {
    if b.on {
        sqlx::query("INSERT INTO post_shares (post_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING").bind(id).bind(me).execute(&st.pool).await?;
    } else {
        sqlx::query("DELETE FROM post_shares WHERE post_id=$1 AND user_id=$2").bind(id).bind(me).execute(&st.pool).await?;
    }
    Ok(ok())
}

async fn bookmark_post(State(st): State<AppState>, AuthUser(me): AuthUser, Path(id): Path<Uuid>, Json(b): Json<On>) -> ApiResult<Response> {
    if b.on {
        sqlx::query("INSERT INTO bookmarks (post_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING").bind(id).bind(me).execute(&st.pool).await?;
    } else {
        sqlx::query("DELETE FROM bookmarks WHERE post_id=$1 AND user_id=$2").bind(id).bind(me).execute(&st.pool).await?;
    }
    Ok(ok())
}

#[derive(Deserialize)]
struct NewComment {
    id: Uuid,
    content: String,
}

async fn add_comment(State(st): State<AppState>, AuthUser(me): AuthUser, Path(post): Path<Uuid>, Json(b): Json<NewComment>) -> ApiResult<Response> {
    if !len_ok(&b.content, 1, 500) {
        return bad("Izoh 1-500 belgi bo'lishi kerak");
    }
    let mut tx = st.pool.begin().await?;
    let author: Uuid = sqlx::query_scalar("SELECT author_id FROM posts WHERE id = $1")
        .bind(post)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or(ApiError::NotFound)?;
    sqlx::query("INSERT INTO comments (id, post_id, author_id, content) VALUES ($1,$2,$3,$4)")
        .bind(b.id)
        .bind(post)
        .bind(me)
        .bind(b.content.trim())
        .execute(&mut *tx)
        .await?;
    notify(&mut tx, author, "comment", me, Some(post), None).await?;
    tx.commit().await?;
    Ok((StatusCode::CREATED, Json(json!({ "id": b.id }))).into_response())
}

async fn delete_comment(State(st): State<AppState>, AuthUser(me): AuthUser, Path(id): Path<Uuid>) -> ApiResult<Response> {
    let n = sqlx::query("DELETE FROM comments WHERE id = $1 AND author_id = $2").bind(id).bind(me).execute(&st.pool).await?.rows_affected();
    if n == 0 { Err(ApiError::Forbidden) } else { Ok(ok()) }
}

// ---------- kanallar ----------

#[derive(Deserialize)]
struct NewChannel {
    id: Uuid,
    name: String,
    handle: String,
    description: String,
    sector: Option<String>,
}

async fn create_channel(State(st): State<AppState>, AuthUser(me): AuthUser, Json(b): Json<NewChannel>) -> ApiResult<Response> {
    let handle = b.handle.trim().to_lowercase();
    if !len_ok(&b.name, 3, 60) {
        return bad("Kanal nomi 3-60 belgi bo'lishi kerak");
    }
    if !valid_handle(&handle) {
        return bad("Manzil 3-30 belgi: kichik harf, raqam, nuqta, defis; harf bilan boshlanadi, _ mumkin emas");
    }
    if !len_ok(&b.description, 10, 500) {
        return bad("Tavsif 10-500 belgi bo'lishi kerak");
    }
    if b.sector.as_deref().is_some_and(|s| !valid_sector(s)) {
        return bad("Noma'lum kasb yo'nalishi");
    }
    let avatar: String = sqlx::query_scalar("SELECT avatar FROM users WHERE id = $1").bind(me).fetch_one(&st.pool).await?;
    let mut tx = st.pool.begin().await?;
    let r = sqlx::query("INSERT INTO channels (id, name, handle, avatar, description, sector, owner_id) VALUES ($1,$2,$3,$4,$5,$6,$7)")
        .bind(b.id)
        .bind(b.name.trim())
        .bind(&handle)
        .bind(avatar)
        .bind(b.description.trim())
        .bind(&b.sector)
        .bind(me)
        .execute(&mut *tx)
        .await;
    if let Err(e) = r {
        return Err(match ApiError::from(e) {
            ApiError::Conflict(_) => ApiError::Conflict("Bu manzil band".into()),
            other => other,
        });
    }
    sqlx::query("INSERT INTO channel_members (channel_id, user_id) VALUES ($1,$2)").bind(b.id).bind(me).execute(&mut *tx).await?;
    tx.commit().await?;
    Ok((StatusCode::CREATED, Json(json!({ "id": b.id }))).into_response())
}

#[derive(Deserialize)]
struct ChannelPatch {
    name: Option<String>,
    handle: Option<String>,
    description: Option<String>,
}

async fn update_channel(State(st): State<AppState>, AuthUser(me): AuthUser, Path(id): Path<Uuid>, Json(b): Json<ChannelPatch>) -> ApiResult<Response> {
    if b.name.as_deref().is_some_and(|v| !len_ok(v, 3, 60)) || b.description.as_deref().is_some_and(|v| v.chars().count() > 500) {
        return bad("Kanal ma'lumoti noto'g'ri");
    }
    let handle = b.handle.map(|h| h.trim().to_lowercase());
    if handle.as_deref().is_some_and(|h| !valid_handle(h)) {
        return bad("Manzil noto'g'ri");
    }
    let r = sqlx::query(
        "UPDATE channels SET name = coalesce($3, name), handle = coalesce($4, handle), description = coalesce($5, description)
         WHERE id = $1 AND owner_id = $2",
    )
    .bind(id)
    .bind(me)
    .bind(b.name.map(|v| v.trim().to_string()))
    .bind(handle)
    .bind(b.description.map(|v| v.trim().to_string()))
    .execute(&st.pool)
    .await;
    match r {
        Ok(r) if r.rows_affected() == 0 => Err(ApiError::Forbidden),
        Ok(_) => Ok(ok()),
        Err(e) => Err(match ApiError::from(e) {
            ApiError::Conflict(_) => ApiError::Conflict("Bu manzil band".into()),
            other => other,
        }),
    }
}

async fn join_channel(State(st): State<AppState>, AuthUser(me): AuthUser, Path(id): Path<Uuid>, Json(b): Json<On>) -> ApiResult<Response> {
    let owner = channel_owner(&st.pool, id).await?;
    if b.on {
        sqlx::query("INSERT INTO channel_members (channel_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING").bind(id).bind(me).execute(&st.pool).await?;
    } else {
        if owner == me {
            return bad("Kanal egasi a'zolikdan chiqa olmaydi");
        }
        sqlx::query("DELETE FROM channel_members WHERE channel_id=$1 AND user_id=$2").bind(id).bind(me).execute(&st.pool).await?;
    }
    Ok(ok())
}

// ---------- kampaniyalar ----------

#[derive(Deserialize)]
struct MilestoneIn {
    title: String,
    percent: u32,
}
#[derive(Deserialize)]
struct NewCampaign {
    id: Uuid,
    title: String,
    summary: String,
    goal: i64,
    days: i64,
    milestones: Vec<MilestoneIn>,
}

struct CampaignRow {
    goal: i64,
    deadline: DateTime<Utc>,
    milestones: Vec<Milestone>,
    raised: i64,
    backers: Vec<Uuid>,
    owner: Uuid,
}

impl CampaignRow {
    fn phase(&self) -> Phase {
        campaign::phase(Utc::now(), self.deadline, self.raised, self.goal)
    }
}

/// Kampaniyani qulflab (FOR UPDATE) o'qiydi: bir vaqtda ikki ovoz/hisobot poygasini oldini oladi.
async fn load_campaign(tx: &mut Tx<'_>, id: Uuid) -> ApiResult<CampaignRow> {
    let row: Option<(Uuid, i64, DateTime<Utc>, Value, Uuid)> = sqlx::query_as(
        "SELECT k.channel_id, k.goal, k.deadline, k.milestones, c.owner_id
         FROM campaigns k JOIN channels c ON c.id = k.channel_id WHERE k.id = $1 FOR UPDATE OF k",
    )
    .bind(id)
    .fetch_optional(&mut **tx)
    .await?;
    let (_channel_id, goal, deadline, ms, owner) = row.ok_or(ApiError::NotFound)?;
    let pledges: Vec<(Uuid, i64)> = sqlx::query_as("SELECT user_id, amount FROM pledges WHERE campaign_id = $1")
        .bind(id)
        .fetch_all(&mut **tx)
        .await?;
    let raised = pledges.iter().map(|p| p.1).sum();
    let mut backers: Vec<Uuid> = pledges.iter().map(|p| p.0).collect();
    backers.sort();
    backers.dedup();
    let milestones: Vec<Milestone> = serde_json::from_value(ms).map_err(|_| ApiError::Internal("milestones".into()))?;
    Ok(CampaignRow { goal, deadline, milestones, raised, backers, owner })
}

async fn create_campaign(State(st): State<AppState>, AuthUser(me): AuthUser, Path(cid): Path<Uuid>, Json(b): Json<NewCampaign>) -> ApiResult<Response> {
    if !len_ok(&b.title, 3, 120) || b.summary.chars().count() > 2000 {
        return bad("Loyiha nomi yoki tavsifi noto'g'ri");
    }
    let ms: Vec<(String, u32)> = b.milestones.iter().map(|m| (m.title.clone(), m.percent)).collect();
    campaign::validate_new(b.goal, b.days, &ms)?;
    let mut tx = st.pool.begin().await?;
    // Kanal qatorini qulflab, bir vaqtda ikkita kampaniya ochilishini oldini olamiz.
    let owner: Uuid = sqlx::query_scalar("SELECT owner_id FROM channels WHERE id = $1 FOR UPDATE")
        .bind(cid)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or(ApiError::NotFound)?;
    if owner != me {
        return Err(ApiError::Forbidden);
    }
    let last: Option<(Uuid,)> = sqlx::query_as("SELECT id FROM campaigns WHERE channel_id = $1 ORDER BY created_at DESC LIMIT 1")
        .bind(cid)
        .fetch_optional(&mut *tx)
        .await?;
    if let Some((lid,)) = last {
        let row = load_campaign(&mut tx, lid).await?;
        if !campaign::can_create(Some((row.phase(), &row.milestones))) {
            return Err(ApiError::Conflict("Bu kanalda faol kampaniya bor".into()));
        }
    }
    let milestones: Vec<Milestone> = b
        .milestones
        .iter()
        .enumerate()
        .map(|(i, m)| Milestone {
            id: format!("m{}", i + 1),
            title: m.title.trim().to_string(),
            percent: m.percent,
            status: campaign::Status::Locked,
            report: None,
            approvals: vec![],
        })
        .collect();
    sqlx::query("INSERT INTO campaigns (id, channel_id, title, summary, goal, deadline, milestones) VALUES ($1,$2,$3,$4,$5,$6,$7)")
        .bind(b.id)
        .bind(cid)
        .bind(b.title.trim())
        .bind(b.summary.trim())
        .bind(b.goal)
        .bind(Utc::now() + Duration::days(b.days))
        .bind(serde_json::to_value(&milestones).map_err(|_| ApiError::Internal("milestones".into()))?)
        .execute(&mut *tx)
        .await?;
    tx.commit().await?;
    Ok((StatusCode::CREATED, Json(json!({ "id": b.id }))).into_response())
}

#[derive(Deserialize)]
struct PledgeIn {
    id: Uuid,
    amount: i64,
}

async fn pledge(State(st): State<AppState>, AuthUser(me): AuthUser, Path(id): Path<Uuid>, Json(b): Json<PledgeIn>) -> ApiResult<Response> {
    if !(campaign::MIN_PLEDGE..=campaign::MAX_PLEDGE).contains(&b.amount) {
        return bad("Summa 1 000 so'mdan 1 mlrd so'mgacha bo'lishi kerak");
    }
    let mut tx = st.pool.begin().await?;
    let c = load_campaign(&mut tx, id).await?;
    if c.owner == me {
        return bad("O'z kampaniyangizni qo'llab-quvvatlay olmaysiz");
    }
    if c.phase() != Phase::Active {
        return bad("Kampaniya muddati tugagan");
    }
    sqlx::query("INSERT INTO pledges (id, campaign_id, user_id, amount) VALUES ($1,$2,$3,$4)")
        .bind(b.id)
        .bind(id)
        .bind(me)
        .bind(b.amount)
        .execute(&mut *tx)
        .await?;
    tx.commit().await?;
    Ok((StatusCode::CREATED, Json(json!({ "id": b.id }))).into_response())
}

#[derive(Deserialize)]
struct ReportIn {
    report: String,
}

async fn save_milestones(tx: &mut Tx<'_>, id: Uuid, ms: &[Milestone]) -> ApiResult<()> {
    sqlx::query("UPDATE campaigns SET milestones = $2 WHERE id = $1")
        .bind(id)
        .bind(serde_json::to_value(ms).map_err(|_| ApiError::Internal("milestones".into()))?)
        .execute(&mut **tx)
        .await?;
    Ok(())
}

async fn report(State(st): State<AppState>, AuthUser(me): AuthUser, Path(id): Path<Uuid>, Json(b): Json<ReportIn>) -> ApiResult<Response> {
    let mut tx = st.pool.begin().await?;
    let mut c = load_campaign(&mut tx, id).await?;
    if c.owner != me {
        return Err(ApiError::Forbidden);
    }
    if c.phase() != Phase::Funded {
        return bad("Hisobot faqat maqsad yig'ilgandan keyin yuboriladi");
    }
    campaign::submit_report(&mut c.milestones, &b.report)?;
    save_milestones(&mut tx, id, &c.milestones).await?;
    tx.commit().await?;
    Ok(ok())
}

async fn approve(State(st): State<AppState>, AuthUser(me): AuthUser, Path(id): Path<Uuid>) -> ApiResult<Response> {
    let mut tx = st.pool.begin().await?;
    let mut c = load_campaign(&mut tx, id).await?;
    if c.phase() != Phase::Funded {
        return bad("Kampaniya hali yig'ilmagan");
    }
    campaign::approve(&mut c.milestones, me, &c.backers)?;
    save_milestones(&mut tx, id, &c.milestones).await?;
    tx.commit().await?;
    Ok(ok())
}

// ---------- suhbat ----------

#[derive(Deserialize)]
struct OpenChat {
    id: Uuid,
    #[serde(rename = "otherUserId")]
    other: Uuid,
}

async fn open_chat(State(st): State<AppState>, AuthUser(me): AuthUser, Json(b): Json<OpenChat>) -> ApiResult<Json<Value>> {
    if b.other == me {
        return bad("O'zingiz bilan suhbat ochib bo'lmaydi");
    }
    let mut tx = st.pool.begin().await?;
    let existing: Option<Uuid> = sqlx::query_scalar(
        "SELECT c.id FROM chats c
         WHERE NOT c.is_group
           AND EXISTS (SELECT 1 FROM chat_members m WHERE m.chat_id = c.id AND m.user_id = $1)
           AND EXISTS (SELECT 1 FROM chat_members m WHERE m.chat_id = c.id AND m.user_id = $2)
         LIMIT 1",
    )
    .bind(me)
    .bind(b.other)
    .fetch_optional(&mut *tx)
    .await?;
    if let Some(id) = existing {
        return Ok(Json(json!({ "id": id })));
    }
    sqlx::query("INSERT INTO chats (id, is_group) VALUES ($1, false)").bind(b.id).execute(&mut *tx).await?;
    for u in [me, b.other] {
        sqlx::query("INSERT INTO chat_members (chat_id, user_id) VALUES ($1,$2)").bind(b.id).bind(u).execute(&mut *tx).await?;
    }
    tx.commit().await?;
    Ok(Json(json!({ "id": b.id })))
}

async fn send_message(State(st): State<AppState>, AuthUser(me): AuthUser, Path(chat): Path<Uuid>, Json(b): Json<NewComment>) -> ApiResult<Response> {
    if !len_ok(&b.content, 1, 2000) {
        return bad("Xabar 1-2000 belgi bo'lishi kerak");
    }
    let member: bool = sqlx::query_scalar("SELECT EXISTS (SELECT 1 FROM chat_members WHERE chat_id=$1 AND user_id=$2)")
        .bind(chat)
        .bind(me)
        .fetch_one(&st.pool)
        .await?;
    if !member {
        return Err(ApiError::Forbidden);
    }
    sqlx::query("INSERT INTO messages (id, chat_id, sender_id, content) VALUES ($1,$2,$3,$4)")
        .bind(b.id)
        .bind(chat)
        .bind(me)
        .bind(b.content.trim())
        .execute(&st.pool)
        .await?;
    Ok((StatusCode::CREATED, Json(json!({ "id": b.id }))).into_response())
}

async fn delete_message(State(st): State<AppState>, AuthUser(me): AuthUser, Path(id): Path<Uuid>) -> ApiResult<Response> {
    let n = sqlx::query("DELETE FROM messages WHERE id = $1 AND sender_id = $2").bind(id).bind(me).execute(&st.pool).await?.rows_affected();
    if n == 0 { Err(ApiError::Forbidden) } else { Ok(ok()) }
}

// ---------- bildirishnoma ----------

async fn read_all(State(st): State<AppState>, AuthUser(me): AuthUser) -> ApiResult<Response> {
    sqlx::query("UPDATE notifications SET read = true WHERE user_id = $1 AND NOT read").bind(me).execute(&st.pool).await?;
    Ok(ok())
}

#[cfg(test)]
mod handle_tests {
    use super::valid_handle;

    #[test]
    fn accepts_dots_hyphens_and_plain() {
        for ok in ["kun.uz", "kunuz", "kun-uz", "kun24", "dr.malika", "a.b-c"] {
            assert!(valid_handle(ok), "{ok} qabul qilinishi kerak");
        }
    }

    #[test]
    fn rejects_underscore_digit_start_and_double_separators() {
        for bad in ["kun_uz", "123uz", "kun__uz", "kun..uz", "kun.-uz", ".kun", "kun.", "kun-", "ab", "kun uz", "Kun.uz", "admin", "ad.min"] {
            assert!(!valid_handle(bad), "{bad} rad etilishi kerak");
        }
        assert!(!valid_handle(&"a".repeat(31)));
    }
}
