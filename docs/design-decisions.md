# Design Decisions

This document explains the engineering rationale behind the Card Validator API. For setup and usage, see the [README](../README.md).

## Overview

The Card Validator API is a minimal, stateless REST API that validates payment card numbers using the [Luhn Formula](https://www.pcisecuritystandards.org/faqs/1137/ "PCI Security Standards Council FAQ on the Luhn Formula / Modulus 10"). It is a technical assessment project, not production payment infrastructure.

## Project Structure

The application follows a minimal MVC-inspired architecture:

```
HTTP Request → Middleware → Route → Controller → Service → Luhn Algorithm → HTTP Response
```

- **Routes** connect incoming requests to controllers and contain little to no logic.
- **Controllers** handle the HTTP boundary: reading request data, calling services, and constructing responses. They do not contain the validation algorithm itself.
- **Services** contain application logic: validating input, enforcing card number constraints, invoking the Luhn algorithm, and throwing expected application errors. Services do not construct Express responses directly.

Intended dependency direction:

```
Route → Controller → Service → Reusable Library Logic
```

A conventional Express app might use `controllers/`, `services/`, and `routes/` folders. Since this project currently has only one route, controller, and service, separate single-file folders would add unnecessary structural overhead. Folders (`middleware/`, `lib/`, `types/`) are used only where multiple related files already exist. The structure is expected to evolve as the application grows. No dependency injection framework is used, but the module boundaries provide a foundation for one if needed later.

## Why Express, Not NestJS

Express meets the project's actual requirements — HTTP server, routing, JSON parsing, middleware, and error handling — with minimal abstraction. NestJS offers useful abstractions (modules, decorators, dependency injection, guards, pipes, interceptors) for larger applications, but this project isn't large enough to justify that added complexity. The guiding principle: framework choice should be proportional to the problem.

## API Design

### Versioning

All endpoints are served under `/api/v1`. The version is treated as part of the API contract, not environment-specific configuration — unlike values such as ports or secrets, which do belong in environment variables. A future `/api/v2` could be introduced without breaking `v1`.

### Why POST

`POST /api/v1/card-validations` is used because the card number is submitted in the request body rather than the URL, keeping it out of logs/history and allowing a more extensible request structure.

### Why 200 OK (Not an Error)

A card number that is correctly formatted but fails the Luhn checksum is **not** an HTTP error — the server successfully received, processed, and validated the input. The result (`isValid: false`) is returned with `200 OK`.

### Why Not 201 Created

`201 Created` implies a new resource was created and persisted. This endpoint performs a stateless computation (card number → validation → result) and stores nothing, so `200 OK` is the semantically correct response for both valid and invalid outcomes.

## Validation Strategy

Input passes through staged checks before reaching the Luhn algorithm:

```
Request → Exists? → Correct Type? → Numeric Only? → Correct Length? → Luhn Check → Result
```

This separates **invalid API input** (missing/malformed `cardNumber` → `400 Bad Request`) from **validly formatted input that simply fails the checksum** (→ `200 OK`, `isValid: false`).

### Card Number Constraints

A card number must be a digit-only string between 10 and 19 characters (see [ISO/IEC 7812-1:2017](https://www.iso.org/standard/70484.html "ISO standard for the Primary Account Number numbering system")). Network-specific validation (Visa, Mastercard, Verve, etc.) was considered but excluded from this minimal scope, since accurate network detection requires maintained issuer identification ranges rather than simplistic prefix rules.

### Card Number Formatting

Only contiguous digits are accepted (`4111111111111111`), not spaced or hyphenated formats (`4111 1111 1111 1111`, `4111-1111-1111-1111`). Supporting separators would introduce open-ended questions about which separators are allowed, whether they can be mixed, and how digits should be grouped. Presentation formatting is left to the frontend, which is expected to submit normalized digits. This keeps the API contract simple and predictable.

### Luhn Algorithm

The Luhn checksum is implemented internally in `src/lib/luhn-checksum.ts`; see the [Luhn algorithm reference](https://en.wikipedia.org/wiki/Luhn_algorithm) for the underlying method. No external validation library is used — the algorithm is small, well established, and implementing it directly avoids an unnecessary dependency while keeping the logic transparent and easy to unit test. An external library may become worthwhile if the project later needs multiple validation algorithms, card network detection, or issuer metadata.

**Note:** ISO/IEC 7812 concerns card number identification structure; it does not define the Luhn algorithm. The two are related but distinct concepts.

Passing Luhn validation does not prove a card exists, was issued, is active, belongs to a real person, has not expired, has available funds, or can be authorized — the API performs checksum validation only.

## Error Handling

Errors are handled in three categories:

- **Application errors** — expected failures such as a missing `cardNumber`, wrong type, invalid characters, or invalid length. These are represented with a custom `HTTPError` (`src/lib/http-error.ts`), thrown by the service, and converted into HTTP responses by centralized error middleware. The service never constructs Express responses directly.
- **Application-boundary errors** — errors occurring before a request reaches routing, such as malformed JSON. These are handled at the boundary and return `400 Bad Request` rather than being treated as generic `500` errors.
- **Unexpected errors** — unhandled internal failures return a generic `500 Internal Server Error` without exposing internal implementation details.

### HTTP Status Code Constants

Status codes are defined as a frozen constants object (`src/lib/http-status-codes.ts`) rather than a TypeScript `enum`, with a derived union type for type safety.

### Not Found Handling

Unregistered routes are handled by dedicated not-found middleware, placed after application routes and before the error middleware:

```
Application Middleware → Routes → Not Found Middleware → Error Middleware
```

## Type Safety

The project uses strict TypeScript for response structures, validation types, status codes, and errors. TypeScript only provides compile-time guarantees, though — an HTTP client can still send `cardNumber: 123456` or an empty body at runtime. Runtime validation in the service layer is therefore required in addition to static typing.

## API Response Design

Responses use a consistent envelope with an application-level `status` field (`"success"` / `"error"`) alongside the authoritative HTTP status code, keeping success and error shapes predictable for consumers.

## Logging

[Morgan](https://github.com/expressjs/morgan "HTTP request logger middleware for Node.js") logs HTTP method, path, status code, and timing during development. It is not necessarily the production logging solution; production deployments may rely on cloud logging, container logs, or dedicated structured logging infrastructure instead.

## Environment Configuration

Environment variables are reserved for values that vary between environments (e.g. `PORT`), as opposed to the API base path, which is treated as part of the API contract. Environment files should not contain committed secrets.

## Why No Database

The API is stateless (`Request → Validate → Respond`) and has no current need for validation history, user accounts, sessions, or persistent records. Adding a database would add complexity without supporting any current requirement.

## Why No Authentication or Authorization

Identifying or authenticating users, managing accounts, issuing tokens, and managing sessions or permissions are outside the scope of this stateless validation API.

## Testing Strategy

Automated unit and integration tests have been implemented — twenty-eight (28) tests across four (4) suites — in addition to the manual exploratory testing performed against valid card numbers, invalid checksums, missing/empty request bodies, missing `cardNumber`, invalid types/characters/lengths, malformed JSON, unsupported HTTP methods, and unknown routes.

The native `node:test` and `node:assert/strict` modules were adopted to reduce external dependencies while providing the core functionality required for test execution, grouping, and assertions. **Supertest** was introduced specifically for HTTP integration testing because it provides a convenient interface for making requests directly against the Express application without manually starting or managing the development server. This allows integration tests to exercise the application's HTTP request lifecycle in an isolated and automated manner.

The adopted automated structure:

```
tests/
├── unit/
│   ├── luhn-checksum.test.ts
│   └── card-validation.service.test.ts
│
└── integration/
    └── card-validation.test.ts
```

- **Unit tests** cover Luhn algorithm behavior and service-level input validation in isolation.
- **Integration tests** exercise the full HTTP request lifecycle, including Express request parsing, routing, controllers, services, error middleware, and HTTP responses. Tests verify status codes, response shapes, and the handling of invalid or malformed input.

## Security Considerations

Card numbers are processed only for the duration of a request and are never persisted. The application does not implement payment processing, card storage, authentication, or authorization, and should not be described as PCI DSS compliant — it is a validation API, not production payment infrastructure.

## Possible Future Extensions

- **Card network detection** — using accurate, maintained issuer identification ranges rather than simplistic prefix rules (e.g. not "starts with 4 = Visa").
- **Formatted card number support** — accepting spaces/hyphens, with an explicit contract for allowed separators and grouping.
- **Swagger/OpenAPI documentation** at `/api/v1/docs`.
- **Structured, production-oriented logging.**
- **Rate limiting** to protect the public endpoint.
- **Reusable request-validation middleware** as the API surface grows.
- **Network-specific validation rules** where appropriate.

## Limitations

- No card network detection.
- No support for formatted (spaced/hyphenated) card numbers.
- No persistence, authentication, or authorization.
- Luhn validation confirms checksum correctness only — not that a card is real, active, or usable.

## References

- [Luhn algorithm](https://www.pcisecuritystandards.org/faqs/1137/ "PCI Security Standards Council FAQ on the Luhn Formula / Modulus 10")
- [ISO/IEC 7812](https://www.iso.org/standard/70484.html "ISO standard for the Primary Account Number numbering system") — payment card numbering and PAN structure
- [README](../README.md)
