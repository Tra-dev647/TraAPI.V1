# Security settings (Vercel → Settings → Environment Variables)

| Variable | Purpose | Default |
|---|---|---|
| `TOKEN_SECRET` | Signs tokens. Required. Use 32+ random chars. | – |
| `TOKEN_DAYS` | Token lifetime in days (`0` = never expires) | 90 |
| `RATE_LIMIT` | Requests per minute per token+IP | 60 |
| `REVOKED_TOKENS` | Comma-separated tokens to ban | – |
| `BLOCKED_IPS` | Comma-separated IPs to ban | – |
| `ALLOWED_ORIGINS` | Extra websites allowed to request tokens | – |

Built in: 5 tokens/hour/IP, 20 bad-token tries/10 min/IP, query length caps,
security headers + CSP, same-origin check on `/api/token`.
Counters are per-serverless-instance (best effort). For hard limits add a
Vercel Firewall rate-limit rule on `/api/*` and `/api/token`.
Rotate `TOKEN_SECRET` to invalidate ALL tokens at once.
