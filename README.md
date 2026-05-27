# Reports_OCR

Standalone SRIAAS report OCR extraction backend powered by OpenAI.

## Endpoints

- `GET /health`
- `POST /api/v1/reports/extract`

## Environment

Copy `.env.example` to `.env` locally or set the same variables on Render.

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
REPORTS_OCR_TOKEN=
PORT=3105
```

## Extract Report

```bash
curl -X POST http://localhost:3105/api/v1/reports/extract \
  -H "Content-Type: application/json" \
  -H "X-Reports-OCR-Token: $REPORTS_OCR_TOKEN" \
  -d '{
    "report_type": "lft",
    "file_url": "https://example.com/report.pdf",
    "file_name": "report.pdf",
    "customer_id": "optional",
    "customer_email": "optional"
  }'
```

The response is compatible with the Flutter app report extraction shape:

```json
{
  "success": true,
  "report_type": "lft",
  "fields": [],
  "lft_score": 82,
  "cbc_score": null,
  "status": "Normal",
  "issues": [],
  "parameters": [],
  "raw_text_summary": "..."
}
```
