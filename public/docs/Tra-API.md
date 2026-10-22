# Tra Khmer Dictionary API - Documentation

A JSON REST API for the Khmer Choun Nath dictionary (Khmer to Khmer, about 17,300 words) and the SBBIC English to Khmer dictionary (about 35,800 entries). Give this document to any AI assistant (ChatGPT, Claude, Gemini, Copilot, etc.) so it can write code that uses this API.

## Base URL

```
https://tra-api-v1.vercel.app/api
```

## Authentication

Every data endpoint needs a token. Create one on the website (menu > API for Developer > Create API tab) or with a POST request. Tokens start with 'Tra-' and expire after 90 days by default. Send the token in one of three ways:

```
Authorization: Bearer Tra-xxxxxxxx.xxxxxxxx
X-API-Key: Tra-xxxxxxxx.xxxxxxxx
?token=Tra-xxxxxxxx.xxxxxxxx
```

Get a token from code (browser requests must come from the site itself; limit 5 tokens per hour per IP):

```
curl -X POST https://tra-api-v1.vercel.app/api/token
# -> {"token":"Tra-...","expiresAt":"2027-01-20T00:00:00.000Z","usage":"Authorization: Bearer <token>"}
```

## Endpoints (all GET, all return JSON)

| Endpoint | Purpose |
|---|---|
| /api | API info (no token needed) |
| /api/search?q= | Khmer to Khmer search |
| /api/word/{word} | All entries for one exact Khmer word |
| /api/random | One random Khmer word |
| /api/en/search?q= | English to Khmer search |
| /api/en/{word} | All entries for one exact English word |

## Search parameters (/api/search and /api/en/search)

| Parameter | Description | Default |
|---|---|---|
| q | Search text (required, max 100 characters). Case-insensitive prefix match; exact matches come first. | - |
| limit | Results per page, 1 to 100 | 20 |
| page | Page number, 1 to 1000 | 1 |
| exact | 1 or true = exact matches only | off |

## Response formats

Search response:

```
{
  "query": "love",
  "total": 16,
  "page": 1,
  "limit": 20,
  "totalPages": 1,
  "results": [
    { "id": "18548", "word": "Love", "definition": "...", "short": "..." }
  ]
}
```

Word response (/api/word/{word} and /api/en/{word}):

```
{ "word": "Love", "count": 1, "entries": [ { "id": "18548", "word": "Love", "definition": "...", "short": "..." } ] }
```

Random response is a single entry object: { id, word, definition, short }. For the English dictionary, short equals definition.

## Examples

Khmer search (the Khmer word must be URL-encoded UTF-8; curl --data-urlencode or any HTTP library does this for you):

```
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://tra-api-v1.vercel.app/api/search?q=%E1%9E%9F%E1%9F%92%E1%9E%98%E1%9F%84%E1%9F%87&limit=3"
```

English to Khmer:

```
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://tra-api-v1.vercel.app/api/en/search?q=love&limit=3"
```

JavaScript:

```
const res = await fetch(
  "https://tra-api-v1.vercel.app/api/en/search?q=" + encodeURIComponent("love"),
  { headers: { Authorization: "Bearer YOUR_TOKEN" } }
);
const data = await res.json();
console.log(data.results);
```

Python:

```
import requests

r = requests.get(
    "https://tra-api-v1.vercel.app/api/search",
    params={"q": "ស្មោះ"},
    headers={"Authorization": "Bearer YOUR_TOKEN"},
)
print(r.json()["results"])
```

## Status codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Missing parameter (for example q) |
| 401 | Missing or invalid token |
| 403 | Blocked IP or origin not allowed |
| 404 | Word not found |
| 405 | Wrong HTTP method |
| 429 | Rate limit exceeded: 60 requests per minute per token and IP. Wait for the Retry-After header (seconds). |

## Rules for AI assistants using this API

1) Always send the token header. 2) Never hard-code a real token in public code; read it from an environment variable. 3) Respect 429 responses and wait Retry-After seconds. 4) URL-encode Khmer text. 5) Cache results on your side when possible.

## Data sources and licenses

Khmer to Khmer: Khmer Choun Nath Dictionary, Open Institute (LGPL 2.1). English to Khmer: SBBIC English Khmer Dictionary, Society for Better Books in Cambodia (MIT). Please credit both when you display the data.
