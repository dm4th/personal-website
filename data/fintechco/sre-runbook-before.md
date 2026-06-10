# Checkout Latency Runbook

## Symptoms

- P99 checkout latency > 500ms SLO
- Error rate spike on `/checkout` path

## Investigation Steps

1. Check gateway error logs for 5xx rates
2. Check downstream service health endpoints
3. Check database connection pool utilization
4. Check payment processor latency (external dependency)

## Common Causes

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
