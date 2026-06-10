# FinTechCo Payments: Architecture Explainer

*5-minute walk-through version. For operational detail see `docs/architecture.md`.*

## Overview

Three TypeScript services plus a shared library. The API Gateway is the only service exposed to the internet. Payments Core is the business logic layer. The Notification Worker handles async dispatch of payment outcomes.

## Service map

```
 External Clients
        |
        | HTTPS  Bearer <token>
        v
  +---------------------+
  |    API Gateway      |  port 3001
  |  authMiddleware     |  validates token length
  |  /api/v1/payments/* |
  +----------+----------+
             |
             | in-process call (same Node.js process in this repo)
             | production: internal HTTP between services
             v
  +---------------------+
  |   Payments Core     |
  |  validatePayment()  |  checks: id, amount, currency, customerId
  |  processPayment()   |  generates ID, sets PENDING status
  +----------+----------+
             |
             | (manual dispatch; auto-wiring is an open gap)
             v
  +---------------------+
  |  Notification       |
  |  Worker             |  handler registry pattern
  |  email handler      |  logs to console in dev; SES in prod (FIN-8890)
  +---------------------+

  +---------------------+
  |  src/shared/        |  imported by all three services
  |  types.ts           |  Payment, Notification, ValidationResult
  |  constants.ts       |  SUPPORTED_CURRENCIES, amount limits, port map
  |  utils.ts           |  generateId(), formatAmount()
  +---------------------+
```

## Request lifecycle

A client POSTs `{ amount, currency, customerId }` with a Bearer token:

1. **Auth check** (API Gateway): token must start with `Bearer ` and be 16+ chars. Reject 401 otherwise.
2. **Route** (API Gateway): extract fields, call `processPayment()`.
3. **Validate** (Payments Core): check ID present, amount in range, currency supported, customerId present. Return errors if any.
4. **Process** (Payments Core): generate a `pay_NNNNNN` ID, stamp status as `PENDING`, return the payment object.
5. **Respond** (API Gateway): 201 with `{ paymentId, paymentStatus, createdAt }` on success; 400 with `{ errors }` on failure.
6. **Notify** (Notification Worker): payment outcome dispatched to all registered handlers (email, etc.).

## Design decisions worth noting

**Handler registry pattern.** The worker uses a simple array of async handlers instead of a message queue. This is easy to test and extend (call `registerHandler()`) but provides no durability. Production would replace this with SQS or similar (FIN-8890).

**Deterministic ID generation.** `generateId()` uses an incrementing counter, not `Math.random()` or `Date.now()`. This makes test output predictable and avoids flaky assertions on ID format.

**In-process services.** In this demo repo the "services" are TypeScript modules that import each other directly. In production they communicate over internal HTTP. The abstraction boundary is maintained by convention (no cross-service imports except through `src/shared/`).

## What to read next

- `src/payments-core/validator.ts` for the validation rules
- `src/__tests__/validator.test.ts` for the expected behavior as runnable specs
- `docs/architecture.md` for historical context (note the stale Settlement Service entry)
