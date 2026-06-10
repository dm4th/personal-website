# MTTR Narrative: SRE Triage Demo

## Timeline

| Time | Event |
|---|---|
| T+0m | Alert fires: P99 checkout latency 2411ms (SLO: 500ms) |
| T+3m | On-call engineer opens alert, begins triage |
| T+8m | Engineer reviews logs manually, sees fraud-check timeouts but unclear root cause |
| T+12m | Engineer escalates to second responder; begins checking database, payment processor |
| T+25m | Root cause identified: timeout mismatch in gateway config |
| T+28m | Fix deployed; latency returns to baseline |

**Traditional MTTR: 28 minutes**

## With Claude Code

| Time | Event |
|---|---|
| T+0m | Alert fires |
| T+2m | Engineer pastes alert + logs to Claude Code |
| T+5m | Claude builds hypothesis tree, identifies mismatch pattern, shows exact config lines |
| T+7m | Engineer reviews one-line fix, approves, Claude applies it |
| T+9m | Fix deployed; latency returns to baseline |

**MTTR with Claude Code: 9 minutes (68% reduction)**

## What Changed

Claude Code accelerated two phases:
1. **Hypothesis generation:** Rather than checking database, payment processor, and other false leads in series, Claude eliminated them immediately by cross-referencing log p50 latency (still normal) against the error rate pattern. It narrowed to the fraud-check timeout mismatch in one pass.
2. **Config correlation:** Claude read `services/gateway/config.py` and `services/fraud-check/config.py` simultaneously and surfaced the mismatch as a specific number comparison - something that would have taken a human 10+ minutes of file spelunking under incident pressure.

## Freed Time

19 minutes per P1 incident of this type. The SRE team handles approximately 4-6 checkout latency incidents per quarter. Recovered time: 76-114 minutes/quarter on this one pattern alone.

More importantly: two false-lead investigations (database, payment processor) were skipped. Each false lead in production is cognitive load and potential for a mistaken change under pressure. Eliminating them reduces incident risk, not just MTTR.
