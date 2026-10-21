import { createToken, send, guard } from "./_lib.js";

// POST /api/token  -> { token }
export default function handler(req, res) {
  if (guard(req, res, "POST")) return;
  if (!process.env.TOKEN_SECRET) {
    return send(res, 500, { error: "Server is missing TOKEN_SECRET environment variable." });
  }
  send(res, 200, { token: createToken(), usage: "Authorization: Bearer <token>" });
}
