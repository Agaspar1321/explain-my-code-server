# ExplainMyCode API

The backend for [ExplainMyCode](https://explainmycode2.netlify.app). It takes a block of code and returns a plain-English explanation from the Anthropic API.

The frontend is in [explain-my-code](https://github.com/Agaspar1321/explain-my-code). The browser only ever talks to this Express server, so the API key never leaves it.

## Endpoint

`POST /explain`

```json
{ "code": "const x = [1, 2, 3].map(n => n * 2);", "language": "javascript" }
```

`language` is optional; leave it out (or send `"auto"`) to let the model work it out. The response is `{ "explanation": "..." }` in markdown, always with the same four headings: summary, walkthrough, concepts to look up, what to learn next.

## Limits

- 20 requests per IP every 15 minutes (express-rate-limit)
- 8,000 characters of code per request
- `400` for empty or oversized input, `500` if the upstream call fails

## Stack

Node.js, Express, the Anthropic SDK (Claude Haiku 4.5), express-rate-limit, cors. Hosted on Render.

## Run it locally

```bash
npm install
```

Add `.env` with your key:

```
ANTHROPIC_API_KEY=your_key
```

Then `node server.js`. It listens on port 3000.
