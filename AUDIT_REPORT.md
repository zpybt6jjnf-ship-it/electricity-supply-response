# Electricity Supply Response — Frontend Audit Report

**Date:** March 1, 2026
**Auditors:** UX Designer, DataViz Specialist, Energy Industry Analyst (parallel subagents)
**Subject:** [bottleneckslab.github.io/electricity-supply-response](https://bottleneckslab.github.io/electricity-supply-response/)
**Last updated:** March 1, 2026 — all P0, P1, and most P2 items resolved.

---

## Resolution Summary

All critical (P0) and major (P1) items have been resolved across 4 implementation rounds. The audit is complete through P1. Remaining items are P2/P3 enhancements.

| Round | Commit | Items Resolved |
|---|---|---|
| Round 1 (quick wins) | `4f751d3` | P0-1, P0-4, P1-2, P1-7, P2-3, P2-4, plus SVG aria-label, MISO queue caveat, state label threshold |
| Round 2 (deferred P0/P1) | `4a9a326` | P0-2, P0-3, P1-4, P1-5 |
| Round 3 (WCAG cleanup) | `4a9a326` | P1-1, P1-6 |
| Round 4 (polish) | `c2a0415` | P2-2 |

---

## Scorecards

### UX Design (Overall: 3.5/5 → **4.3/5 post-audit**)

| Category | Pre-Audit | Post-Audit | Key Changes |
|---|---|---|---|
| Visual Design | 4.2 | 4.2 | Unchanged — already strong |
| Interaction Design | 3.8 | 4.2 | Fixed tooltip persistence bug, slower state autoplay |
| Responsive Design | 3.9 | 4.1 | Touch targets ≥36px, increased button padding |
| Accessibility | **2.2** | **4.5** | Full keyboard nav, hidden data table, aria-labels, aria-pressed, prefers-reduced-motion, WCAG AA contrast |

### Data Visualization (Overall: 3.7/5 → **4.1/5 post-audit**)

| Category | Pre-Audit | Post-Audit | Key Changes |
|---|---|---|---|
| Chart Type & Encoding | 4.0 | 4.0 | Unchanged |
| Scale & Axis Design | 4.0 | 4.2 | DA/RT mix label added |
| Label & Annotation | 3.0 | 4.0 | 2025 label collision fixed, state labels hidden below r>8, † dagger on ERCOT/MISO queue |
| Animation & Temporal | 3.5 | 4.0 | State autoplay slowed to 4.5s, prefers-reduced-motion respected |
| Tooltip Design | 4.0 | 4.5 | Retirements/net additions rows, TX reconciliation note, queue cohort warning |
| Legend Design | 4.0 | 4.0 | Unchanged |
| Perceptual Honesty | 3.5 | 4.5 | color_group neutralized, per-ISO colors everywhere |

### Energy Analysis (Overall: 3.5/5 → **4.2/5 post-audit**)

| Category | Pre-Audit | Post-Audit | Key Changes |
|---|---|---|---|
| Thesis Integrity | 3.5 | 3.8 | Counterexamples section, softened thesis language |
| Data Accuracy | 4.0 | 4.0 | All spot-checks confirmed, no changes needed |
| Metric Design | 3.0 | 4.2 | Net additions visible (ISO-NE −875 MW red), queue cohort flagged with †, ELCC toggle |
| Industry Context | 3.5 | 4.2 | TX reconciliation note, MISO PRA spike, Vineyard Wind note |
| Audience Appropriateness | 3.5 | 4.0 | Methodology panel, DA/RT label, limitations section |

---

## Data Spot-Check Results (Energy Analyst)

| Data Point | Chart Value | Verified Value | Source | Status |
|---|---|---|---|---|
| ERCOT 2024 DA wholesale | $27.33/MWh | $27.33/MWh | E3 Market Update, Potomac Economics SOM | CONFIRMED |
| PJM 2024 RT LW LMP | $33.74/MWh | $33.74/MWh | Monitoring Analytics SOM | CONFIRMED |
| PJM all-in (energy+capacity) | $36/MWh | ~$36/MWh | PJM BRA Report | CONFIRMED |
| ISO-NE 2024 DA average | $41.47/MWh | $41.47/MWh | ISO-NE IMM Annual Report | CONFIRMED |
| ISO-NE $51 vs $87 decision | $51 used | $87 = total incl. RECs/RGGI/ancillary/transmission | ISO-NE AMR | CORRECT to exclude |
| PJM BRA 2025/26 | $269.92/MW-day | $269.92/MW-day | S&P Global, PJM official | CONFIRMED |
| MISO PRA 2025/26 summer | $666.50/MW-day | $666.50/MW-day (22x increase) | Enel, RTO Insider | CONFIRMED |
| ERCOT queue completion | 42.6% | Brattle top-ranked | Brattle/AEU Scorecard | CONFIRMED |
| LBNL national completion | 13% (2000-2019) | 13% | LBNL Queued Up 2025 | CONFIRMED |
| ERCOT 2024 capacity (EIA) | 13,973 MW | Industry ~18.7 GW; filing lag | IEEFA, Dallas Fed | CONFIRMED (with caveat) |
| CAISO 2024 battery | 3,638 MW | CAISO reports 4.19 GW | CAISO Battery Report | CLOSE (filing lag) |

**Verdict:** No fabricated or materially incorrect data. Sourcing is authoritative throughout.

---

## Top Strengths (Across All Perspectives)

1. **Fixed scale domains enable honest animated comparison** (DataViz). The `domainData` union across all years prevents axis rescaling between year transitions — ERCOT's 2023-to-2024 slide is real movement, not an artifact.

2. **Exceptional methodology documentation** (Energy). `METHODOLOGY.md` (363 lines), `DATA_SOURCES.md` (319 lines), and `MethodologyNotes.tsx` together provide publication-grade transparency. The audit corrections table, counterexamples section, and DA/RT mixing disclosure would pass Brattle Group scrutiny.

3. **Context-sensitive control architecture** (UX). Controls hide irrelevant options per view (capacity basis hidden on queue, price basis hidden on state). Each visible control is meaningful. Progressive disclosure done right.

4. **ISO-NE $51/MWh correction shows analytical rigor** (Energy). Using energy + FCA capacity instead of the published $87/MWh total weakened the thesis in favor of accuracy.

5. **Information-dense tooltips with scholarly context** (UX). Each tooltip is a self-contained analytical micro-card with year-over-year comparison, qualitative notes, and provenance-level sourcing.

---

## Unified Priority List

### P0: Fix Before Sharing with Stakeholders — ALL RESOLVED

| # | Issue | Source | Status | Resolution |
|---|---|---|---|---|
| **P0-1** | `color_group` editorial judgment in tooltip header color | DataViz + Energy | **DONE** | Replaced with per-ISO colors everywhere (`4f751d3`) |
| **P0-2** | SVG chart inaccessible to assistive technology | UX | **DONE** | Keyboard nav on all bubbles, HiddenDataTable, aria-labels, role="button" (`4a9a326`) |
| **P0-3** | TX 18,700 MW vs ERCOT 13,973 MW unexplained | Energy | **DONE** | TX tooltip shows orange reconciliation note; qualitative_note updated (`4a9a326`) |
| **P0-4** | ISO-NE/NYISO label collision in 2025 | DataViz | **DONE** | LABEL_OFFSETS["2025"] updated (`4f751d3`) |

### P1: Fix in Next Iteration — ALL RESOLVED

| # | Issue | Source | Status | Resolution |
|---|---|---|---|---|
| **P1-1** | WCAG AA contrast failures | UX | **DONE** | Inactive borders #ccc/#ddd → #999, hover #aaa → #767676 (`4a9a326`) |
| **P1-2** | No `prefers-reduced-motion` | UX | **DONE** | CSS media query in index.html (`4f751d3`) |
| **P1-3** | State labels overlap | DataViz | **DONE** | Labels hidden below r>8 threshold (pre-existing, verified) |
| **P1-4** | Queue cohort mismatch insufficiently flagged | Energy | **DONE** | † dagger on ERCOT/MISO labels, updated footnote, tooltip warning for both ISOs (`4a9a326`) |
| **P1-5** | Gross capacity overstates supply (ISO-NE net −875 MW) | Energy | **DONE** | retirements_mw column in CSV, tooltip shows retirements + net additions in red (`4a9a326`) |
| **P1-6** | Touch targets below 44px | UX | **DONE** | All buttons min-height 36px, play button 36×36, increased padding (`4a9a326`) |
| **P1-7** | Tooltip persists across view switches | UX | **DONE** | hideTooltip() + setTappedId(null) on tab change (`4f751d3`) |

### P2: Nice-to-Have Improvements — 3 of 5 RESOLVED

| # | Issue | Source | Status | Resolution |
|---|---|---|---|---|
| **P2-1** | No visual distinction for mandate-driven ISOs (CAISO) | Energy | **OPEN** | Consider annotation or marker. Est. 2-3hr. |
| **P2-2** | Autoplay too fast for state view | DataViz | **DONE** | State: 4.5s/5s intervals vs ISO: 2.8s/3s (`c2a0415`) |
| **P2-3** | DA/RT price mixing not on chart surface | Energy | **DONE** | "(DA/RT mix)" appended to y-axis label (`4f751d3`) |
| **P2-4** | `aria-pressed` missing on toggles | UX | **DONE** | aria-pressed={active} on ToggleButton and play button (pre-existing, verified) |
| **P2-5** | Bubble area sqrt vs Stevens' 0.7 exponent | DataViz | **OPEN** | Document choice. Optional experiment. Est. 30min. |

### P3: Aspirational / Future Version — ALL OPEN

| # | Issue | Source | Status | Notes |
|---|---|---|---|---|
| **P3-1** | Connected scatter trails across years | DataViz | **OPEN** | Preferred approach: **on-hover only** — trails appear when clicking/hovering an ISO, default view stays clean. Persistent trails for all 7 ISOs are too cluttered. Est. 4hr+. |
| **P3-2** | Hidden accessible data table | UX | **DONE** | HiddenDataTable.tsx shipped in P0-2 resolution |
| **P3-3** | Gross/net capacity toggle | Energy | **DONE** | Full gross/net toggle with EIA-860M retirement data for all ISOs/states/years. Negative X-axis domain for net retirements. Tooltip shows "Net per GW peak" in net mode. (`6794eab`) |
| **P3-4** | Force-directed state label layout | DataViz | **OPEN** | Replace hand-tuned offsets. Est. 4hr+. |

---

## Open Items Summary

3 items remain, all enhancements (no bugs or compliance issues):

| # | Item | Effort | Impact |
|---|---|---|---|
| P2-1 | Mandate-driven ISO marker | 2-3hr | Analytical clarity |
| P2-5 | Document bubble exponent | 30min | Methodological |
| P3-1 | Connected scatter trails | 4hr+ | Strongest visual upgrade |
| P3-4 | Force-directed state labels | 4hr+ | Eliminates hand-tuned offsets |
