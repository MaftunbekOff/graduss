use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde_json::json;

pub enum ApiError {
    Unauthorized,
    Forbidden,
    NotFound,
    Bad(String),
    Conflict(String),
    Internal(String),
}

pub type ApiResult<T> = Result<T, ApiError>;

pub fn bad<T>(msg: &str) -> ApiResult<T> {
    Err(ApiError::Bad(msg.to_string()))
}

impl From<sqlx::Error> for ApiError {
    fn from(e: sqlx::Error) -> Self {
        let code = e.as_database_error().and_then(|d| d.code().map(|c| c.to_string()));
        match code.as_deref() {
            Some("23505") => ApiError::Conflict("Bunday yozuv allaqachon mavjud".into()),
            Some("23503") => ApiError::NotFound,
            _ => {
                tracing::error!("db xatosi: {e}");
                ApiError::Internal("Ichki xatolik".into())
            }
        }
    }
}

impl From<&'static str> for ApiError {
    fn from(msg: &'static str) -> Self {
        ApiError::Bad(msg.to_string())
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, msg) = match self {
            ApiError::Unauthorized => (StatusCode::UNAUTHORIZED, "Kirish talab qilinadi".to_string()),
            ApiError::Forbidden => (StatusCode::FORBIDDEN, "Ruxsat yo'q".to_string()),
            ApiError::NotFound => (StatusCode::NOT_FOUND, "Topilmadi".to_string()),
            ApiError::Bad(m) => (StatusCode::BAD_REQUEST, m),
            ApiError::Conflict(m) => (StatusCode::CONFLICT, m),
            ApiError::Internal(m) => (StatusCode::INTERNAL_SERVER_ERROR, m),
        };
        (status, Json(json!({ "error": msg }))).into_response()
    }
}
