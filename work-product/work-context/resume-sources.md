# Resume Source Evidence Document

*Generated: 2026-03-28 | All claims in the resume and portfolio are backed by the sources below.*

---

## Source Inventory

### 1. Git Repository History

| What | Source | Key Data Points |
|------|--------|----------------|
| Commit count | `git log --since=2025-09-01 --until=2026-03-29` | **943 commits** over 7 months |
| Commit cadence | Monthly breakdown | Oct: 22, Nov: 270, Dec: 251, Jan: 189, Feb: 120, Mar: 91 |
| PR count | `gh pr list --state all --limit 500` | **500+ PRs** (459 merged, 451 by Danny) |
| PR date range | GitHub API | Nov 3, 2025 - Mar 27, 2026 |
| Files changed | `git diff --stat` from first commit | 300+ files created/modified |

**File paths:**
- Git history: `git log` on `/Users/danny.mathieson/Sales/sales-eng/`
- PR data: GitHub API via `gh` CLI

---

### 2. Notion SE Deal Tracker

| What | Source | Key Data Points |
|------|--------|----------------|
| Total deals | Notion DB `2bef43a7-8fa4-806e-9713-f6bd6ba86ef3` | **99 deals** |
| Danny's deals | Filtered by SE Owner = Danny | **61 deals (62% of pipeline)** |
| Pipeline value | Sum of Deal Size property | **$31.8M** (Danny), **$33.9M** (total) |
| Closed-Won value | Filtered by stage | **$1.95M** across 5 deals |
| Win probability | Average across pipeline | **46.7%** |
| Deal stages | Status property breakdown | 33 Walkthrough Pending, 13 Scoping, 10 Commercial Pricing, 7 Contract Review, 5 Won, 6 Lost |
| Products | Multi-select breakdown | SmarterEligibility (32), SmarterAuth (27), SmarterReceivables (21), ConverseAI (17), SmarterAgents (14) |
| Priority | Select breakdown | 54 High, 27 Medium, 18 Low |
| Deal types | Select breakdown | 45 New Prospect, 22 Cost-Takeout, 12 Expansion, 7 RFP, 5 Design Partner |

**File path:** `/Users/danny.mathieson/Sales/sales-eng/resume/notion-data.md`
**API:** Notion REST API v2022-06-28, database query with pagination

---

### 3. Notion Demo Meetings Recordings

| What | Source | Key Data Points |
|------|--------|----------------|
| Total meetings | Notion DB `299f43a7-8fa4-80d3-a13f-eb609f391f6a` | **199 recorded meetings** |
| Danny's meetings | Filtered by Rep | **59 meetings as primary rep** |
| Date range | Date property | **Aug 16, 2024 - Mar 27, 2026 (19 months)** |
| Engagement score | Average of scored meetings | **81.1/100** (85 meetings scored) |
| Pitch quality | Average of scored meetings | **77.9/100** (76 meetings scored) |
| Call types | Select breakdown | 37 Demo, 21 Technical, 20 Discovery, 16 Process Walkthrough, 5 Pricing |
| Products discussed | Multi-select | SmarterAuth (106), SmarterAR (77), Voice/ConverseAI (49) |
| EHR platforms | Multi-select | Epic (9), NextGen (8), Meditech (5), Athena (3), Raintree (3) |

**File path:** `/Users/danny.mathieson/Sales/sales-eng/resume/notion-data.md`

---

### 4. Notion Accounts Database

| What | Source | Key Data Points |
|------|--------|----------------|
| Total accounts | Notion DB `232f43a7-8fa4-8069-9ead-c42f29ac96f6` | **145 accounts** |
| Stage breakdown | Status property | 66 Pre-Sale, 27 Support (live), 15 Delivery, 8 Post-Sale, 3 Contracting |
| Care settings | Select property | Medical (13), Behavioral (10), Dental (5), Vision (3), Emergency (3) |
| Specialties | Select property | Vision (8), Dental (5), ABA (4), PT (4), Behavioral Health (3) |

**File path:** `/Users/danny.mathieson/Sales/sales-eng/resume/notion-data.md`

---

### 5. Fireflies Meeting Transcripts

| What | Source | Key Data Points |
|------|--------|----------------|
| Total meetings | Fireflies GraphQL API | **483 meetings** (Danny), **5,050** (org-wide) |
| Duration | Sum of meeting durations | **271 hours** (Danny), **2,553 hours** (org) |
| Date range | Transcript dates | **Nov 19, 2025 - Mar 27, 2026 (~4.5 months)** |
| External meetings | Title heuristic classification | **138 prospect-facing** across **48+ accounts** |
| Internal meetings | Title heuristic | **228 syncs/standups/weeklies** |
| Meeting cadence | Monthly trend | 31/mo (Nov) -> 134/mo (Mar) = **34 meetings/week** |
| Org share | Danny / total | **~10% of all org meetings** |

**File path:** `/Users/danny.mathieson/Sales/sales-eng/resume/fireflies-data.md`
**API:** `https://api.fireflies.ai/graphql` with Bearer token

---

### 6. Skills Directory

| What | Source | Key Data Points |
|------|--------|----------------|
| Total skills | `.claude/skills/` directory listing | **23 specialized skills** |
| Python scripts | `.claude/skills/**/scripts/*.py` | **57 Python files** |
| Agent definitions | `.claude/agents/` | **5 parallel AI agents** |
| GitHub Actions | `.github/workflows/` | **3 CI/CD workflows** |
| Session hooks | `.claude/hooks/` | **2 hooks** (session-start, session-end) |
| Product profiles | `product-context/` | **11 product context files** |
| Demo manifests | `workflow-demos/` submodule | **20+ demo workflows** |

**File paths:**
- Skills: `/Users/danny.mathieson/Sales/sales-eng/.claude/skills/`
- Agents: `/Users/danny.mathieson/Sales/sales-eng/.claude/agents/`
- Workflows: `/Users/danny.mathieson/Sales/sales-eng/.github/workflows/`
- Product context: `/Users/danny.mathieson/Sales/sales-eng/product-context/`

---

### 7. Prospect Repository

| What | Source | Key Data Points |
|------|--------|----------------|
| Total prospects | `prospects/` directory | **76 prospect directories** |
| README files | `prospects/*/README.md` | **75 deal summaries** |
| Meeting notes dirs | `prospects/*/meeting-notes/` | **73 with meeting documentation** |
| Action items | `prospects/*/action-items.md` | **74 tracking files** |
| Pricing data | `prospects/*/pricing-data.md` | **30+ pricing models** |
| Delivery charters | `prospects/*/delivery-charter*` | **7+ closed-deal charters** |

**File path:** `/Users/danny.mathieson/Sales/sales-eng/prospects/`

**Notable prospect files (largest/most complex):**
- NextGen Partnership: 37 meetings, delivery charter, CO16 guide
- Jefferson Health: $30-40M deal documentation
- Athletico: 920 clinics, $8M deal, finalist stage
- Personify Health: $1.9M closed-won, 18 meetings
- Charlie Health: Comprehensive pricing model evolution

---

### 8. GitHub PRs & Collaboration

| What | Source | Key Data Points |
|------|--------|----------------|
| Total PRs | `gh pr list --state all` | **500+** (API limit) |
| Merged PRs | Filtered by state | **459 merged** |
| Danny's PRs | Filtered by author=dm4th | **451 PRs** (90% of all PRs) |
| Simon's PRs | Filtered by author | **11 PRs** |
| Automated PRs | Renovate + Dependabot | **38 PRs** |

**Source:** GitHub API via `gh` CLI

---

### 9. CLAUDE.md Project Configuration

| What | Source | Key Data Points |
|------|--------|----------------|
| Architecture docs | Root `CLAUDE.md` | System architecture, team context, deal tracker schema |
| Team structure | CLAUDE.md "Team Context" | Danny (Director SE), Simon (Team Lead), sales leadership |
| Deal stage crosswalk | CLAUDE.md table | 10-stage mapping from SE to FY26 Sales stages |

**File path:** `/Users/danny.mathieson/Sales/sales-eng/CLAUDE.md`

---

### 10. Memory Files

| What | Source | Key Data Points |
|------|--------|----------------|
| ICP calibration | `project_icp_calibration_decision.md` | Kevin's pipeline analysis, ecosystem tiers, scoring patterns |
| API patterns | Memory files | Google OAuth2, Notion API, Fireflies integration patterns |
| Candidate grading | `feedback_candidate_grading_calibration.md` | Calibration from March 2026 cohort |
| Worktree management | `feedback_worktree_cleanup.md` | Ephemeral workspace patterns |

**File path:** `/Users/danny.mathieson/.claude/projects/-Users-danny-mathieson-Sales-sales-eng/memory/`

---

## Data Quality Notes

1. **Git commits**: Count is exact from `git log` — 943 commits from Sep 1, 2025 to Mar 28, 2026
2. **Notion data**: Live API query on 2026-03-28. Pipeline value includes only deals with Deal Size set (53 of 99)
3. **Fireflies data**: Only covers Nov 19, 2025 onward (org activation date). Pre-Fireflies meetings are tracked in Notion and Git but without transcription metrics
4. **PR count**: GitHub API returned 500 (query limit). Actual total may be higher
5. **Meeting analysis count**: 162+ meeting-analysis.md files in Git; 199 entries in Notion Demo Meetings DB. Difference is due to some meetings tracked in Notion but not yet analyzed in depth
6. **Pipeline value**: $31.8M represents deals where Danny is SE Owner AND Deal Size is populated. Actual pipeline exposure is likely higher given 35 unsized deals
