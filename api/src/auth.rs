use crate::{AppState, error::ApiError};
use argon2::{
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
    password_hash::SaltString,
};
use axum::{extract::FromRequestParts, http::request::Parts};
use rand::RngCore;
use sha2::{Digest, Sha256};
use uuid::Uuid;

pub const COOKIE: &str = "gsid";
pub const SESSION_DAYS: i64 = 30;

/// Kirgan foydalanuvchi (sessiya cookie'si orqali).
pub struct AuthUser(pub Uuid);

pub fn token_hash(token: &str) -> String {
    hex::encode(Sha256::digest(token.as_bytes()))
}

fn new_salt() -> SaltString {
    let mut b = [0u8; 16];
    rand::rng().fill_bytes(&mut b);
    SaltString::encode_b64(&b).expect("16 bayt salt")
}

pub fn new_token() -> String {
    let mut b = [0u8; 32];
    rand::rng().fill_bytes(&mut b);
    hex::encode(b)
}

pub fn cookie_value(parts: &Parts) -> Option<String> {
    let raw = parts.headers.get(axum::http::header::COOKIE)?.to_str().ok()?;
    raw.split(';')
        .filter_map(|kv| kv.trim().split_once('='))
        .find(|(k, _)| *k == COOKIE)
        .map(|(_, v)| v.to_string())
}

pub fn set_cookie(token: &str, secure: bool) -> String {
    format!(
        "{COOKIE}={token}; HttpOnly; SameSite=Lax; Path=/; Max-Age={}{}",
        SESSION_DAYS * 86_400,
        if secure { "; Secure" } else { "" }
    )
}

pub fn clear_cookie(secure: bool) -> String {
    format!("{COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0{}", if secure { "; Secure" } else { "" })
}

impl FromRequestParts<AppState> for AuthUser {
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, ApiError> {
        let token = cookie_value(parts).ok_or(ApiError::Unauthorized)?;
        let uid: Option<Uuid> =
            sqlx::query_scalar("SELECT user_id FROM sessions WHERE token_hash = $1 AND expires_at > now()")
                .bind(token_hash(&token))
                .fetch_optional(&state.pool)
                .await?;
        uid.map(AuthUser).ok_or(ApiError::Unauthorized)
    }
}

pub async fn hash_password(password: String) -> Result<String, ApiError> {
    tokio::task::spawn_blocking(move || {
        let salt = new_salt();
        Argon2::default()
            .hash_password(password.as_bytes(), &salt)
            .map(|h| h.to_string())
            .map_err(|e| ApiError::Internal(format!("hash: {e}")))
    })
    .await
    .map_err(|e| ApiError::Internal(format!("join: {e}")))?
}

/// `hash` None bo'lsa ham xuddi shunday og'ir hisob bajariladi (foydalanuvchi mavjudligini vaqt bo'yicha bildirmaslik uchun).
pub async fn verify_password(password: String, hash: Option<String>) -> bool {
    tokio::task::spawn_blocking(move || match hash {
        Some(h) => PasswordHash::new(&h)
            .map(|p| Argon2::default().verify_password(password.as_bytes(), &p).is_ok())
            .unwrap_or(false),
        None => {
            let salt = new_salt();
            let _ = Argon2::default().hash_password(password.as_bytes(), &salt);
            false
        }
    })
    .await
    .unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn token_hash_is_stable_and_hex() {
        assert_eq!(token_hash("a"), token_hash("a"));
        assert_ne!(token_hash("a"), token_hash("b"));
        assert_eq!(token_hash("a").len(), 64);
        assert_eq!(new_token().len(), 64);
    }

    #[tokio::test]
    async fn password_roundtrip() {
        let h = hash_password("parol-12345".into()).await.unwrap_or_default();
        assert!(verify_password("parol-12345".into(), Some(h.clone())).await);
        assert!(!verify_password("boshqa".into(), Some(h)).await);
        assert!(!verify_password("x".into(), None).await);
    }

    #[test]
    fn cookie_format() {
        assert!(set_cookie("t", true).contains("Secure"));
        assert!(!set_cookie("t", false).contains("Secure"));
        assert!(clear_cookie(true).contains("Max-Age=0"));
    }
}
