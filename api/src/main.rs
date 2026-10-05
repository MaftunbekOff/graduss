mod auth;
mod campaign;
mod error;
mod read;
mod routes;

use sqlx::{PgPool, postgres::PgPoolOptions};

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub cookie_secure: bool,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .init();

    let url = std::env::var("DATABASE_URL")?;
    let bind = std::env::var("BIND").unwrap_or_else(|_| "127.0.0.1:8095".into());
    let cookie_secure = std::env::var("COOKIE_SECURE").map(|v| v != "0" && v != "false").unwrap_or(true);

    let pool = PgPoolOptions::new().max_connections(8).connect(&url).await?;
    sqlx::migrate!("./migrations").run(&pool).await?;

    let app = routes::router(AppState { pool, cookie_secure });
    let listener = tokio::net::TcpListener::bind(&bind).await?;
    tracing::info!("graduss-api {bind} da tinglayapti");
    axum::serve(listener, app)
        .with_graceful_shutdown(async {
            let _ = tokio::signal::ctrl_c().await;
        })
        .await?;
    Ok(())
}
