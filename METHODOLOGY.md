# Methodology

## Overview

This chart plots **electricity price** (y-axis) against **new generation capacity or queue completion** (x-axis) across the seven major US ISOs/RTOs and their constituent states. The thesis: structural barriers to building new generation — queue dysfunction, permitting friction, multi-state coordination — are a key structural factor behind persistently high electricity prices, alongside fuel mix exposure, pipeline constraints, and carbon policy costs. ISOs that build easily (ERCOT, MISO) tend toward lower prices; ISOs that can't build (ISO-NE, NYISO) stay expensive. ISO-NE's prices, for example, substantially reflect winter gas/pipeline constraints and RGGI costs, not just queue dysfunction.

This mirrors the Zidar housing economics framing: rents vs. building permits across metros, where Austin builds and San Francisco doesn't.

## Data Sources

The chart supports **2023**, **2024**, and **2025 estimates** (all 7 ISOs) via a year toggle. In ISO view, all three years are available; in state view, 2023 and 2024. All data is for calendar year **2024** by default unless otherwise noted.

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

**DA/RT price mixing:** ERCOT, SPP, and ISO-NE use day-ahead averages; MISO and PJM use real-time load-weighted averages. DA prices are typically $1–3/MWh higher than RT, introducing ~$2–3/MWh noise. The relative ordering is robust despite this, but precise cross-ISO comparisons carry this uncertainty.

**Price basis standardization note:** DA/RT mixing was not resolved because both are valid market metrics widely reported by their respective market monitors. Standardizing to one basis would require imputing a DA/RT spread that varies by ISO and year. The estimated bias is ~$2–3/MWh — small relative to the $14/MWh spread between the cheapest (ERCOT) and most expensive (ISO-NE/NYISO) ISOs.

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

### Retail Electricity Prices (cents/kWh) — State View

The state view uses **EIA average retail electricity prices** (selected year, all sectors) as the y-axis, giving each state an independent price value rather than inheriting the parent ISO's wholesale price. State data is available for 2023 and 2024.

Source: [EIA State Electricity Profiles](https://www.eia.gov/electricity/state/) — Average Retail Price of Electricity (all sectors, 2023 and 2024).

**What retail prices include:** Generation, transmission, distribution, taxes, and regulatory charges. This means retail prices are substantially higher than wholesale prices and reflect end-consumer costs rather than generator revenue.

**Why retail prices for the state view:** Wholesale prices are set at the ISO level — all states within an ISO face the same wholesale price signal. Using wholesale prices on the y-axis causes all states within an ISO to plot at the same vertical position, collapsing a dimension. Retail prices vary meaningfully across states (e.g., within ISO-NE: Vermont 18.4¢ vs. Connecticut 24.4¢) and provide a more informative axis.

**Caveats:**
- Retail prices reflect distribution and regulatory costs that are unrelated to generation adequacy. A state can have high retail prices due to distribution infrastructure costs, not generation scarcity.
- California's extreme retail price (27.0¢/kWh) is driven substantially by wildfire liability costs, CPUC regulatory charges, and utility infrastructure spending — not solely by generation costs.
- The ISO-level (wholesale) view remains the more direct measure of generator economics. The state-level (retail) view shows the consumer cost dimension.

### New Generation Capacity (MW)

Generators reaching commercial operation, from EIA-860M January 2026 vintage:

#### 2024 Capacity (EIA-860M)

| ISO | Nameplate MW | ELCC MW | Key breakdown |
|-----|-------------|---------|---------------|
| ERCOT | 13,973 | ~6,773 | solar 7,277 / battery 4,264 / wind 1,735 / gas 697 |
| MISO | 7,156 | ~3,501 | solar 6,273 / wind 625 / gas 186 / battery 54 |
| CAISO | 6,535 | ~4,064 | battery 3,638 / solar 2,688 / wind 143 / gas 48 |
| PJM | 4,079 | ~1,420 | solar 3,817 / wind 189 / battery 54 |
| SPP | 1,142 | ~271 | wind 902 / solar 225 |
| NYISO | 1,069 | ~363 | solar 915 / wind 130 / battery 20 |
| ISO-NE | 525 | ~230 | solar 421 / gas 65 / battery 25 |

**Filing-lag caveat:** EIA-860M January 2026 vintage may undercount recent additions due to filing lag. Industry sources report higher figures: ERCOT ~18.7 GW (E3, IEEFA, Dallas Fed, Amperon), SPP ~2.5 GW (SPP ELCC Report, Amperon). The EIA-860M figures are used for consistency across years.

#### 2023 Capacity (EIA-860M)

| ISO | Nameplate MW | ELCC MW | Key breakdown |
|-----|-------------|---------|---------------|
| PJM | 7,910 | ~4,938 | solar 3,487 / gas CC 3,355 / wind 594 / gas CT 380 / battery 60 |
| ERCOT | 7,757 | ~3,736 | solar 3,553 / battery 1,924 / wind 1,461 / gas 820 |
| CAISO | 5,701 | ~3,454 | battery 3,052 / solar 2,545 / wind 95 |
| MISO | 4,878 | ~2,347 | solar 2,758 / wind 1,386 / gas 690 |
| SPP | 2,090 | ~476 | wind 1,895 / solar 165 |
| NYISO | 923 | ~266 | wind 557 / solar 313 / battery 53 |
| ISO-NE | 404 | ~170 | solar 336 / battery 61 |

**Notable 2023 → 2024 changes:** PJM dropped from 7,910 to 4,079 MW (loss of gas CC cycle); ERCOT nearly doubled from 7,757 to 13,973 MW (solar/battery boom).

**Gross vs. net capacity:** All capacity figures are gross nameplate additions, not net of retirements. Gross figures overstate net additions, especially for MISO and ISO-NE. Material 2024 retirements: MISO ~1.8 GW coal (South Oak Creek, Rush Island); ISO-NE 1.4 GW (Mystic CC, June 2024); PJM ~0.2 GW (Warrior Run coal/cogen, June 2024).

### ELCC-Weighted Capacity

Nameplate MW overstates variable resources for reliability purposes. 1 MW of solar does not equal 1 MW of gas for meeting peak demand. The chart offers an ELCC (Effective Load Carrying Capability) toggle that applies standard capacity credit factors per technology:

| Technology | ELCC Factor | Rationale |
|-----------|-------------|-----------|
| Natural gas | 95% | High availability, near-firm |
| Battery storage | 85% | 4-hour duration typical; derated for longer events |
| Offshore wind | 35–40% | Higher capacity factor than onshore, moderate ELCC |
| Solar | 30–35% | Peak contribution limited to daytime hours; varies by region |
| Onshore wind | 15–25% | Low correlation with summer peak; higher for winter-peaking systems |

**ISO-specific accreditation:** The generic factors above are starting points, but ISO-level ELCC figures use ISO-specific accreditation values where available:
- **MISO**: Summer solar capacity credit of ~50% (MISO Planning Resource Auction rules), not the generic 30–35%. This explains MISO's ~3,500 MW ELCC from 7,156 MW nameplate (~6.3 GW solar).
- **SPP**: Wind ELCC per SPP's own ELCC study (~20–25% for existing fleet); battery at ~90%. SPP's ~271 MW ELCC from 1,142 MW nameplate reflects the wind-heavy mix with SPP-specific factors.
- **CAISO**: Battery at 85–90% (4-hour duration); solar at ~30% (high penetration saturation).
- **ERCOT**: Solar ~30%, battery ~85%, gas 95% — close to generic factors.

ELCC varies significantly by ISO, season, and penetration level. These are **estimates** — actual ELCC values vary by vintage, location, and portfolio effects (saturation reduces marginal ELCC).

| ISO | Nameplate MW | ELCC MW | MW/GW (Nameplate) | MW/GW (ELCC) |
|-----|-------------|---------|-------------------|--------------|
| ERCOT | 13,973 | ~6,773 | 164.0 | ~79.5 |
| CAISO | 6,535 | ~4,064 | 135.3 | ~84.1 |
| MISO | 7,156 | ~3,501 | 58.8 | ~28.8 |
| NYISO | 1,069 | ~363 | 36.9 | ~12.5 |
| PJM | 4,079 | ~1,420 | 26.7 | ~9.3 |
| SPP | 1,142 | ~271 | 21.1 | ~5.0 |
| ISO-NE | 525 | ~230 | 21.5 | ~9.4 |

### Peak Demand (GW)

System coincident peak from 2024, used to normalize capacity additions and size bubbles:

| ISO | Peak GW | Date | Source |
|-----|---------|------|--------|
| PJM | 152.6 | July 16, 2024 | Amperon; PJM |
| MISO | 121.6 | Aug 26, 2024 | Amperon |
| ERCOT | 85.2 | Aug 20, 2024 | ERCOT (settled value; below 2023 record of 85.5 GW) |
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
| MISO | 28% | 2018–2020 | Brattle/AEU Scorecard (28.3% for 2018–2020 cohort) |
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

**Comparability check — Brattle 2018–2020 vs. LBNL 2000–2019:**

| ISO | LBNL 2000–2019 | Brattle 2018–2020 | Used in chart |
|-----|---------------|-------------------|---------------|
| ERCOT | N/A | 42.6% | 42.6% (Brattle) |
| MISO | ~28% | 28.3% | 28% (Brattle) |
| SPP | 15% | <10% | 15% (LBNL) |
| PJM | 12% | <10% | 12% (LBNL) |
| CAISO | 10% | <10% | 10% (LBNL) |
| NYISO | 10% | <10% | 10% (LBNL) |
| ISO-NE | 8% | <10% | 8% (LBNL) |

The Brattle 2018–2020 data confirms that ERCOT and MISO lead on queue throughput, but the magnitude of the gap with other ISOs depends on which cohort is used. Using LBNL's longer-window rates for non-ERCOT ISOs produces a wider visual gap than a uniform-cohort comparison would.

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
| ERCOT | 164.0 | ~79.5 |
| CAISO | 135.3 | ~84.1 |
| MISO | 58.8 | ~28.8 |
| NYISO | 36.9 | ~12.5 |
| PJM | 26.7 | ~9.3 |
| ISO-NE | 21.5 | ~9.4 |
| SPP | 21.1 | ~5.0 |

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

## Multi-Year Timeline

The chart supports viewing 2023, 2024, and 2025 estimates, controlled by a year toggle. In ISO view, all three years are available (2023, 2024, 2025 est.). In state view, 2023 and 2024 are available. A play/pause button auto-advances through years to animate the temporal story.

### Why multi-year?

The strongest evidence for the thesis is temporal:
- **ERCOT**: $55.50 → $27.33 as capacity nearly doubled (7.8 GW → 14.0 GW)
- **PJM**: $31.08 → $33.74 wholesale, and capacity cost is about to explode (BRA 2025/26 at $269.92/MW-day)
- **MISO**: Capacity cost spiking from ~$2/MWh to ~$9/MWh (PRA 2025/26 at $217.50/MW-day, 10× increase)
- **ISO-NE / NYISO**: Prices rising, additions negligible

### Data source unification

Both 2023 and 2024 capacity data use **EIA-860M January 2026 vintage** as the single source of truth. This ensures consistent methodology across years. Industry sources may report higher figures due to filing lag (see filing-lag caveat in capacity section).

### 2025 estimates (ISO view)

All 7 ISOs have 2025 estimates. No annual SOM reports are published yet (expect May–Aug 2026). Two ISOs have locked-in capacity auction results; the remaining five use EIA STEO monthly data, ISO quarterly reports, and proportional estimates.

**Prices:**

| ISO | Wholesale | All-In | Source |
|-----|-----------|--------|--------|
| ERCOT | $37.57 | $37.57 | EIA STEO monthly (ERCOT North Hub DA, 12-month avg) |
| SPP | $37.91 | $39.00 | EIA STEO monthly (SPP South Hub DA, 12-month avg) |
| MISO | $31.00 | $40.00 | Est. ~$31 wholesale + PRA 2025/26 at $217/MW-day annualized (~$9/MWh, 10× increase) |
| PJM | $34.00 | $52.00 | Est. ~$34 wholesale + BRA 2025/26 at $269.92/MW-day (~$18/MWh, 9× increase) |
| CAISO | $35.00 | $40.00 | CAISO DMM Q1–Q3 quarterly reports (lower than 2024 due to solar oversupply) |
| NYISO | $55.00 | $65.00 | Potomac Economics quarterly + EIA monthly (gas-driven winter spikes) |
| ISO-NE | $55.00 | $65.00 | ISO Newswire monthly (winter spikes $130+/MWh pulled annual average up) |

**Capacity:**

| ISO | MW | Source |
|-----|-----|--------|
| ERCOT | 11,000 | Modo Energy 2025 annual report (5,200 battery + 4,500 solar + wind/gas) |
| MISO | 7,000 | Est. similar to 2024 |
| CAISO | 5,713 | CAISO 2025 Year in Review (includes 4,260 MW battery) |
| PJM | 4,000 | Est. similar to 2024 (queue still clogged) |
| SPP | 1,200 | Est. proportional to 2024 |
| NYISO | 800 | Est. proportional to 2024 |
| ISO-NE | 600 | Est. proportional to 2024 |

All 2025 estimate points are rendered with dashed outlines and reduced opacity to distinguish them from observed data.

### State multi-year data (2023 & 2024)

State-level data supports 2023 and 2024 (no 2025 state data — EIA retail prices for 2025 expected ~Aug 2026, full EIA-860M capacity data ~Jan 2027).

**2023 state data sources:**
- **Capacity additions:** EIA-860M January 2026 vintage, grouped by Plant State field
- **Retail prices:** EIA State Electricity Profiles, 2023 average retail price (all sectors, cents/kWh)
- **Wholesale prices:** Inherited from parent ISO's 2023 wholesale price
- **Peak demand:** Uses 2024 peak demand as proxy (~1–2% YoY variation; state-level coincident peak data for 2023 not separately sourced)
- **Queue completion:** Same cohort-based rates as 2024 (not annual metrics)

## Caveats

1. **Temporal causality**: ERCOT's 2024 price ($27/MWh) is the *result* of the supply response — down from $55/MWh in 2023. The massive 2024 buildout was triggered by 2021–2023 price signals and scarcity events (including Winter Storm Uri). The chart shows a snapshot; the causal chain runs from past prices to current building to future price moderation.

2. **DA/RT price mixing**: The dataset mixes DA averages (ERCOT, SPP, ISO-NE) with RT averages (MISO, PJM) and estimates (CAISO, NYISO). DA prices are typically $1–3/MWh higher, introducing ~$2–3/MWh noise. The relative ordering is robust, but precise price comparisons across ISOs carry this uncertainty. See "Price basis standardization" note above.

3. **CAISO's position**: High capacity additions are driven by state mandates (SB 100) and battery storage policy, not purely market signals. The low queue completion rate reflects speculative queue entries. The "Mandate-driven" annotation flags this.

4. **Queue cohort comparability**: ERCOT uses 2018–2020 cohorts while others use 2000–2019. See the Queue Completion section above for full discussion.

5. **Nameplate vs. effective capacity**: Using nameplate MW overstates variable resources (solar, wind) relative to firm capacity. The ELCC toggle provides estimated effective capacity for comparison.

6. **Gross vs. net capacity**: All capacity figures are gross nameplate additions, not net of retirements. Gross figures overstate net additions, especially for MISO and ISO-NE. Specific 2024 retirements: MISO ~1.8 GW coal (South Oak Creek, Rush Island); ISO-NE 1.4 GW (Mystic CC, June 2024); PJM ~0.2 GW (Warrior Run coal/cogen, June 2024).

7. **ERCOT peak demand**: 85.2 GW (settled data, Aug 20, 2024). The preliminary real-time value of 85.6 GW was revised down. This is slightly below the 2023 record of 85.5 GW — not an all-time record.

8. **PJM demand growth**: Data center demand is growing PJM's peak demand faster than new supply, deflating the MW/GW ratio even as absolute MW increase. This makes PJM appear worse on normalized metrics than raw additions would suggest.

## Counterexamples & Limitations

The "building barriers → high prices" thesis has real explanatory power but is not the whole story. Key counterexamples:

1. **SPP**: Low prices despite low queue completion (15%). SPP benefits from abundant wind resource and cheap fuel (gas, coal). Low queue completion hasn't prevented enough capacity from entering to keep prices low — the resource endowment does heavy lifting.

2. **CAISO**: High building (6,535 MW, 135 MW/GW) despite low queue completion (10%). California's additions are driven by state mandates (SB 100) and utility procurement obligations, not wholesale price signals. This shows that policy can override queue dysfunction as a building driver.

3. **ISO-NE**: High prices substantially driven by winter natural gas spikes and pipeline constraints (plus RGGI carbon costs), not solely building barriers. Even with a functional queue, ISO-NE's prices would remain elevated due to fuel mix exposure. The correlation between low queue completion and high prices is partly spurious here.

4. **ERCOT 2024 price**: The $27/MWh wholesale price may be a transient solar-cannibalization trough — massive solar additions suppressing midday prices — rather than a durable equilibrium. As solar saturation increases, the effective capacity contribution of marginal solar declines.

These cases demonstrate that building barriers are a **key structural factor** but not the sole determinant of electricity prices. Fuel mix, resource endowment, carbon policy, pipeline infrastructure, and regulatory mandates all interact with interconnection dynamics.

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

### Round 2 Corrections

| Finding | Before | After | Rationale |
|---------|--------|-------|-----------|
| ERCOT peak demand | 85.6 GW ("all-time record") | 85.2 GW (settled, below 2023 record) | Preliminary 85.6 revised down; not an all-time record |
| MISO queue completion | 30% | 28% | Brattle/AEU Scorecard reports 28.3% for 2018–2020 cohort |
| Queue source attribution | Mixed LBNL/Brattle | Clarified per-ISO | LBNL reports aggregate national; Brattle reports per-ISO 2018–2020 rates |
| ELCC documentation | Generic factors implied | ISO-specific factors documented | MISO solar 50%, SPP wind per SPP study — data values unchanged |
| Vineyard Wind | Not flagged | Blade failure noted | 136 MW shut down ~6 months in 2024; operational contribution severely limited |
| CAISO solar | 3 GW stated | Undercount flagged | EIA projected ~4.8 GW; 3 GW is conservative pending EIA-860M confirmation |
| Gross/net retirements | Generic mention | Specific plants listed | MISO 1.8 GW, ISO-NE 1.4 GW, PJM 0.6 GW — material for net capacity |
| Thesis framing | "root cause" | "key structural factor" | Acknowledges fuel mix, pipeline, carbon policy as co-factors |
| DA/RT mixing | ~$2–5/MWh uncertainty | ~$2–3/MWh, standardization note added | Tighter estimate; explains why mixing was not resolved |
| Counterexamples | None | Section added | SPP, CAISO, ISO-NE, ERCOT cases where thesis is incomplete |
