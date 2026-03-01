# Data Sources

Authoritative source reference for reproducing `data/audit_all_data.csv` from scratch. This project tracks electricity market performance across 7 US ISOs/RTOs and 35 states within their footprints. Data is updated once a year, typically in Q1–Q2 after annual market reports are published.

## Annual Refresh Checklist

### Step 1: Capacity Additions (EIA-860M)

**Source:** EIA Form 860M — Monthly Generator Inventory
**URL:** https://www.eia.gov/electricity/data/eia860m/
**Download:** "Current Month" Excel file (e.g., `january_generator2026.xlsx`)
**Save to:** `data/eia860m/`

**ISO-level extraction:**
1. Open the "Operating" sheet
2. Filter: Operating Year = target year
3. Group by Balancing Authority Code using the BA → ISO mapping (below)
4. Sum Nameplate Capacity (MW) for `capacity_additions_mw`
5. Apply ELCC factors by technology (below) for `capacity_additions_elcc_mw`
6. Count distinct Generator IDs for `project_count`

**State-level extraction:**
1. Same sheet, filter Operating Year = target year
2. Group by Plant State (2-letter code)
3. Same MW / ELCC / count logic

**CSV columns updated:** `capacity_additions_mw`, `capacity_additions_elcc_mw`, `project_count`
**Source citation format:** `EIA-860M [month] [year] vintage (solar X / battery Y / wind Z / gas W MW)`

---

### Step 2: Peak Demand

**ISO-level — two options (prefer whichever is available first):**

Option A: EIA API v2
- Endpoint: `/electricity/rto/region-data/`
- Query: filter by respondent (ISO code), data type = demand, frequency = hourly
- Extract: maximum hourly demand value for the target year
- API docs: https://www.eia.gov/opendata/

Option B: ISO annual reports
- Each ISO publishes its own peak demand figure in its State of the Market report or operational data
- Use the settled/official value when available (e.g., ERCOT publishes settled peak separately)
- Third-party sources (Amperon, FEL Power) are acceptable when ISO data is delayed

**State-level:**
- **Source:** EIA-861 State Electricity Profiles
- **URL:** https://www.eia.gov/electricity/data/state/
- **Download:** "Peak Demand" table
- **Extract:** State-level peak demand in MW, convert to GW

**CSV column updated:** `peak_demand_gw`
**Source citation format:** `[Source name] ([date of peak])` or `EIA-861 state peak demand`

---

### Step 3: Queue Completion Rates (LBNL Queued Up)

**Primary source:** LBNL "Queued Up" annual report
**URL:** https://emp.lbl.gov/queues/
**Download:** "Download Data" Excel file

**Methodology:**
- Completion rate = projects reaching Commercial Operation Date / total projects entering the queue
- LBNL uses entry cohorts spanning 2000–2019 (or 2000–2020 in newer editions)
- This is a long-horizon metric — it captures structural queue attrition, not recent trends

**ERCOT and MISO override:**
- Use Brattle Group / Grid Strategies / AEU "Generator Interconnection Scorecard"
- These use a narrower 2018–2020 entry cohort with different methodology
- ERCOT: 42.6% (Brattle), MISO: 28.3% (Brattle)
- The narrower cohort better reflects recent reform efforts in these ISOs

**State-level:** Inherited from the parent ISO (no state-specific queue data exists).

**CSV column updated:** `queue_completion_pct`, `queue_cohort`
**Source citation format:** `LBNL Queued Up (2000–2019 cohort)` or `Brattle/Grid Strategies/AEU Scorecard (2018–2020 cohort, XX%)`

---

### Step 4: Wholesale Prices (ISO Market Monitors)

Each ISO has a FERC-appointed Independent Market Monitor (IMM) that publishes an annual State of the Market (SOM) report. These are the authoritative source for wholesale electricity prices.

**Reports typically publish Q1–Q2 of the following year** (e.g., 2024 data available mid-2025).

| ISO | Market Monitor | Report Name | Price Metric | Hub/Basis |
|-----|---------------|-------------|-------------|-----------|
| ERCOT | Potomac Economics | ERCOT Market Update (published by E3) | DA average | ERCOT North Hub |
| SPP | Potomac Economics | SPP Annual State of the Market Report | DA system average | System-wide |
| MISO | Potomac Economics | MISO State of the Market Report | RT average LMP | Indiana Hub |
| CAISO | Department of Market Monitoring (DMM) | CAISO Quarterly/Annual Report | DA average | SP-15 |
| PJM | Monitoring Analytics | PJM State of the Market Report | RT load-weighted average LMP | PJM West |
| NYISO | Potomac Economics (or NYISO white papers) | NYISO State of the Market Report | DA average | System-wide |
| ISO-NE | Internal Market Monitor (IMM) | ISO-NE Annual Markets Report | DA average | Mass Hub |

**State-level:** Inherited from the dominant ISO (see State → ISO mapping below). States spanning multiple ISOs use the dominant ISO's price.

**CSV column updated:** `wholesale_price_mwh`
**Source citation format:** `[Monitor] [year] [ISO] [Report] ([price metric])`

---

### Step 5: All-In Prices (Wholesale + Capacity Adder)

All-in price = wholesale energy price + capacity market payment (converted to $/MWh equivalent).

| ISO | Capacity Mechanism | Auction/Program Name | Where to Find Clearing Price |
|-----|-------------------|---------------------|------------------------------|
| ERCOT | Energy-only (no capacity market) | N/A | all_in = wholesale |
| SPP | Minimal bilateral capacity | N/A | Small adder (~$1–2/MWh), estimate from SOM |
| MISO | Planning Resource Auction (PRA) | MISO PRA | MISO PRA results posting ($/MW-day → $/MWh) |
| CAISO | Resource Adequacy (RA) | CPUC RA Program | CPUC RA reports (~$5/MWh equivalent) |
| PJM | Reliability Pricing Model (RPM) | RPM Base Residual Auction | PJM RPM auction results ($/MW-day → $/MWh) |
| NYISO | Installed Capacity (ICAP) | ICAP Monthly/Spot Auction | NYISO ICAP reports (~$8/MWh equivalent) |
| ISO-NE | Forward Capacity Auction (FCA) | FCA Results | ISO-NE FCA results (~$10/MWh equivalent) |

**Conversion:** Capacity prices quoted as $/MW-day are converted: `$/MW-day × 365 / (8760 × capacity_factor) ≈ $/MWh`

**State-level:** Inherited from parent ISO.

**CSV column updated:** `all_in_price_mwh`

---

### Step 6: Retail Prices (EIA-861, State Rows Only)

**Source:** EIA State Electricity Profiles
**URL:** https://www.eia.gov/electricity/data/state/
**Table:** "Average Retail Price of Electricity" → All Sectors → cents/kWh

Only populated for state-view rows. ISO-view rows leave this blank.

**CSV column updated:** `retail_price_cents_kwh`

---

## Reference Tables

### BA Code → ISO Mapping

Source: EIA-930 Balancing Authority list (https://www.eia.gov/electricity/gridmonitor/about)

| BA Code | ISO | Utility |
|---------|-----|---------|
| **ERCOT** | | |
| ERCO | ERCOT | ERCOT |
| **SPP** | | |
| SWPP | SPP | Southwest Power Pool |
| **MISO** | | |
| MISO | MISO | MISO |
| EEI | MISO | Entergy (MISO South) |
| LGEE | MISO | LG&E and KU |
| ALTW | MISO | Alliant West |
| AMIL | MISO | Ameren Illinois |
| AMMO | MISO | Ameren Missouri |
| CONS | MISO | Consumers Energy |
| CWEP | MISO | Commonwealth Edison |
| DECO | MISO | DTE Energy |
| GRE | MISO | Great River Energy |
| MDU | MISO | Montana-Dakota Utilities |
| MEC | MISO | MidAmerican Energy |
| MIUP | MISO | MISO Upper Peninsula |
| MP | MISO | Minnesota Power |
| NSB | MISO | Northern States Power |
| OTP | MISO | Otter Tail Power |
| SMP | MISO | Southern MN Municipal Power Agency |
| WEC | MISO | Wisconsin Electric Power |
| WPS | MISO | Wisconsin Public Service |
| NIPS | MISO | Northern Indiana Public Service |
| IPL | MISO | Indianapolis Power & Light |
| SIPC | MISO | Southern Illinois Power Cooperative |
| CWLP | MISO | City Water Light & Power (Springfield IL) |
| **CAISO** | | |
| CISO | CAISO | California ISO |
| **PJM** | | |
| PJM | PJM | PJM Interconnection |
| AEP | PJM | American Electric Power |
| AP | PJM | Allegheny Power |
| ATSI | PJM | American Transmission Systems (FirstEnergy) |
| CE | PJM | Commonwealth Edison |
| DAY | PJM | Dayton Power & Light |
| DEOK | PJM | Duke Energy Ohio/Kentucky |
| DOM | PJM | Dominion Virginia |
| DPL | PJM | Delmarva Power & Light |
| DUK | PJM | Duke Energy Carolinas (PJM portion) |
| EKPC | PJM | East Kentucky Power Cooperative |
| JC | PJM | Jersey Central Power & Light |
| ME | PJM | Metropolitan Edison |
| OVEC | PJM | Ohio Valley Electric Corp |
| PE | PJM | PECO Energy |
| PEP | PJM | Potomac Electric Power |
| PL | PJM | PPL Electric Utilities |
| PN | PJM | Pennsylvania Electric (Penelec) |
| PS | PJM | Public Service Electric & Gas |
| RECO | PJM | Rockland Electric |
| **NYISO** | | |
| NYIS | NYISO | New York ISO |
| **ISO-NE** | | |
| ISNE | ISO-NE | ISO New England |

---

### State → ISO Mapping

35 states fall within organized ISO/RTO footprints. The remaining 15 (AK, AL, AZ, CO, FL, GA, HI, ID, NV, OR, SC, TN, UT, WA, WY) are excluded from both views.

| State | ISO | Notes |
|-------|-----|-------|
| TX | ERCOT | |
| OK | SPP | |
| KS | SPP | |
| NE | SPP | |
| NM | SPP | Also partly non-ISO (PNM/El Paso Electric) |
| MN | MISO | |
| WI | MISO | |
| IA | MISO | |
| IL | MISO | Split: Ameren IL (MISO) + ComEd (PJM) |
| IN | MISO | Split: NIPS/IPL (MISO) + AEP Indiana (PJM) |
| MI | MISO | Mostly MISO, small PJM zone |
| MO | MISO | Split: Ameren MO (MISO) + SPP |
| AR | MISO | Split: Entergy (MISO) + SPP |
| LA | MISO | Split: Entergy (MISO) + SPP |
| MS | MISO | |
| ND | MISO | Split: MISO + SPP |
| SD | MISO | Split: MISO + SPP |
| MT | MISO | Split: MISO + non-ISO (NorthWestern, BPA) |
| KY | MISO | Split: LG&E (MISO) + EKPC/DEOK (PJM) |
| CA | CAISO | |
| PA | PJM | |
| NJ | PJM | |
| DE | PJM | |
| MD | PJM | |
| VA | PJM | |
| WV | PJM | |
| OH | PJM | |
| NC | PJM | Small PJM footprint; mostly non-ISO (Duke Carolinas) |
| NY | NYISO | |
| CT | ISO-NE | |
| MA | ISO-NE | |
| ME | ISO-NE | |
| NH | ISO-NE | |
| RI | ISO-NE | |
| VT | ISO-NE | |

For split states, prices and queue completion rates are inherited from the **dominant** ISO.

---

### ELCC Factors by Technology

Applied to nameplate MW to estimate effective (firm) capacity contribution.

| Technology | Generic ELCC | Notes |
|-----------|-------------|-------|
| Natural gas | 95–100% | High availability, near-firm |
| Nuclear | 95% | |
| Battery (4-hr) | 85–90% | Derated for events exceeding 4 hours |
| Hydro | 50% | Variable by region and season |
| Solar | 30–35% | Peak contribution limited to daytime hours |
| Onshore wind | 15–25% | Low correlation with summer peak |
| Offshore wind | 35–40% | Higher CF than onshore |

**ISO-specific overrides (use these when available):**

| ISO | Technology | Override | Source |
|-----|-----------|---------|--------|
| MISO | Solar | 50% | MISO PRA rules / Capacity Credit Report |
| SPP | Wind | ~22.5% (20–25%) | SPP ELCC Report |
| SPP | Battery | ~90% | SPP ELCC Report |
| CAISO | Solar | ~30% (saturation effects) | CAISO accreditation |
| CAISO | Battery | 85–90% (4-hr) | CAISO accreditation |
| ERCOT | Solar | ~30% | Near generic |
| ERCOT | Battery | ~85% | Near generic |
| ERCOT | Gas | 95% | Near generic |

---

### ISO → Market Monitor Quick Reference

| ISO | Market Monitor | Key Annual Report |
|-----|---------------|-------------------|
| ERCOT | Potomac Economics (via E3) | ERCOT Market Update |
| SPP | Potomac Economics | SPP Annual State of the Market |
| MISO | Potomac Economics | MISO State of the Market |
| CAISO | DMM (internal) | CAISO Annual/Quarterly Report |
| PJM | Monitoring Analytics | PJM State of the Market |
| NYISO | Potomac Economics | NYISO State of the Market |
| ISO-NE | IMM (internal) | ISO-NE Annual Markets Report |

All SOM reports are filed with FERC and publicly available. Typical publication: Q1–Q2 of the year following the reporting period.

---

### Color Group Classification

Used for the scatter plot visualization. Groups reflect how well the market is functioning at translating price signals into new supply.

| Group | ISOs | Criteria |
|-------|------|----------|
| Functional | ERCOT, MISO | High capacity additions relative to demand, efficient queue processing |
| Intermediate | SPP, CAISO, PJM | Moderate additions, some queue or pricing friction |
| Broken | NYISO, ISO-NE | Low additions despite high prices, severe queue/siting barriers |

State-level: inherited from parent ISO.
