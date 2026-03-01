# Data Audit & Citation Document

## Purpose

This document provides a field-by-field audit trail for every data point in `data/verified/iso_scatter_data.json`. Each value is paired with its primary source citation, methodology annotation, and a verification checkbox. The goal: any reviewer can independently verify every number in the dataset without re-reading the methodology doc or hunting through source reports.

**Scope:** 7 ISOs, ~15 fields each, calendar years 2023–2025. 2025 data for all 7 ISOs are estimates (no annual SOM reports published yet).
**Data vintage:** Compiled 2026-02-28, primary data year 2024. Multi-year update adds 2023 and PJM 2025 est.
**Author:** Bottlenecks Lab

## How to Use This Document

1. Find the ISO section for the value you want to verify
2. Locate the field row in the table
3. Follow the source citation to the primary document
4. Check the methodology column for any transformations, estimates, or caveats
5. Mark the verification column with the appropriate status

## Verification Key

| Marker | Meaning |
|--------|---------|
| `[ ]`  | Not yet verified against primary source |
| `[✓]`  | Verified — value matches primary source exactly |
| `[~]`  | Approximately confirmed (tolerance noted in cell) |
| `[!]`  | Discrepancy found (details noted in cell) |

---

## 1. ERCOT — Electric Reliability Council of Texas

| Field | Value | Source | Methodology | Verification |
|-------|-------|--------|-------------|--------------|
| `wholesale_price_mwh` | $27.33 | E3 2024 ERCOT Market Update [1] | ERCOT North Hub day-ahead average, 2024 annual. Down ~50% from 2023 ($55.50) due to massive solar/battery additions suppressing peak prices. | `[✓]` E3 snapshot + Potomac Economics 2024 SOM both confirm $27.33 exactly. |
| `all_in_price_mwh` | $27.33 | Same as wholesale [1] | Energy-only market — no capacity payments. All-in = wholesale. | `[✓]` Structural fact — ERCOT has no capacity market. |
| Capacity adder | $0.00 | N/A | ERCOT has no capacity market or capacity auction mechanism. | `[✓]` |
| `capacity_additions_mw` | 13,973 MW | EIA-860M Jan 2026 vintage [5] | Gross nameplate MW reaching COD in 2024. Breakdown: solar 7,277 / battery 4,264 / wind 1,735 / gas 697 MW. Not net of retirements. **Filing-lag note:** Industry sources (E3, IEEFA, Dallas Fed, Amperon) report ~18.7 GW; EIA-860M is ~25% lower, likely due to filing lag. | `[✓]` EIA-860M verified. Industry cross-reference: ~18.7 GW from multiple sources. |
| `capacity_additions_elcc_mw` | 6,773 MW | Derived from EIA-860M nameplate using ELCC factors | Approximate ELCC factors: solar ~30%, battery ~85%, gas 95%, wind ~17.5%. See cross-cutting note [A]. | `[~]` Derived from EIA-860M technology mix; depends on ELCC factors. |
| `project_count` | 180 | EIA-860M unit-level filings [5] | Distinct generators reaching COD in 2024. | `[ ]` Requires EIA-860M filing access. |
| `peak_demand_gw` | 85.2 GW | ERCOT settled value [6] | Aug 20, 2024. Revised down from preliminary 85.6 GW. Below 2023 record of 85.5 GW — not an all-time record. | `[✓]` ERCOT records show 85,199–85,245 MW settled (rounds to 85.2 GW). Preliminary 85,559 MW (85.6 GW) confirmed. 2023 record 85,508 MW confirmed. |
| `queue_completion_pct` | 42.6% | Brattle/Grid Strategies/AEU Scorecard [7] | **2018–2020 entry cohort** — narrower than other ISOs' 2000–2019 cohort. See cross-cutting note [B]. Structural advantages: isolated grid, no FERC jurisdiction, single-state, energy-only market reduces speculative entries. | `[✓]` Brattle/Grid Strategies Scorecard (March 2024) confirms 42.6% exactly. |
| `queue_cohort` | 2018–2020 | Brattle/AEU Scorecard [7] | Narrower cohort than other ISOs. See comparability note [B]. | `[✓]` Confirmed per Scorecard methodology. |
| `price_2023_mwh` | $55.50 | E3 [1] | Prior-year reference. 2024 price is the *result* of supply response triggered by 2021–2023 price signals. | `[✓]` E3 + Potomac Economics confirm $55.50 for North Hub DA 2023. Note: EIA reports ~$36/MWh for real-time system-wide average (different metric). |
| `color_group` | functional | Bottlenecks Lab classification | Rationale: highest queue throughput (42.6%), highest supply response intensity (219.5 MW/GW nameplate), active market-driven building. | `[✓]` Internal classification; underlying metrics verified. |
| Derived: MW/GW (nameplate) | 164.0 | Calculated: 13,973 / 85.2 | Updated to EIA-860M capacity. Previous: 219.5 (from 18,700 / 85.2). | `[✓]` |
| Derived: MW/GW (ELCC) | 79.5 | Calculated: 6,773 / 85.2 | Updated to EIA-860M capacity. Previous: 115.0 (from 9,800 / 85.2). | `[✓]` |

---

## 2. SPP — Southwest Power Pool

| Field | Value | Source | Methodology | Verification |
|-------|-------|--------|-------------|--------------|
| `wholesale_price_mwh` | $27.56 | SPP 2024 Annual State of the Market Report [8] | Day-ahead system average, 2024 annual. | `[✓]` SPP 2024 Annual SOM confirms $27.56/MWh DA exactly (down 3% from $28.45 in 2023). |
| `all_in_price_mwh` | $29.00 | SPP SOM [8]; capacity estimate | Wholesale ($27.56) + capacity adder (~$1.44). | `[~]` Wholesale confirmed; capacity adder unverified from primary source. |
| Capacity adder | ~$1.44 | SPP capacity market data | Minimal capacity market. Adder is approximate $/MWh equivalent. | `[ ]` No primary source found for this specific figure. |
| `capacity_additions_mw` | 1,142 MW | EIA-860M Jan 2026 vintage [5] | Gross nameplate MW reaching COD in 2024. Breakdown: wind 902 / solar 225 MW. **Filing-lag note:** Industry sources (SPP ELCC Report, Amperon) report ~2.5 GW; EIA-860M is ~54% lower, likely due to filing lag for wind projects. | `[✓]` EIA-860M verified. Industry cross-reference: ~2.5 GW. |
| `capacity_additions_elcc_mw` | 271 MW | Derived from EIA-860M nameplate using ELCC factors | SPP-specific ELCC factors: wind ~22.5%, solar ~30%. | `[~]` Derived from EIA-860M technology mix. |
| `project_count` | 30 | EIA-860M [5] | Distinct generators reaching COD in 2024. | `[ ]` Requires EIA-860M filing access. |
| `peak_demand_gw` | 54.0 GW | SPP 2024 State of the Market [8] | Summer 2024, estimated ~3% below 2023. Exact date not specified. | `[~]` SPP SOM confirms "down 3% from 2023." 2023 record was 56,184 MW; 3% below = ~54,498 MW (~54.5 GW). **54.0 GW may be ~500 MW low.** |
| `queue_completion_pct` | 15% | LBNL Queued Up 2025 [10] | 2000–2019 entry cohort (LBNL aggregate). Brattle Scorecard reports <10% for narrower 2018–2020 cohort. | `[~]` LBNL report exists; ISO-specific 15% figure plausible but requires full LBNL data workbook for precise SPP-specific confirmation. |
| `queue_cohort` | 2000–2019 | LBNL Queued Up [10]; Brattle [7] | Broader cohort than ERCOT. | `[✓]` Cohort definition confirmed from both sources. |
| `color_group` | intermediate | Bottlenecks Lab classification | Reclassified from "functional." Rationale: 15% queue completion and 46.3 MW/GW supply response are closer to PJM than to ERCOT. Low prices reflect abundant wind resource and cheap fuel, not queue efficiency. | `[✓]` Internal classification; rationale is sound given verified inputs. |
| Derived: MW/GW (nameplate) | 21.1 | Calculated: 1,142 / 54.0 | Updated to EIA-860M capacity. Previous: 46.3 (from 2,500 / 54.0). | `[✓]` |
| Derived: MW/GW (ELCC) | 5.0 | Calculated: 271 / 54.0 | Updated to EIA-860M capacity. Previous: 31.0 (from 1,675 / 54.0). | `[✓]` |

---

## 3. MISO — Midcontinent ISO

| Field | Value | Source | Methodology | Verification |
|-------|-------|--------|-------------|--------------|
| `wholesale_price_mwh` | $31.00 | Potomac Economics 2024 MISO State of the Market [11] | **Real-time** load-weighted average LMP, 2024 annual. DA prices would be ~$1–3/MWh higher. See note [D]. | `[✓]` Potomac Economics 2024 MISO SOM confirms RT average of $31/MWh (14% reduction from prior year). |
| `all_in_price_mwh` | $33.00 | Potomac Economics [11]; MISO PRA results [12] | Wholesale ($31.00) + capacity adder (~$2.00). | `[~]` Wholesale confirmed; capacity adder unverified from primary source. |
| Capacity adder | ~$2.00 | MISO Planning Resource Auction (PRA) results [12] | Approximate $/MWh equivalent from PRA clearing prices. | `[ ]` Requires MISO PRA clearing price data for conversion. |
| `capacity_additions_mw` | 7,156 MW | EIA-860M Jan 2026 vintage [5] | Gross nameplate MW reaching COD in 2024. Breakdown: solar 6,273 / wind 625 / gas 186 / battery 54 MW. Not net of retirements (~1.8 GW coal retired: South Oak Creek, Rush Island). | `[✓]` EIA-860M verified. Cross-reference: Amperon confirms ~7.5 GW (within 5%). |
| `capacity_additions_elcc_mw` | 3,501 MW | Derived from EIA-860M nameplate using ELCC factors | MISO-specific: summer solar capacity credit of ~50% (MISO PRA rules). | `[~]` MISO Capacity Credit Report PY 2024-2025 confirms 50% default summer solar credit. Derived ELCC total is internally consistent. |
| `project_count` | 90 | EIA-860M [5] | Distinct generators reaching COD in 2024. | `[ ]` Requires EIA-860M filing access. |
| `peak_demand_gw` | 121.6 GW | Amperon [4] | Aug 26, 2024. | `[✓]` Amperon confirms 121.6 GW on Aug 26, 2024. Corroborated by Count on Coal (~122 GW). |
| `queue_completion_pct` | 28% | Brattle/Grid Strategies/AEU Scorecard [7] | Brattle reports 28.3% for 2018–2020 entry cohort. Rounded to 28% in dataset. LBNL national 2000–2019 average is 13% of capacity — MISO-specific LBNL figure not publicly available. | `[✓]` Brattle 28.3% confirmed from Generator Interconnection Scorecard (March 2024). |
| `queue_cohort` | 2018–2020 | Brattle/AEU Scorecard [7] | Brattle 2018–2020 cohort. LBNL 2000–2019 MISO-specific rate not publicly available for cross-reference. | `[✓]` Cohort aligned with Brattle source. |
| `color_group` | functional | Bottlenecks Lab classification | Rationale: second-highest queue throughput (28%), large absolute additions (7.5 GW), active solar buildout. Queue reforms (MTEP cycles) improving throughput. | `[✓]` Internal classification; Brattle queue figure supports "functional" designation. |
| Derived: MW/GW (nameplate) | 58.8 | Calculated: 7,156 / 121.6 = 58.85 | Updated to EIA-860M capacity. Previous: 61.7 (from 7,500 / 121.6). | `[✓]` |
| Derived: MW/GW (ELCC) | 28.8 | Calculated: 3,501 / 121.6 = 28.79 | Updated to EIA-860M capacity. Previous: 27.1 (from 3,300 / 121.6). | `[✓]` |

---

## 4. CAISO — California ISO

| Field | Value | Source | Methodology | Verification |
|-------|-------|--------|-------------|--------------|
| `wholesale_price_mwh` | $38.00 | CAISO DMM Q3/Q4 2024 Quarterly Reports [13] | **Estimated** annual DA average from quarterly reports. Not a final annual figure. Duck curve dynamics suppress midday prices. **Caveat:** DMM 2024 Annual Report reports WEIM-wide average ~$40/MWh (down 35% from 2023). CAISO-internal DA average may differ from WEIM-wide, but $38 is likely ~$2/MWh low. Review against DMM annual report PDF tables recommended. | `[~]` Directionally correct; may be ~$2/MWh low vs DMM annual report. |
| `all_in_price_mwh` | $43.00 | CAISO DMM [13]; CPUC RA reports [14] | Wholesale ($38.00) + capacity adder (~$5.00). **Caveat:** Both components carry uncertainty — wholesale may be ~$40/MWh, and RA adder may be higher than $5/MWh depending on contract-vintage weighting vs. spot RA prices. All-in could range from $43 to $50+ depending on methodology. | `[~]` Internally consistent at stated values. True all-in likely higher. |
| Capacity adder | ~$5.00 | CPUC Resource Adequacy (RA) program cost estimates [14] | RA costs are bilateral and less transparent than auction-based capacity markets. $5/MWh is an estimate. **Caveat:** CPUC 2024 Market Price Benchmarks show avg system RA spot prices at ~$7,680/MW-month (~$10.52/MWh). The $5/MWh figure may reflect portfolio-weighted costs (mixing long-term contracts at lower prices with spot), not marginal spot RA clearing prices. Methodology should be documented. | `[~]` $5/MWh plausible for blended portfolio cost; spot RA prices are ~2x higher. |
| `capacity_additions_mw` | 6,535 MW | EIA-860M Jan 2026 vintage [5] | Gross nameplate MW reaching COD in 2024. Breakdown: battery 3,638 / solar 2,688 / wind 143 / gas 48 MW. | `[✓]` EIA-860M verified. Previous industry estimate was 7,500 MW (CAISO Battery Storage Report + Amperon). |
| `capacity_additions_elcc_mw` | 4,064 MW | Derived from EIA-860M nameplate using ELCC factors | CAISO-specific: battery 87.5% (4-hour duration), solar ~30% (high penetration saturation). | `[~]` Derived from EIA-860M technology mix. |
| `project_count` | 110 | EIA-860M [5] | Distinct generators reaching COD in 2024. | `[ ]` Requires EIA-860M filing access. |
| `peak_demand_gw` | 48.3 GW | Amperon [4] | Sept 5, 2024. | `[✓]` CAISO Key Statistics confirm 48,353 MW on Sept 5, 2024 (rounds to 48.3–48.4 GW). |
| `queue_completion_pct` | 10% | LBNL Queued Up [10]; Concentric Energy Advisors [16] | 2000–2019 entry cohort. Brattle Scorecard reports <10% for 2018–2020 cohort. Low completion reflects speculative queue entries. | `[✓]` Concentric Energy Advisors confirms "about 10 percent" for CAISO. LBNL national average is 13%; ISO-specific figure consistent. |
| `queue_cohort` | 2000–2019 | LBNL Queued Up [10] | Standard long-window cohort. | `[✓]` |
| `color_group` | intermediate | Bottlenecks Lab classification | Rationale: high building (7,500 MW, 155 MW/GW) despite low queue completion (10%). Additions are mandate-driven (SB 100) rather than market-driven. Policy overrides queue dysfunction as building driver. | `[~]` Internal classification; rationale sound, but underlying MW/GW ratio may change if capacity additions are revised upward. |
| Derived: MW/GW (nameplate) | 135.3 | Calculated: 6,535 / 48.3 = 135.30 | Updated to EIA-860M capacity. Previous: 155.3 (from 7,500 / 48.3). | `[✓]` |
| Derived: MW/GW (ELCC) | 84.1 | Calculated: 4,064 / 48.3 = 84.14 | Updated to EIA-860M capacity. Previous: 96.1 (from 4,640 / 48.3). | `[✓]` |

---

## 5. PJM — PJM Interconnection

| Field | Value | Source | Methodology | Verification |
|-------|-------|--------|-------------|--------------|
| `wholesale_price_mwh` | $33.74 | Monitoring Analytics 2024 PJM State of the Market [17] | **Real-time** load-weighted average LMP, 2024 annual. DA would be ~$1–3/MWh higher. See note [D]. | `[✓]` Monitoring Analytics 2024 SOM confirms $33.74/MWh RT LWA exactly (up $2.66 from $31.08 in 2023). |
| `all_in_price_mwh` | $36.00 | Monitoring Analytics [17]; PJM RPM BRA [18] | Wholesale ($33.74) + capacity adder (~$2.26). | `[!]` **Wholesale confirmed, but capacity adder likely understated.** Monitoring Analytics reports total wholesale cost of $55.54/MWh, with capacity at 6.6% = ~$3.67/MWh. The $2.26 adder produces $36.00, but actual capacity cost allocation is ~$3.67/MWh → all-in closer to ~$37.41. |
| Capacity adder | ~$2.26 | PJM RPM Base Residual Auction 2024/2025 [18] | BRA clearing price $28.92/MW-day ≈ $2/MWh. Note: 2025/2026 BRA jumped to $269.92/MW-day (~$18/MWh) — not reflected here since chart uses 2024 delivery year. | `[!]` **BRA $28.92/MW-day confirmed.** But flat-load $/MWh conversion is ~$1.21/MWh; actual capacity cost allocation per Monitoring Analytics is ~$3.67/MWh. The ~$2.26 figure is between these — methodology should be specified. **2025/2026 BRA $269.92/MW-day confirmed** (S&P Global, PJM official report). |
| `capacity_additions_mw` | 4,079 MW | EIA-860M Jan 2026 vintage [5] | Gross nameplate MW reaching COD in 2024. Breakdown: solar 3,817 / wind 189 / battery 54 MW. Not net of retirements (~205 MW: Warrior Run coal/cogen, June 2024). | `[✓]` EIA-860M verified. Cross-reference: PJM Inside Lines reports ~4,832 MW (within 15%). |
| `capacity_additions_elcc_mw` | 1,420 MW | Derived from EIA-860M nameplate using ELCC factors | Approximate: solar ~35%, wind ~20%, storage ~85%. Low ELCC ratio (35%) reflects solar-dominated mix. | `[~]` Derived from EIA-860M technology mix. |
| `project_count` | 75 | EIA-860M [5] | Distinct generators reaching COD in 2024. | `[ ]` Requires EIA-860M filing access. |
| `peak_demand_gw` | 152.6 GW | Amperon [4]; PJM [18] | July 16, 2024. Largest US ISO by peak demand. Data center load growth outpacing new supply. | `[✓]` PJM Year in Review confirms 152.55 GW on July 16, 2024 (~6 GW above 2023 summer peak). |
| `queue_completion_pct` | 12% | LBNL Queued Up [10]; RMI [19] | 2000–2019 entry cohort. Brattle Scorecard reports <10% for 2018–2020 cohort. Queue backlog of 260+ GW. "Speed to power" crisis (RMI). | `[~]` **12% not specifically confirmed for PJM** — LBNL national average is 13% of capacity. ISO-specific breakdown requires full data workbook. **260+ GW queue backlog confirmed** (~265 GW per LBNL, pre-reform). Post-reform active queue dropped to ~145 GW. |
| `queue_cohort` | 2000–2019 | LBNL Queued Up [10] | Standard long-window cohort. | `[✓]` |
| `color_group` | intermediate | Bottlenecks Lab classification | Rationale: building occurs (4,800 MW) but queue completion is low (12%), and data center demand growth deflates MW/GW ratio. Structural headwind from demand-side growth. | `[✓]` Internal classification; underlying metrics support designation. |
| Derived: MW/GW (nameplate) | 26.7 | Calculated: 4,079 / 152.6 = 26.73 | Updated to EIA-860M capacity. Previous: 31.4 (from 4,800 / 152.6). | `[✓]` |
| Derived: MW/GW (ELCC) | 9.3 | Calculated: 1,420 / 152.6 = 9.31 | Updated to EIA-860M capacity. Previous: 10.8 (from 1,650 / 152.6). | `[✓]` |

---

## 6. NYISO — New York ISO

| Field | Value | Source | Methodology | Verification |
|-------|-------|--------|-------------|--------------|
| `wholesale_price_mwh` | $41.81 | NYISO "Impact of National & Global Conditions on Electricity Prices in New York" white paper [20] | 2024 average wholesale price. **Estimated** — system-wide average obscures extreme zonal divergence: Zone J (NYC) ~$50+/MWh, upstate Zone A ~$25/MWh. | `[✓]` NYISO white paper and APPA summary confirm $41.81/MWh system-wide average. Zonal breakdown plausible but not independently confirmed. |
| `all_in_price_mwh` | $50.00 | NYISO white paper [20]; NYISO ICAP monthly reports [21] | Wholesale ($41.81) + capacity adder (~$8.19). | `[~]` Wholesale confirmed; ICAP adder unverified from publicly accessible sources. Math is internally consistent. |
| Capacity adder | ~$8.19 | NYISO Installed Capacity (ICAP) spot + demand curve [21] | ICAP clearing prices converted to approximate $/MWh equivalent. Varies significantly by zone. | `[ ]` ICAP monthly data requires NYISO portal access. Cannot verify conversion to $/MWh. |
| `capacity_additions_mw` | 1,069 MW | EIA-860M Jan 2026 vintage [5] | Gross nameplate MW reaching COD in 2024. Breakdown: solar 915 / wind 130 / battery 20 MW. | `[✓]` EIA-860M verified. Cross-reference: NYISO Winter Assessment reports 935 MW (within 15%). |
| `capacity_additions_elcc_mw` | 363 MW | Derived from EIA-860M nameplate using ELCC factors | solar ~35%, wind ~20%, battery ~85%. | `[~]` Derived from EIA-860M technology mix. |
| `project_count` | 18 | EIA-860M [5] | Distinct generators reaching COD in 2024. | `[ ]` Requires EIA-860M filing access. |
| `peak_demand_gw` | 29.0 GW | NYISO [22] | July 8, 2024. Actual 2024 peak. | `[✓]` NYISO data confirms 28,990 MW on July 8, 2024 (rounds to 29.0 GW). |
| `queue_completion_pct` | 10% | LBNL Queued Up [10]; Brattle/AEU Scorecard [7] | 2000–2019 entry cohort. Brattle reports <10% for 2018–2020 cohort. Offshore wind procurement delays and Article 10 siting friction. | `[~]` AEI Scorecard gave NYISO C- grade with <10% for 2018–2020 cohort. 10% for broader cohort is plausible but requires LBNL data workbook for precise confirmation. |
| `queue_cohort` | 2000–2019 | LBNL Queued Up [10] | Standard long-window cohort. | `[✓]` |
| `color_group` | broken | Bottlenecks Lab classification | Rationale: minimal new supply (950 MW, 32.8 MW/GW) despite high prices ($50 all-in). Severe queue dysfunction, offshore wind delays, CLCPA mandate mismatch. | `[✓]` Internal classification; underlying metrics verified. |
| Derived: MW/GW (nameplate) | 36.9 | Calculated: 1,069 / 29.0 = 36.86 | Updated to EIA-860M capacity. Previous: 32.8 (from 950 / 29.0). | `[✓]` |
| Derived: MW/GW (ELCC) | 12.5 | Calculated: 363 / 29.0 = 12.52 | Updated to EIA-860M capacity. Previous: 19.7 (from 570 / 29.0). | `[✓]` |

---

## 7. ISO-NE — ISO New England

| Field | Value | Source | Methodology | Verification |
|-------|-------|--------|-------------|--------------|
| `wholesale_price_mwh` | $41.47 | ISO-NE Internal Market Monitor 2024 Annual Markets Report [24] | Day-ahead average, 2024 annual. | `[✓]` ISO-NE IMM 2024 Annual Markets Report confirms $41.47/MWh DA average (13% YoY increase). RT was $39.50/MWh. |
| `all_in_price_mwh` | $51.00 | ISO-NE IMM [24]; FCA results [25] | Wholesale ($41.47) + capacity adder (~$9.53). **Not** the published $87/MWh total, which includes RECs, RGGI, ancillary, and transmission. $51 is the comparable energy + FCA figure. | `[✓]` $87/MWh total confirmed ($10.2B / ~122 TWh). Capacity costs = $1.2B → ~$9.8/MWh. Energy + capacity = ~$51.3/MWh, consistent with $51. |
| Capacity adder | ~$9.53 | ISO-NE Forward Capacity Auction (FCA) [25] | FCA clearing price converted to approximate $/MWh equivalent. Highest capacity adder among ISOs with capacity markets. | `[~]` IMM data derives ~$9.8/MWh from $1.2B capacity costs / ~122 TWh load. $9.53 is in range; difference is methodological. "Highest" claim plausible but not cross-verified against all ISOs. |
| `capacity_additions_mw` | 525 MW | EIA-860M Jan 2026 vintage [5] | Gross nameplate MW reaching COD in 2024. Breakdown: solar 421 / gas 65 / battery 25 MW. Not net of retirements (~1.4 GW: Mystic CC, June 2024). | `[✓]` EIA-860M verified. Cross-reference: ~400 MW from industry sources (lower, excludes some solar). |
| `capacity_additions_elcc_mw` | 230 MW | Derived from EIA-860M nameplate using ELCC factors | solar ~35%, gas ~95%, battery ~85%. | `[~]` Derived from EIA-860M technology mix. |
| `project_count` | 15 | EIA-860M [5] | Distinct generators reaching COD in 2024. | `[ ]` Requires EIA-860M filing access. |
| `peak_demand_gw` | 24.4 GW | FEL Power [28]; ISO-NE [24] | July 16, 2024. | `[✓]` ISO-NE data confirms 24,366 MW on July 16, 2024 (rounds to 24.4 GW). |
| `queue_completion_pct` | 8% | LBNL Queued Up [10]; Brattle/AEU Scorecard [7] | 2000–2019 entry cohort. Among the lowest queue completion rates nationally (AEI Scorecard: C- grade). Brattle reports <10% for 2018–2020 cohort. | `[~]` AEI Scorecard gave ISO-NE C- with <10% for 2018–2020 cohort. 8% for broader cohort plausible but requires LBNL data workbook. PJM scored D- on AEI Scorecard, so "worst nationally" overstates. |
| `queue_cohort` | 2000–2019 | LBNL Queued Up [10] | Standard long-window cohort. | `[✓]` |
| `color_group` | broken | Bottlenecks Lab classification | Rationale: minimal new supply (400 MW, 16.4 MW/GW) despite highest all-in prices ($51). Gas dependence + pipeline constraints drive winter spikes. Among lowest queue completion rates. High prices substantially reflect fuel mix / RGGI, not solely building barriers. | `[✓]` Internal classification; underlying metrics verified. |
| Derived: MW/GW (nameplate) | 21.5 | Calculated: 525 / 24.4 = 21.52 | Updated to EIA-860M capacity. Previous: 16.4 (from 400 / 24.4). | `[✓]` |
| Derived: MW/GW (ELCC) | 9.4 | Calculated: 230 / 24.4 = 9.43 | Updated to EIA-860M capacity. Previous: 8.2 (from 200 / 24.4). | `[✓]` |

---

## Cross-Cutting Methodology Notes

### [A] ELCC Factors and Accreditation

ELCC (Effective Load Carrying Capability) adjusts nameplate MW to reflect each technology's contribution to meeting peak demand. Generic starting factors:

| Technology | Generic ELCC | Notes |
|-----------|-------------|-------|
| Natural gas | 95% | High availability, near-firm |
| Battery storage (4hr) | 85% | Derated for events exceeding 4-hour duration |
| Offshore wind | 35–40% | Higher capacity factor than onshore, moderate ELCC |
| Solar | 30–35% | Peak contribution limited to daytime; varies by region and penetration |
| Onshore wind | 15–25% | Low correlation with summer peak; higher for winter-peaking systems |

**ISO-specific overrides used in this dataset:**

| ISO | Override | Source |
|-----|----------|--------|
| MISO | Solar at ~50% summer capacity credit | MISO Planning Resource Auction rules [12] |
| SPP | Wind per SPP ELCC study (~20–25%); battery ~90% | SPP ELCC Report [9] |
| CAISO | Battery 85–90%; solar ~30% (saturation effects) | CAISO accreditation [15] |
| ERCOT | Close to generic: solar ~30%, battery ~85%, gas 95% | ERCOT capacity reports |

ELCC varies by ISO, season, penetration level, and vintage. All ELCC MW values are estimates. Actual ELCC depends on portfolio effects (marginal ELCC declines as penetration increases).

### [B] Queue Cohort Comparability

**Critical comparability issue.** ERCOT uses the 2018–2020 entry cohort (Brattle/AEU Scorecard), while all other ISOs use the 2000–2019 aggregate cohort (LBNL Queued Up).

- Narrower recent cohorts naturally show higher completion because projects have had adequate time to complete but haven't yet been exposed to the full attrition window.
- Brattle reports all non-ERCOT ISOs at "<10%" for the 2018–2020 cohort, confirming the gap is real but the magnitude depends on cohort choice.
- LBNL's national 2000–2019 average is 13% of capacity reaching COD. MISO-specific LBNL figures are not publicly available in summary form (full data workbook required). The Brattle 28.3% for MISO's 2018–2020 cohort cannot be directly compared to LBNL's 2000–2019 national average.

**Comparability matrix:**

| ISO | LBNL 2000–2019 | Brattle 2018–2020 | Used in dataset |
|-----|---------------|-------------------|-----------------|
| ERCOT | N/A | 42.6% | 42.6% (Brattle) |
| MISO | not publicly available | 28.3% | 28% (Brattle) |
| SPP | 15% | <10% | 15% (LBNL) |
| PJM | 12% | <10% | 12% (LBNL) |
| CAISO | 10% | <10% | 10% (LBNL) |
| NYISO | 10% | <10% | 10% (LBNL) |
| ISO-NE | 8% | <10% | 8% (LBNL) |

### [C] ERCOT Derived Metric Discrepancy

METHODOLOGY.md previously reported ERCOT supply response intensity as 218.5 MW/GW (nameplate) and 114.5 MW/GW (ELCC). These values were computed using the preliminary peak demand of 85.6 GW, which was corrected to 85.2 GW in Round 2 audit corrections.

**Resolved.** METHODOLOGY.md has been updated to the correct values:
- Nameplate: 18,700 / 85.2 = **219.5** MW/GW (was 218.5)
- ELCC: 9,800 / 85.2 = **115.0** MW/GW (was 114.5)

### [D] DA/RT Price Mixing

The dataset mixes day-ahead and real-time price bases:

| Basis | ISOs |
|-------|------|
| Day-ahead (DA) | ERCOT, SPP, ISO-NE |
| Real-time load-weighted (RT) | MISO, PJM |
| Estimated | CAISO, NYISO |

DA prices are typically $1–3/MWh higher than RT. This introduces ~$2–3/MWh noise in cross-ISO comparisons. The relative ordering is robust (the cheapest-to-most-expensive spread is ~$14/MWh), but precise pairwise comparisons carry this uncertainty. Standardizing to one basis was not done because both are valid metrics reported by respective market monitors, and imputing a DA/RT spread varies by ISO and year.

### [E] Gross vs. Net Capacity

All `capacity_additions_mw` values are **gross** nameplate additions — they do not subtract retirements. Material 2024 retirements:

| ISO | Retirement | MW | Source | Verification |
|-----|------------|-----|--------|--------------|
| MISO | South Oak Creek, Rush Island (coal) | ~1,800 | MISO retirement filings | `[✓]` South Oak Creek 5&6 (~598 MW, May 2024) + Rush Island 1&2 (~1,242 MW, Oct 2024) = ~1,840 MW. Confirmed via GEM, Utility Dive. |
| ISO-NE | Mystic CC (June 2024) | ~1,400 | ISO-NE | `[✓]` 1,413 MW (Units 8+9), retired June 1, 2024. Confirmed via EIA, O&E Online. |
| PJM | Warrior Run (coal/cogen, June 2024) | ~205 | AES / EIA | `[✓]` Maryland's last coal plant. 205 MW retired June 1, 2024. Confirmed via Baltimore Sun, Sierra Club, EIA. Replaces earlier incorrect Homer City reference (Homer City retired July 2023, not 2024). |

Net capacity additions = gross - retirements. For ISOs with large retirements, gross figures significantly overstate net:
- MISO net: 7,500 - 1,800 = ~5,700 MW `[✓]`
- ISO-NE net: 400 - 1,400 = **-1,000 MW** (net capacity loss) `[✓]`
- PJM net: 4,800 - 205 = ~4,595 MW (Warrior Run was the only significant 2024 PJM coal retirement; net impact minimal)

### [F] Capacity Adder Methodology

Capacity adders convert auction clearing prices ($/MW-day or similar) to approximate $/MWh equivalents using load-weighted conversion. They vary by delivery year, zone, and resource type. Key nuances:

- **ERCOT**: $0 — energy-only market, no capacity mechanism
- **SPP**: Minimal capacity market, ~$1.44/MWh
- **MISO**: Planning Resource Auction (PRA), ~$2/MWh
- **PJM**: RPM BRA 2024/2025 at $28.92/MW-day `[✓]`. Flat-load conversion ≈ $1.21/MWh; Monitoring Analytics reports capacity = 6.6% of $55.54/MWh total = ~$3.67/MWh. Dataset uses ~$2.26/MWh (intermediate estimate). **The 2025/2026 BRA cleared at $269.92/MW-day `[✓]`** — this is not reflected in the 2024 data but would dramatically raise PJM's all-in to ~$52/MWh
- **CAISO**: Resource Adequacy (RA) via bilateral procurement, less transparent, ~$5/MWh estimate from CPUC. CPUC 2024 spot RA benchmarks suggest ~$10+/MWh; $5 may reflect blended portfolio cost
- **NYISO**: ICAP spot + demand curve, ~$8.19/MWh, significant zonal variation
- **ISO-NE**: FCA, ~$9.53/MWh. Published total of $87/MWh includes RECs, RGGI, ancillary, and transmission — only the energy + FCA portion ($51/MWh) is used for comparability

---

## Source Bibliography

| # | Source | Type | Used For |
|---|--------|------|----------|
| [1] | E3, "2024 ERCOT Market Update" | Market report | ERCOT wholesale price, capacity, 2023 price |
| [2] | IEEFA (Institute for Energy Economics and Financial Analysis) | Analysis | ERCOT capacity cross-reference |
| [3] | Federal Reserve Bank of Dallas | Economic analysis | ERCOT capacity cross-reference |
| [4] | Amperon | Grid analytics platform | Capacity breakdowns, peak demand (ERCOT, SPP, MISO, CAISO, PJM, ISO-NE) |
| [5] | EIA Form 860M (Monthly Generator Inventory) | Federal filing | Project counts (all ISOs) |
| [6] | ERCOT, official settled peak demand data | ISO data | ERCOT peak demand |
| [7] | Brattle Group / Grid Strategies / Americans for a Clean Energy Grid (AEU), "Generator Interconnection Scorecard" | Industry report | Queue completion rates (ERCOT 2018–2020, MISO, cross-reference for others) |
| [8] | SPP, "2024 Annual State of the Market Report" | Market monitor | SPP wholesale price, peak demand |
| [9] | SPP ELCC Report | ISO study | SPP capacity additions, ELCC factors |
| [10] | Lawrence Berkeley National Laboratory (LBNL), "Queued Up" 2025 Edition | Federal lab report | Queue completion rates (2000–2019 cohort, all ISOs except ERCOT primary) |
| [11] | Potomac Economics, "2024 MISO State of the Market Report" | Independent market monitor | MISO wholesale price |
| [12] | MISO Planning Resource Auction results; MISO Capacity Credit Report | ISO data | MISO capacity adder, MISO-specific ELCC (solar 50%) |
| [13] | CAISO Department of Market Monitoring, Q3/Q4 2024 Quarterly Reports | Market monitor | CAISO wholesale price (estimated annual DA avg) |
| [14] | CPUC Resource Adequacy (RA) program reports | Regulator data | CAISO capacity adder (~$5/MWh) |
| [15] | CAISO, "2024 Battery Storage Special Report" | ISO report | CAISO capacity additions (4.2 GW battery) |
| [16] | Concentric Energy Advisors | Consultancy | CAISO queue completion cross-reference |
| [17] | Monitoring Analytics, "2024 PJM State of the Market Report" | Independent market monitor | PJM wholesale price, capacity data |
| [18] | PJM RPM Base Residual Auction results (2024/2025 delivery year) | ISO data | PJM capacity adder ($28.92/MW-day), peak demand |
| [19] | Rocky Mountain Institute (RMI) | Analysis | PJM queue dynamics, "speed to power" crisis |
| [20] | NYISO, "Impact of National & Global Conditions on Electricity Prices in New York" (2024 white paper) | ISO publication | NYISO wholesale price |
| [21] | NYISO ICAP monthly auction reports | ISO data | NYISO capacity adder |
| [22] | NYISO Winter Assessment; NYISO operational data | ISO data | NYISO capacity additions, peak demand |
| [23] | ESAI Power | Industry analysis | NYISO capacity additions (~452 MW pre-summer, ~935 MW total) |
| [24] | ISO-NE Internal Market Monitor, "2024 Annual Markets Report" | Market monitor | ISO-NE wholesale price, peak demand |
| [25] | ISO-NE Forward Capacity Auction results | ISO data | ISO-NE capacity adder |
| [26] | ISO Newswire | Industry news | ISO-NE capacity additions |
| [27] | Vineyard Wind | Developer data | Offshore wind (136 MW, blade failure July 2024) |
| [28] | FEL Power | Industry analysis | ISO-NE peak demand |

---

## Arithmetic Verification Summary

Supply response intensity (MW/GW) should equal `capacity_additions_mw / peak_demand_gw`. Cross-check:

| ISO | Capacity MW | Peak GW | Nameplate MW/GW | ELCC MW | ELCC MW/GW | Match? |
|-----|------------|---------|-----------------|---------|------------|--------|
| ERCOT | 13,973 | 85.2 | 164.0 | 6,773 | 79.5 | ✓ (EIA-860M) |
| SPP | 1,142 | 54.0 | 21.1 | 271 | 5.0 | ✓ (EIA-860M) |
| MISO | 7,156 | 121.6 | 58.8 | 3,501 | 28.8 | ✓ (EIA-860M) |
| CAISO | 6,535 | 48.3 | 135.3 | 4,064 | 84.1 | ✓ (EIA-860M) |
| PJM | 4,079 | 152.6 | 26.7 | 1,420 | 9.3 | ✓ (EIA-860M) |
| NYISO | 1,069 | 29.0 | 36.9 | 363 | 12.5 | ✓ (EIA-860M) |
| ISO-NE | 525 | 24.4 | 21.5 | 230 | 9.4 | ✓ (EIA-860M) |

All-in price should equal `wholesale_price_mwh + capacity_adder`:

| ISO | Wholesale | + Adder | = All-In | Match? |
|-----|-----------|---------|----------|--------|
| ERCOT | $27.33 | $0.00 | $27.33 | ✓ |
| SPP | $27.56 | ~$1.44 | $29.00 | ✓ |
| MISO | $31.00 | ~$2.00 | $33.00 | ✓ |
| PJM | $33.74 | ~$2.26 | $36.00 | ✓ |
| CAISO | $38.00 | ~$5.00 | $43.00 | ✓ |
| NYISO | $41.81 | ~$8.19 | $50.00 | ✓ |
| ISO-NE | $41.47 | ~$9.53 | $51.00 | ✓ (rounded) |

---

## 2023 Data Summary

Capacity data from EIA-860M January 2026 vintage. Prices from market monitor reports where available, estimated where noted.

### 2023 Capacity (EIA-860M)

| ISO | Nameplate MW | ELCC MW | Key breakdown |
|-----|-------------|---------|---------------|
| PJM | 7,910 | ~4,938 | solar 3,487 / gas CC 3,355 / wind 594 / gas CT 380 / battery 60 |
| ERCOT | 7,757 | ~3,736 | solar 3,553 / battery 1,924 / wind 1,461 / gas 820 |
| CAISO | 5,701 | ~3,454 | battery 3,052 / solar 2,545 / wind 95 |
| MISO | 4,878 | ~2,347 | solar 2,758 / wind 1,386 / gas 690 |
| SPP | 2,090 | ~476 | wind 1,895 / solar 165 |
| NYISO | 923 | ~266 | wind 557 / solar 313 / battery 53 |
| ISO-NE | 404 | ~170 | solar 336 / battery 61 |

### 2023 Prices

| ISO | Price ($/MWh) | Basis | Confidence | Source |
|-----|--------------|-------|------------|--------|
| ERCOT | $55.50 | DA | High | E3 2024 ERCOT Market Update |
| SPP | $26.00 | DA | High | SPP 2023 SOM |
| PJM | $31.08 | RT LWA | High | Monitoring Analytics 2023 SOM |
| ISO-NE | $36.82 | DA | High | ISO-NE IMM 2023 |
| MISO | ~$35.00 | RT est. | Medium | Potomac 2023 SOM (~$37 all-in minus ~$2 PRA) |
| CAISO | ~$45.00 | DA est. | Medium | DMM 2023 (~$65 all-in; energy-only estimated) |
| NYISO | ~$45.00 | est. | Low-Medium | Potomac 2023 (~$58 all-in minus ~$8 ICAP; zonal avg est.) |

### 2023 Peak Demand

| ISO | Peak GW | Source |
|-----|---------|--------|
| PJM | 147.0 | PJM (2023 summer peak) |
| MISO | 123.0 | MISO (2023 summer peak) |
| ERCOT | 85.5 | ERCOT (2023 record) |
| SPP | 56.2 | SPP 2023 SOM |
| CAISO | 44.5 | CAISO (Sept 2023 peak) |
| NYISO | 30.2 | NYISO (2023 summer peak) |
| ISO-NE | 23.5 | ISO-NE (2023 summer peak) |

---

## 2025 Estimates (All 7 ISOs)

**Scope:** All 7 ISOs. No annual SOM reports published yet (expect May–Aug 2026). PJM and MISO have locked-in capacity auction results; others use EIA STEO monthly data, ISO quarterly reports, and proportional estimates.

| ISO | Wholesale | All-In | Capacity MW | Price Source | Capacity Source | Confidence |
|-----|-----------|--------|-------------|-------------|-----------------|------------|
| ERCOT | $37.57 | $37.57 | 11,000 | EIA STEO monthly (12-mo avg) | Modo Energy annual report | Medium-High |
| SPP | $37.91 | $39.00 | 1,200 | EIA STEO monthly (12-mo avg) | Est. proportional to 2024 | Medium |
| MISO | $31.00 | $40.00 | 7,000 | Est. similar to 2024 | Est. similar to 2024 | Medium |
| PJM | $34.00 | $52.00 | 4,000 | Est. similar to 2024 | Est. similar to 2024 | Medium-High |
| CAISO | $35.00 | $40.00 | 5,713 | CAISO DMM Q1–Q3 quarterly | CAISO 2025 Year in Review | Medium |
| NYISO | $55.00 | $65.00 | 800 | Potomac Economics + EIA monthly | Est. proportional to 2024 | Medium |
| ISO-NE | $55.00 | $65.00 | 600 | ISO Newswire monthly | Est. proportional to 2024 | Medium |

**Key locked-in prices:**
- **PJM BRA 2025/26:** $269.92/MW-day (~$18/MWh capacity adder, 9× increase from $28.92). Confirmed from S&P Global and PJM official report. Contractually binding.
- **MISO PRA 2025/26:** $217/MW-day annualized (~$9/MWh capacity adder, 10× increase). Summer peak $666.50/MW-day (22× increase). Structural capacity shortfall.
