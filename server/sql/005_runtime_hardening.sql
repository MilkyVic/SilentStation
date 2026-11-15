CREATE TABLE IF NOT EXISTS runtime_rate_limits (
 bucket TEXT PRIMARY KEY, requests INTEGER NOT NULL DEFAULT 0,
 window_started TIMESTAMPTZ NOT NULL, last_sent_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS runtime_rate_expiry ON runtime_rate_limits(window_started);
