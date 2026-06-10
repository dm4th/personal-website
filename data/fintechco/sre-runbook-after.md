# Checkout Latency Runbook

## Symptoms

- P99 checkout latency > 500ms SLO
- Error rate spike on `/checkout` path
- High fraud_check_timeout_rate in gateway metrics (check Grafana: payments/fraud-check-timeout-rate)

## Investigation Steps

1. Check gateway error logs for fraud-check timeout warnings (`WARN.*fraud-check call timed out`)
2. Check fraud-check worker utilization - if > 80%, look for retry amplification
3. Check duplicate job rate in fraud-check logs (`Duplicate job rate` warning line)
4. Compare `FRAUD_CHECK_TIMEOUT_MS` in `services/gateway/config.py` against `PROCESSING_TIMEOUT_MS` in `services/fraud-check/config.py` - gateway timeout must be >= fraud-check processing time + 1500ms buffer
5. Check gateway error logs for 5xx rates
6. Check downstream service health endpoints
7. Check database connection pool utilization
8. Check payment processor latency (external dependency)

## Timeout Mismatch Diagnosis (new)

**Cause pattern:** Gateway timeout fires before fraud-check finishes, triggering retries that saturate the fraud-check worker pool, which raises latency further.

**How to confirm:**
- Gateway logs: `fraud-check call timed out after Xms, attempt=N/3`
- Fraud-check logs: `Response write failed: client already disconnected`
- Fraud-check metrics: worker utilization near 100%, `Duplicate job rate` > 30%

**Fix:** Raise `FRAUD_CHECK_TIMEOUT_MS` in `services/gateway/config.py` to at least `PROCESSING_TIMEOUT_MS + 1500` (queue wait buffer). Current values: `PROCESSING_TIMEOUT_MS=3000` -> set gateway to `4500`.

**Alert threshold suggestion:** Add a metric alert on `fraud_check_duplicate_job_rate > 0.20` to catch this earlier, before worker saturation.

## Common Causes

- **Timeout mismatch (gateway vs fraud-check)** - see Timeout Mismatch Diagnosis above
- Database slow queries (check pg_stat_activity)
- Payment processor timeouts (check processor dashboard)
- Memory pressure on checkout pods (check container metrics)
- Network partition between gateway and checkout service

## Escalation

- P1/P2: page payments-sre team lead
- Payment processor issues: open ticket with vendor support

## Recovery

- Rollback: `kubectl rollout undo deployment/gateway`
- Scale out: `kubectl scale deployment/checkout --replicas=10`
- If fraud-check is saturated: `kubectl scale deployment/fraud-check --replicas=6` to drain the queue while fixing the timeout
