# Methodology

## Overview

This chart plots **average wholesale electricity price** (y-axis) against **new generation capacity or queue completion** (x-axis) across the seven major US ISOs/RTOs. The thesis: ISOs with functional interconnection processes and market structures (ERCOT, MISO) produce a strong "supply response" — high prices attract new generation that eventually moderates prices. ISOs with dysfunctional queues and permitting friction (ISO-NE, NYISO) exhibit a broken supply response — high prices persist because new supply can't get built.

This mirrors the Zidar housing economics framing: rents vs. building permits across metros, where Austin builds and San Francisco doesn't.

## Data Sources

All data is for calendar year **2024** unless otherwise noted.

### Wholesale Electricity Prices ($/MWh)

Day-ahead or real-time load-weighted average prices from each ISO's independent market monitor:

| ISO | Value | Basis | Source |
|-----|-------|-------|--------|
| ERCOT | $27.33 | DA | E3 2024 ERCOT Market Update (ERCOT North Hub DA avg) |
| SPP | $27.56 | DA | SPP 2024 Annual State of the Market Report (DA system avg) |
| MISO | $31.00 | RT | Potomac Economics 2024 MISO State of the Market (RT avg LMP) |
| PJM | $33.74 | RT | Monitoring Analytics 2024 PJM State of the Market (RT LW avg LMP) |
| CAISO | $38.00 | est. | CAISO DMM Q3/Q4 2024 Quarterly Reports (est. annual DA avg) |
| NYISO | $41.81 | est. | NYISO white paper (2024 avg wholesale price) |
| ISO-NE | $41.47 | DA | ISO-NE Internal Market Monitor 2024 Annual Markets Report (DA avg) |

**DA/RT price mixing:** ERCOT, SPP, and ISO-NE use day-ahead averages; MISO and PJM use real-time load-weighted averages. DA prices are typically $1–3/MWh higher than RT, introducing ~$2–5/MWh noise. The relative ordering is robust despite this.

**Notes:**
- ERCOT 2024 prices dropped ~50% from 2023 ($55.50) due to massive solar/battery additions suppressing peak prices. The 2024 price is the *result* of the supply response — building was triggered by 2021–2023 price signals.
- CAISO's $38/MWh is an **estimate** from quarterly reports, not a final annual figure.
- NYISO has extreme zonal divergence: Zone J (NYC) averages ~$50+/MWh, upstate Zone A ~$25/MWh. The system-wide average obscures this.

### All-In Prices ($/MWh, Energy + Capacity)

All-in prices add **only capacity auction payments** to the energy-only wholesale averages. These represent the cost generators receive for energy plus capacity procurement.

| ISO | Wholesale | Capacity Adder | All-In | Mechanism |
|-----|-----------|---------------|--------|-----------|
| ERCOT | $27.33 | $0.00 | $27.33 | Energy-only market (no capacity payments) |
| SPP | $27.56 | ~$1.44 | $29.00 | Minimal capacity market |
| MISO | $31.00 | ~$2.00 | $33.00 | Planning Resource Auction (PRA) |
| PJM | $33.74 | ~$2.26 | $36.00 | RPM BRA 2024/2025 ($28.92/MW-day) |
| CAISO | $38.00 | ~$5.00 | $43.00 | Resource Adequacy (RA) bilateral procurement |
| NYISO | $41.81 | ~$8.19 | $50.00 | Installed Capacity (ICAP) spot + demand curve |
| ISO-NE | $41.47 | ~$9.53 | $51.00 | Forward Capacity Auction (FCA) |

**ISO-NE pricing clarification:** ISO-NE's published "total wholesale cost" of $87/MWh includes energy, capacity, RECs, RGGI compliance costs, ancillary services, and transmission. This chart uses only the comparable **energy + FCA capacity** figure (~$51/MWh) to maintain apples-to-apples comparability with other ISOs. Using the $87 figure would overstate ISO-NE's position relative to peers.

**PJM capacity adder:** Uses the 2024/2025 BRA clearing price of $28.92/MW-day (~$2/MWh). Note that the 2025/2026 BRA jumped to $269.92/MW-day (~$18/MWh), which would raise PJM's all-in to ~$52/MWh — not reflected here since the chart uses the 2024 delivery year.

**Other notes:**
- Capacity adders are approximate $/MWh equivalents derived from auction clearing prices and load-weighted conversion. They vary by delivery year, zone, and resource type.
- CAISO's RA costs are bilateral and less transparent; the $5/MWh estimate reflects CPUC RA program cost estimates.
- Sources: ISO-NE IMM 2024 Annual Markets Report, PJM Monitoring Analytics SOM, NYISO ICAP monthly reports, MISO PRA results, CPUC RA reports.

### New Generation Capacity (MW)

Generators reaching commercial operation in 2024, from EIA-860M filings and ISO reports:

| ISO | Nameplate MW | ELCC MW | Primary sources | Key breakdown |
|-----|-------------|---------|----------------|---------------|
| ERCOT | 18,700 | ~9,800 | E3; IEEFA; Dallas Fed; Amperon | 9.7 GW solar, 4.4 GW battery, 3.4 GW gas, ~1.2 GW wind |
| MISO | 7,500 | ~3,300 | Brattle; MISO Capacity Credit Report | ~6.7 GW solar, ~0.8 GW wind + other |
| CAISO | 7,500 | ~4,640 | CAISO Battery Storage Report; Amperon | 4.2 GW battery, 3 GW solar |
| PJM | 4,800 | ~1,650 | PJM SOM; Amperon | 4.5 GW solar, 0.29 GW wind, 43 MW storage |
| SPP | 2,500 | ~1,675 | SPP ELCC Report; Amperon | 1.2 GW wind, 0.5 GW solar, 0.8 GW battery |
| NYISO | 950 | ~570 | NYISO Winter Assessment; ESAI Power | Mixed clean energy |
| ISO-NE | 400 | ~200 | ISO Newswire; Vineyard Wind | 136 MW offshore wind, ~200 MW solar |

**Gross vs. net capacity:** All capacity figures are gross nameplate additions, not net of retirements. Notable 2024 retirements include ~2.5 GW coal in MISO and ~1.8 GW coal in PJM.

### ELCC-Weighted Capacity

Nameplate MW overstates variable resources for reliability purposes. 1 MW of solar does not equal 1 MW of gas for meeting peak demand. The chart offers an ELCC (Effective Load Carrying Capability) toggle that applies standard capacity credit factors per technology:

| Technology | ELCC Factor | Rationale |
|-----------|-------------|-----------|
| Natural gas | 95% | High availability, near-firm |
| Battery storage | 85% | 4-hour duration typical; derated for longer events |
| Offshore wind | 35–40% | Higher capacity factor than onshore, moderate ELCC |
| Solar | 30–35% | Peak contribution limited to daytime hours; varies by region |
| Onshore wind | 15–25% | Low correlation with summer peak; higher for winter-peaking systems |

ELCC estimates per ISO use the technology breakdowns above and regional ELCC factors from ISO reliability studies. These are **estimates** — actual ELCC values vary by vintage, location, and portfolio effects (saturation reduces marginal ELCC).

| ISO | Nameplate MW | ELCC MW | MW/GW (Nameplate) | MW/GW (ELCC) |
|-----|-------------|---------|-------------------|--------------|
| ERCOT | 18,700 | ~9,800 | 218.5 | ~114.5 |
| CAISO | 7,500 | ~4,640 | 155.3 | ~96.1 |
| MISO | 7,500 | ~3,300 | 61.7 | ~27.1 |
| SPP | 2,500 | ~1,675 | 46.3 | ~31.0 |
| NYISO | 950 | ~570 | 32.8 | ~19.7 |
| PJM | 4,800 | ~1,650 | 31.4 | ~10.8 |
| ISO-NE | 400 | ~200 | 16.4 | ~8.2 |

### Peak Demand (GW)

System coincident peak from 2024, used to normalize capacity additions and size bubbles:

| ISO | Peak GW | Date | Source |
|-----|---------|------|--------|
| PJM | 152.6 | July 16, 2024 | Amperon; PJM |
| MISO | 121.6 | Aug 26, 2024 | Amperon |
| ERCOT | 85.6 | Aug 20, 2024 | ERCOT (all-time record) |
| SPP | 54.0 | Summer 2024 | SPP State of the Market |
| CAISO | 48.3 | Sept 5, 2024 | Amperon |
| NYISO | 29.0 | July 8, 2024 | NYISO |
| ISO-NE | 24.4 | July 16, 2024 | FEL Power; ISO-NE |

**Demand growth dynamics:** PJM's data center boom is growing peak demand faster than new supply, deflating the MW/GW ratio even as absolute MW increase. This is a structural headwind for PJM's supply response metric.

### Interconnection Queue Completion Rates (%)

Share of projects entering the interconnection queue that reach commercial operation. From LBNL "Queued Up" 2025 Edition and the Brattle/AEU Generator Interconnection Scorecard:

| ISO | Rate | Cohort | Source |
|-----|------|--------|--------|
| ERCOT | 42.6% | 2018–2020 | Brattle/AEU Scorecard |
| MISO | 30% | 2000–2019 | Concentric Energy Advisors; LBNL |
| SPP | 15% | 2000–2019 | LBNL; Brattle |
| PJM | 12% | 2000–2019 | LBNL; RMI |
| CAISO | 10% | 2000–2019 | Concentric Energy Advisors; LBNL |
| NYISO | 10% | 2000–2019 | LBNL; Brattle |
| ISO-NE | 8% | 2000–2019 | LBNL; Brattle/AEU Scorecard |

National average: only 13% of capacity requesting interconnection (2000–2019) reached COD by end of 2024.

**Queue cohort mismatch:** ERCOT's 42.6% uses the 2018–2020 entry cohort (Brattle/AEU Scorecard), while all other ISOs use the 2000–2019 cohort (LBNL Queued Up). This is a significant comparability issue:

- Narrower recent cohorts naturally show higher completion rates because projects have had adequate but not excessive time to complete.
- The Brattle Scorecard reports SPP, PJM, NYISO, and ISO-NE all at "<10%" for the 2018–2020 cohort — suggesting the gap remains but the magnitude may differ from what's shown.
- ERCOT's structural advantages (see below) are real, but the cohort difference inflates the visual gap.

**ERCOT's structural interconnection advantage:** ERCOT's high queue completion rate reflects genuine structural differences, not just better management:
- Isolated grid with no FERC jurisdiction (no Order 2003/2023 compliance)
- Single-state operation (no multi-state coordination)
- Single-entity approval process (ERCOT alone, not multiple transmission owners)
- Energy-only market reduces speculative queue entries (no capacity payment incentive)

## Derived Metrics

### Supply Response Intensity (MW per GW peak)

New capacity additions normalized by system peak demand:

```
supply_response = capacity_additions_mw / peak_demand_gw
```

| ISO | Nameplate MW/GW | ELCC MW/GW |
|-----|----------------|------------|
| ERCOT | 218.5 | ~114.5 |
| CAISO | 155.3 | ~96.1 |
| MISO | 61.7 | ~27.1 |
| SPP | 46.3 | ~31.0 |
| NYISO | 32.8 | ~19.7 |
| PJM | 31.4 | ~10.8 |
| ISO-NE | 16.4 | ~8.2 |

### Bubble Sizing

Bubble radius uses a square-root scale of peak demand (area-proportional representation):

```
radius = sqrt_scale(peak_demand_gw, domain=[24, 153], range=[14px, 48px])
```

## Color Groups

| Group | ISOs | Rationale |
|-------|------|-----------|
| Functional (blue) | ERCOT, MISO | High queue throughput, active building, market-driven supply response |
| Intermediate (purple) | SPP, CAISO, PJM | Building occurs but queue completion is low (SPP 15%, CAISO 10%, PJM 12%) |
| Broken (red) | NYISO, ISO-NE | Minimal new supply despite high prices; severe queue dysfunction |

**SPP reclassification:** SPP was previously grouped as "functional" but its 15% queue completion rate and 46.3 MW/GW supply response are closer to PJM than to ERCOT. Reclassified to "intermediate" for accuracy.

## Caveats

1. **Temporal causality**: ERCOT's 2024 price ($27/MWh) is the *result* of the supply response — down from $55/MWh in 2023. The massive 2024 buildout was triggered by 2021–2023 price signals and scarcity events (including Winter Storm Uri). The chart shows a snapshot; the causal chain runs from past prices to current building to future price moderation.

2. **DA/RT price mixing**: The dataset mixes DA averages (ERCOT, SPP, ISO-NE) with RT averages (MISO, PJM) and estimates (CAISO, NYISO). DA prices are typically $1–3/MWh higher. The relative ordering is robust despite this noise, but precise price comparisons across ISOs carry ~$2–5/MWh uncertainty.

3. **CAISO's position**: High capacity additions are driven by state mandates (SB 100) and battery storage policy, not purely market signals. The low queue completion rate reflects speculative queue entries. The "Mandate-driven" annotation flags this.

4. **Queue cohort comparability**: ERCOT uses 2018–2020 cohorts while others use 2000–2019. See the Queue Completion section above for full discussion.

5. **Nameplate vs. effective capacity**: Using nameplate MW overstates variable resources (solar, wind) relative to firm capacity. The ELCC toggle provides estimated effective capacity for comparison.

6. **Gross vs. net capacity**: All capacity figures are gross nameplate additions, not net of retirements. Significant coal retirements occurred in MISO (~2.5 GW) and PJM (~1.8 GW) in 2024 that are not reflected.

7. **ERCOT peak demand**: The 85.6 GW figure reflects ERCOT's preliminary real-time value (Aug 20, 2024). Settled data shows 85.2 GW, slightly below the 2023 record of 85.5 GW.

8. **PJM demand growth**: Data center demand is growing PJM's peak demand faster than new supply, deflating the MW/GW ratio even as absolute MW increase. This makes PJM appear worse on normalized metrics than raw additions would suggest.

## Audit Corrections

The following corrections were made based on a methodological audit:

| Finding | Before | After | Rationale |
|---------|--------|-------|-----------|
| ISO-NE all-in price | $87/MWh | $51/MWh | $87 includes RECs, RGGI, ancillary, transmission. Comparable energy + FCA capacity ≈ $51. |
| PJM all-in price | $42/MWh | $36/MWh | RPM BRA 2024/25 at $28.92/MW-day ≈ $2/MWh capacity adder, not ~$8. |
| SPP color group | Functional | Intermediate | 15% queue / 46.3 MW/GW is closer to PJM than ERCOT. |
| Projects/GW metric | Included | Removed | CAISO (2.28) > ERCOT (2.10) on this metric, contradicting thesis. Rewards fragmentation. |
| ELCC-weighted capacity | Not available | Toggle added | Nameplate MW overstates variable resources; ELCC provides reliability-relevant comparison. |
| Queue cohort annotation | Footnote only | Asterisk + persistent footnote | Critical comparability issue now prominently flagged. |
| ERCOT 2023 price | Not shown | Annotation on chart | Adds temporal context: 2024 price is the result of building, not its cause. |
| CAISO mandate note | Hover-only, capacity view | Always visible | Material context for interpreting CAISO's position. |

All corrections bias toward making the functional-vs-broken gap **more accurately sized** (generally smaller than previously shown).
