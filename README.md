# Card Validator API

A minimal REST API that validates payment card numbers using the [Luhn Formula](https://www.pcisecuritystandards.org/faqs/1137/ "PCI Security Standards Council FAQ on the Luhn Formula / Modulus 10").

The API accepts a card number, validates the request input, checks the card number against the Luhn checksum, and returns whether it is valid.

This project is intentionally small and stateless. It is **not** a payment processing system. Passing the Luhn algorithm does not mean that a card exists, was issued, is active, belongs to a real person, has available funds, or can be used to complete a transaction — it only means the number satisfies the implemented validation rules and the Luhn checksum.

## Features

- Validates card number presence, type, format, and length.
- Validates card numbers using the Luhn checksum algorithm.
- Consistent JSON response structure for success and error cases.
- Centralized error handling.

## Technology Stack

- Node.js
- [Express](https://expressjs.com/)
- TypeScript
- [Morgan](https://github.com/expressjs/morgan) (development request logging)

See [Design Decisions](docs/design-decisions.md) for the rationale behind these choices.

## Prerequisites

- Node.js (LTS recommended)
- npm

## Installation

```bash
git clone <repository-url>
cd card-validator-api
npm install
```

## Environment Configuration

The application supports environment-based configuration. The development command loads variables from `.env.dev` using Node.js's `--env-file` option.

| Variable | Required | Default | Description                |
| -------- | -------- | ------- | -------------------------- |
| `PORT`   | No       | `3000`  | Port the server listens on |

Example `.env.dev`:

```
PORT=3000
```

Environment files should not contain committed secrets.

## Running the Application

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## API Usage

Base path: `/api/v1`

### Validate a Card Number

```
POST /api/v1/card-validations
```

**Request body:**

```json
{
  "cardNumber": "4111111111111111"
}
```

`cardNumber` must:

- Be provided.
- Be a string.
- Contain only digits (no spaces or separators).
- Contain between 10 and 19 digits.

### Card Number Length

The API accepts card numbers containing between 10 and 19 digits. This range is based on the Primary Account Number (PAN) numbering structure defined by [ISO/IEC 7812-1:2017](https://www.iso.org/standard/70484.html "ISO standard for the Primary Account Number numbering system").

The API does not currently apply card-network-specific length rules. Instead, it validates the general PAN format and applies the Luhn checksum.

> A successful Luhn validation does not confirm that a card has been issued, is active, or can be used for payment.

### Example Request

```bash
curl -X POST http://localhost:3000/api/v1/card-validations \
  -H "Content-Type: application/json" \
  -d "{\"cardNumber\":\"4111111111111111\"}"
```

### Example Response — Valid Card

`200 OK`

```json
{
  "status": "success",
  "message": "Card validation completed",
  "data": {
    "isValid": true
  }
}
```

### Example Response — Failed Checksum

A correctly formatted card number that fails the Luhn checksum is still a successfully processed request.

`200 OK`

```json
{
  "status": "success",
  "message": "Card validation completed",
  "data": {
    "isValid": false
  }
}
```

### Example Response — Invalid Request

`400 Bad Request`

```json
{
  "status": "error",
  "message": "cardNumber is required"
}
```

Other invalid input (wrong type, non-numeric characters, invalid length) returns a similarly structured `400` error.

### Example Response — Server Error

`500 Internal Sever Error`

```json
{
  "status": "error",
  "message": "Internal Server Error"
}
```

## Project Structure

```
src/
├── app.ts
├── server.ts
├── card-validation.routes.ts
├── card-validation.controller.ts
├── card-validation.service.ts
│
├── middlewares/
│   └── error.middleware.ts
│
├── lib/
│   ├── http-error.ts
│   ├── http-status-codes.ts
│   └── luhn.ts
│
└── types/
    └── card-validation.types.ts
```

The project currently has only one route, controller, and service, so they live directly under `src/` rather than in separate folders. See [Design Decisions](docs/design-decisions.md) for the reasoning.

## Testing

Automated tests have not yet been implemented. The API has been manually, exploratively tested against valid card numbers, invalid checksums, missing/empty request bodies, missing or malformed `cardNumber`, invalid lengths, malformed JSON, unsupported HTTP methods, and unknown routes.

## Future API Documentation

Swagger/OpenAPI documentation at `/api/v1/docs` is a possible future enhancement and is not currently implemented.

## Learn More

For detailed engineering rationale behind the architecture, API design, and validation strategy, see [Design Decisions](docs/design-decisions.md).
