# Root Cause Analysis: Checkout Latency Spike (ALT-20260609-00341)

**Incident:** P99 checkout latency 2411ms (SLO: 500ms)
**Filed:** 2026-06-09T14:22:20Z
**Root cause identified:** 2026-06-09T14:47:33Z
**MTTR:** 25 minutes

## Hypothesis Tree

Before inspecting code, I mapped the failure domains from the alert and logs:

1. **Database (LOW probability)** - Alert shows p50 latency only 432ms. DB pressure typically elevates p50 first. Ruled out.
2. **Payment processor (LOW probability)** - External. No processor errors in logs. Success rate 99.8% is normal. Ruled out.
3. **Checkout service memory/CPU (LOW probability)** - Logs show fast payment intent creation (~2ms). Service itself is healthy. Ruled out.
4. **Fraud-check service failure (MEDIUM probability)** - Logs show 94% fraud_check_timeout_rate. But fraud-check itself is completing jobs (~800ms inference). Something upstream is abandoning it prematurely.
5. **Gateway-to-fraud-check timeout mismatch (HIGH probability)** - Gateway logs show 800ms timeout with 3 retries per request. Fraud-check logs show jobs completing at ~800ms but finding the client already disconnected. Duplicate job rate 61%.

## Root Cause

A timeout mismatch between the gateway and fraud-check service causes a retry amplification storm:

- `services/gateway/config.py`: `FRAUD_CHECK_TIMEOUT_MS = 800`
- `services/fraud-check/config.py`: `PROCESSING_TIMEOUT_MS = 3000`

The fraud-check ML inference under production load consistently takes 800-2800ms (p95=2650ms per system logs). The gateway's 800ms timeout fires before fraud-check can respond. The gateway retries up to 3 times (`FRAUD_CHECK_RETRIES = 3`), spawning 3 duplicate inference jobs per checkout request.

**Effect:** Each checkout occupies fraud-check workers for up to 3 x 800ms = 2400ms while the gateway waits (2411ms p99 observed). Fraud-check worker pool saturates (24/24 busy, queue depth=18), making latency self-reinforcing under load. High-value transactions using the extended model ($2150 example in logs) fare worst.

**Why it surfaced after v2.4.1:** The deploy upgraded the fraud-check client library and increased connection pool from 10 to 20. The larger pool allowed more concurrent checkout requests to reach fraud-check simultaneously, pushing worker utilization from a tolerable level to saturation.

## Fix Applied

Raised `FRAUD_CHECK_TIMEOUT_MS` in `services/gateway/config.py` from `800` to `4500` (matching `PROCESSING_TIMEOUT_MS=3000` with a 1500ms buffer for queue wait and network). This eliminates spurious retries, allowing fraud-check to respond on the first attempt.

See `fix.diff` for the one-line change.
