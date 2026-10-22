import { createToken, tokenDays, send, guard } from "./_lib.js";
import { clientIp, hit, isBlockedIp, sameOrigin } from "./_security.js";

// POST /api/token  -> { token }
export default function handler(req, res) {
  if (guard(req, res, "POST")) return;
  if (isBlockedIp(req)) return send(res, 403, { error: "Access denied." });
  if (!sameOrigin(req)) return send(res, 403, { error: "Origin not allowed." });
  // Max 5 new tokens per hour per IP.
  const r = hit(`token:${clientIp(req)}`, 5, 60 * 60 * 1000);
  if (!r.ok) {
    res.setHeader("Retry-After", String(r.retryAfter));
    return send(res, 429, { error: "Too many tokens requested. Try again later.", retryAfter: r.retryAfter });
  }
  if (!process.env.TOKEN_SECRET) {
    return send(res, 500, { error: "Server is missing TOKEN_SECRET environment variable." });
  }
  const days = tokenDays();
  send(res, 200, {
    token: createToken(),
    expiresAt: days > 0 ? new Date(Date.now() + days * 86400000).toISOString() : null,
    usage: "Authorization: Bearer <token>"
  });
}
