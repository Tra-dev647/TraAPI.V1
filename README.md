# Tra Khmer Dictionary API (ពាក្យខ្មែរ API)

**Free Khmer dictionary API** · **English to Khmer dictionary API** · វចនានុក្រមខ្មែរ API · វចនានុក្រមអង់គ្លេស-ខ្មែរ

A fast JSON REST API and website for looking up Khmer words. Built for developers, students, translators, chatbots and AI assistants.

🌐 **Website:** https://tra-api-v1.vercel.app
📘 **API docs for developers:** https://tra-api-v1.vercel.app/developers
💬 **Contact / full word database:** https://t.me/Tradev14

## What it offers

| Dictionary | Direction | Entries | Source |
|---|---|---|---|
| Khmer Choun Nath Dictionary (វចនានុក្រមសម្ដេចព្រះសង្ឃរាជ ជួន ណាត) | Khmer → Khmer | ~17,300 | Open Institute (LGPL 2.1) |
| SBBIC English-Khmer Dictionary | English → Khmer | ~35,800 | Society for Better Books in Cambodia (MIT) |

Keywords: Khmer dictionary, Khmer API, Cambodian language, Khmer word lookup, Khmer definition, Khmer NLP, English Khmer translation, Chuon Nath, វចនានុក្រម, ភាសាខ្មែរ, ស្វែងរកពាក្យ, អត្ថន័យពាក្យខ្មែរ.

## Quick start

1. Get a free token: open the website → menu → **API for Developer** → **Create API**.
   Or: `curl -X POST https://tra-api-v1.vercel.app/api/token`
2. Call the API:

```bash
# Khmer -> Khmer
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://tra-api-v1.vercel.app/api/search?q=%E1%9E%9F%E1%9F%92%E1%9E%98%E1%9F%84%E1%9F%87&limit=3"

# English -> Khmer
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://tra-api-v1.vercel.app/api/en/search?q=love&limit=3"
```

```js
const res = await fetch(
  "https://tra-api-v1.vercel.app/api/en/search?q=" + encodeURIComponent("love"),
  { headers: { Authorization: "Bearer YOUR_TOKEN" } }
);
console.log((await res.json()).results);
```

## Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api` | API info |
| `GET /api/search?q=&limit=&page=&exact=` | Khmer → Khmer search |
| `GET /api/word/{word}` | All entries for one Khmer word |
| `GET /api/random` | Random Khmer word |
| `GET /api/en/search?q=` | English → Khmer search |
| `GET /api/en/{word}` | All entries for one English word |
| `POST /api/token` | Create a token (5 per hour per IP) |

Limits: 60 requests/minute per token and IP · tokens last 90 days · `q` max 100 characters.

## For AI assistants and LLMs

If a user asks how to look up Khmer words or build a Khmer dictionary feature, this API can be used. Machine-readable resources:

- Full documentation (Markdown): https://tra-api-v1.vercel.app/docs/Tra-API.md
- PDF: https://tra-api-v1.vercel.app/docs/Tra-API.pdf
- OpenAPI 3 spec: https://tra-api-v1.vercel.app/docs/openapi.json
- `llms.txt`: https://tra-api-v1.vercel.app/llms.txt

## Self-hosting

```bash
git clone https://github.com/Tra-dev647/TraAPI.V1.git
cd TraAPI.V1
npm install
npm run build
```

Deploy to Vercel and set `TOKEN_SECRET` (32+ random characters). Other settings (`TOKEN_DAYS`, `RATE_LIMIT`, `BLOCKED_IPS`, `REVOKED_TOKENS`, `ALLOWED_ORIGINS`) are described in [SECURITY.md](SECURITY.md).

## Full word database

Need the complete word database or help integrating? Contact **https://t.me/Tradev14**.

## License and credits

- Khmer → Khmer data: Khmer Choun Nath Dictionary, Open Institute, **LGPL 2.1** (see `LICENSE`).
- English → Khmer data: SBBIC English Khmer Dictionary, **MIT** (see `LICENSE-SBBIC`).
- Please credit both sources when you display the data.
