# Exercise: Odometer Reading Service

## Overview

**Estimated time:** 3–4 hours

Please don't spend more than that. We respect your time and will evaluate accordingly.

At Just Insure, we offer pay-per-mile car insurance. One of the ways we verify a customer's mileage is by asking them to submit a photo of their odometer. To process these at scale, we need a service that can automatically extract the mileage reading from an image.

This is a real problem we've solved at Just. Your task is to build a small service that does the same thing.

---

## The Task

Build a Node.js HTTP service in TypeScript with a single endpoint:

```
POST /odometer/reading
```

The endpoint should:

- Accept an image (JPEG or PNG) of a car odometer
- Return the mileage reading extracted from the image
- Handle cases where the reading cannot be determined

### Success Response

```json
{
  "reading": 48253,
  "unit": "miles",
  "confidence": "high"
}
```

### Unreadable Image Response

```json
{
  "error": "UNREADABLE_IMAGE",
  "message": "Could not extract a mileage reading from the provided image"
}
```

---

## Requirements

### Functional Requirements

- Accept image uploads via:
    - `multipart/form-data`, or
    - Base64-encoded image in a JSON payload
- Extract the numeric odometer reading from the image
- Return a structured JSON response
- Handle error cases gracefully:
    - Missing image
    - Unsupported file type
    - Unreadable image
    - Other invalid inputs

### Non-Functional Requirements

- Written in TypeScript with strict mode enabled
- Include tests
- Include a README with setup instructions

### OCR Approach

Use any OCR solution you think is appropriate.

If your chosen approach requires credentials:

- Include clear setup instructions
- Provide a mock/stub mode so we can evaluate the service without creating an account

---

## Test Images

A set of odometer images is included in the `/images` folder of the base repository.

Clone the repository to get started:

```bash
git clone https://github.com/just-insure/backend-exercise-odometer.git
```

---

## What to Submit

Provide a folder or repository link containing:

- Service source code
- Tests
- README with setup instructions
- A copy of your chat with Claude (or a similar AI assistant)

Using AI such as Claude for this task is completely fine, and we ask that you include a copy of your chat/conversation with the AI assistant as part of your submission.

To be clear about why: we want to see how you think about a problem, and how you work with an agent. We're interested in how you use AI to help *yourself* think through a problem.

---

## How We'll Evaluate Your Submission

We are not looking for a production-ready system.

We are evaluating:

- How you think through problems
- How you structure code
- How you communicate technical decisions

---

## Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/just-insure/backend-exercise-odometer.git
cd backend-exercise-odometer

# Install dependencies
npm install
```

### Running the Service

```bash
# Start the server (runs on http://localhost:3000)
npm start

# Health check endpoint
curl http://localhost:3000/health
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch
```

**Test Results:** 53/53 passing ✓
- 18 service layer unit tests
- 30 HTTP route validation tests
- 5 real-world integration tests with actual odometer images

---

## API Usage Examples

### Multipart Form Upload

```bash
curl -X POST http://localhost:3000/odometer/reading \
  -F "image=@/path/to/odometer.jpg"
```

### Base64 JSON Upload

```bash
curl -X POST http://localhost:3000/odometer/reading \
  -H "Content-Type: application/json" \
  -d '{
    "image": "'$(base64 -i /path/to/odometer.jpg)'",
    "filename": "odometer.jpg"
  }'
```

### Response: Success (200)

```json
{
  "reading": 48253,
  "unit": "miles",
  "confidence": "high"
}
```

### Response: Error (400)

```json
{
  "error": "UNREADABLE_IMAGE",
  "message": "Could not extract a mileage reading from the provided image"
}
```

---

## Project Structure

```
src/
├── types.ts                 # TypeScript interfaces and enums
├── constants.ts             # Error codes, thresholds, messages
├── odometer.service.ts      # Core business logic
├── app.ts                   # Express HTTP server
├── ocr.provider.ts          # OCR provider interface
├── ocr.provider.impl.ts     # Tesseract.js implementation
├── index.ts                 # Server entry point
├── utils/
│   ├── confidence.ts        # Confidence level mapping
│   └── error.ts             # Error response helpers
└── __tests__/
    ├── odometer.service.test.ts    # Service unit tests
    ├── routes.test.ts              # HTTP route tests
    └── integration.real-images.test.ts  # Real image tests
```

---

## Technical Approach

This service uses **Test-Driven Development (TDD)** with three layers of testing:

1. **Unit Tests** - Core business logic (confidence mapping, validation)
2. **Route Tests** - HTTP API contract with mocked OCR
3. **Integration Tests** - Real Tesseract.js OCR with actual odometer images

### OCR Implementation

**Library:** Tesseract.js (WASM-based)
- ✅ Provides confidence scores (0-100)
- ✅ Works in Node.js and browsers
- ✅ No external API dependencies
- ✅ Open-source

### Confidence Mapping

```
OCR Confidence     →    Response Confidence
≥ 75%              →    "high"
70-74%             →    "medium"
60-69%             →    "low"
< 60%              →    UNREADABLE_IMAGE (error)
```

### Supported Formats

- **Input:** JPEG, PNG (max 5MB)
- **Upload Methods:** Multipart form-data, Base64 JSON
- **Output:** JSON with reading, unit, confidence

---

## Error Codes

| Error Code | Status | Meaning |
|-----------|--------|---------|
| `MISSING_IMAGE` | 400 | No image provided |
| `UNSUPPORTED_FILE_TYPE` | 400 | Not JPEG or PNG |
| `INVALID_REQUEST` | 400 | Malformed request data |
| `FILE_TOO_LARGE` | 400 | Exceeds 5MB limit |
| `UNREADABLE_IMAGE` | 400 | OCR couldn't extract reading |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Development & Chat History

This project was built using **Test-Driven Development** with Claude as an AI coding assistant.

For details on the development process, technical decisions, and how problems were solved:

- **[CLAUDE_CHAT_HISTORY.md](./CLAUDE_CHAT_HISTORY.md)** — Curated summary of approach, decisions, and outcomes
- **[CLAUDE_CHAT_TRANSCRIPT.md](./CLAUDE_CHAT_TRANSCRIPT.md)** — Full conversation transcript

---

## Questions?

If anything is unclear, please contact:

[**vitalij@just.insure**](mailto:vitalij@just.insure)

We'd rather you ask than make assumptions.
