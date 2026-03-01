#!/usr/bin/env python3
"""Generate the 5 verified JSON files from audit_all_data.csv.

Usage: python3 data/build_from_csv.py

The CSV is the single source of truth. JSON files are build artifacts.
"""

import csv
import json
import os

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
VERIFIED_DIR = os.path.join(DATA_DIR, "verified")
CSV_PATH = os.path.join(DATA_DIR, "audit_all_data.csv")

# ---------------------------------------------------------------------------
# Metadata templates keyed by (view, year)
# ---------------------------------------------------------------------------

METADATA = {
    ("iso", 2023): {
        "title": "US ISO/RTO Electricity Supply Response Data \u2014 2023",
        "author": "Bottlenecks Lab",
        "primary_year": 2023,
        "notes": (
            "Capacity additions are gross nameplate MW reaching commercial "
            "operation in 2023, sourced from EIA-860M January 2026 vintage. "
            "Prices are 2023 annual averages from ISO market monitor reports. "
            "MISO, CAISO, and NYISO prices are estimates (marked with confidence "
            "field). Queue completion rates are cohort-based (not annual) and "
            "identical to the 2024 dataset."
        ),
    },
    ("iso", 2024): {
        "title": "US ISO/RTO Electricity Supply Response Data",
        "author": "Bottlenecks Lab",
        "primary_year": 2024,
        "notes": (
            "Prices are 2024 annual averages from ISO market monitor reports. "
            "ERCOT, SPP, and ISO-NE are day-ahead averages; MISO and PJM are "
            "real-time load-weighted averages; CAISO and NYISO are estimated "
            "from available reports. DA prices are typically $1\u20133/MWh higher "
            "than RT. Capacity additions are gross nameplate MW reaching "
            "commercial operation in 2024, sourced from EIA-860M January 2026 "
            "vintage (not net of retirements). Industry sources report higher "
            "figures for some ISOs \u2014 see filing-lag notes. Queue completion "
            "rates span 2000\u20132020 entry cohorts from LBNL Queued Up and "
            "Brattle/AEU Scorecard; ERCOT uses a narrower 2018\u20132020 cohort. "
            "Project counts are distinct generators (EIA-860M unit-level) "
            "reaching COD in 2024. All-in prices add capacity market payments "
            "(RPM, FCA, ICAP, RA, PRA) to energy-only wholesale averages."
        ),
    },
    ("iso", 2025): {
        "title": "US ISO/RTO Electricity Supply Response Data \u2014 2025 Estimate",
        "author": "Bottlenecks Lab",
        "primary_year": 2025,
        "notes": (
            "All 7 ISO estimates for 2025. No annual SOM reports published yet "
            "(expect May\u2013Aug 2026). Prices: ERCOT $37.57 and SPP $37.91 from "
            "EIA STEO monthly; CAISO ~$35 from DMM quarterly reports; NYISO and "
            "ISO-NE ~$55 from Potomac Economics/ISO Newswire (winter gas spikes). "
            "PJM BRA 2025/26 at $269.92/MW-day (~$18/MWh adder, 9\u00d7 increase). "
            "MISO PRA at $217/MW-day annualized (~$9/MWh adder, 10\u00d7 increase). "
            "Capacity: ERCOT 11 GW from Modo Energy; CAISO 5.7 GW from Year in "
            "Review; others estimated proportionally to 2024."
        ),
    },
    ("state", 2023): {
        "title": "US State-Level Electricity Supply Response Data \u2014 2023",
        "author": "Bottlenecks Lab",
        "primary_year": 2023,
        "notes": (
            "State-level 2023 data: capacity from EIA-860M Jan 2026 vintage "
            "(operating year 2023), retail prices from EIA State Electricity "
            "Profiles 2023, wholesale prices inherited from parent ISO 2023 "
            "market monitor reports. Peak demand uses 2024 values as proxy "
            "(changes <2% YoY). Queue completion rates are cohort-based "
            "(same as 2024)."
        ),
    },
    ("state", 2024): {
        "title": "US State-Level Electricity Supply Response Data",
        "author": "Bottlenecks Lab",
        "primary_year": 2024,
        "notes": (
            "State-level hybrid view: capacity from EIA-860M plant state, "
            "peak demand from EIA-861, wholesale prices inherited from parent "
            "ISO/RTO. Retail prices from EIA State Electricity Profiles (2024 "
            "avg, all sectors, cents/kWh). Queue completion rates are ISO-level "
            "estimates unless LBNL project-level state data is available. "
            "Multi-ISO states are assigned to their dominant ISO by generation "
            "capacity. See methodology notes for full details."
        ),
    },
}

# ---------------------------------------------------------------------------
# Output file mapping: (view, year) -> (filename, top_key)
# ---------------------------------------------------------------------------

OUTPUT_MAP = {
    ("iso", 2023): ("iso_scatter_data_2023.json", "isos"),
    ("iso", 2024): ("iso_scatter_data.json", "isos"),
    ("iso", 2025): ("iso_scatter_data_2025_est.json", "isos"),
    ("state", 2023): ("state_scatter_data_2023.json", "states"),
    ("state", 2024): ("state_scatter_data.json", "states"),
}


def parse_num(val, as_int=False):
    """Parse a numeric string, returning None for empty."""
    if val is None or val == "":
        return None
    f = float(val)
    if as_int:
        return int(f)
    # Return int if it's a whole number (e.g. 31.0 -> 31)
    if f == int(f) and "." not in val:
        return int(f)
    return f


def build_record(row):
    """Convert a CSV row dict into a JSON record."""
    view = row["view"]
    rec = {}

    rec["id"] = row["id"]
    rec["name"] = row["name"]
    rec["region"] = row["region"]

    rec["wholesale_price_mwh"] = parse_num(row["wholesale_price_mwh"])
    rec["all_in_price_mwh"] = parse_num(row["all_in_price_mwh"])

    # retail_price_cents_kwh: only for state rows
    retail = parse_num(row.get("retail_price_cents_kwh", ""))
    if retail is not None:
        rec["retail_price_cents_kwh"] = retail

    rec["capacity_additions_mw"] = parse_num(row["capacity_additions_mw"], as_int=True)

    elcc = parse_num(row.get("capacity_additions_elcc_mw", ""), as_int=True)
    if elcc is not None:
        rec["capacity_additions_elcc_mw"] = elcc

    rec["project_count"] = parse_num(row["project_count"], as_int=True)
    rec["peak_demand_gw"] = parse_num(row["peak_demand_gw"])
    rec["queue_completion_pct"] = parse_num(row["queue_completion_pct"])
    rec["queue_cohort"] = row["queue_cohort"]

    aqd = parse_num(row.get("avg_queue_duration_months", ""), as_int=True)
    if aqd is not None:
        rec["avg_queue_duration_months"] = aqd

    # price_2023_mwh: only for iso 2024 rows
    p2023 = parse_num(row.get("price_2023_mwh", ""))
    if p2023 is not None:
        rec["price_2023_mwh"] = p2023

    # isEstimate: only for 2025 estimate rows
    is_est = row.get("is_estimate", "False")
    if is_est == "True":
        rec["isEstimate"] = True

    # confidence
    confidence = row.get("confidence", "")
    if confidence:
        rec["confidence"] = confidence

    rec["color_group"] = row["color_group"]

    # qualitative_note
    qn = row.get("qualitative_note", "")
    if qn:
        rec["qualitative_note"] = qn

    # sources
    rec["sources"] = {
        "price": row["source_price"],
        "capacity": row["source_capacity"],
        "peak": row["source_peak"],
        "queue": row["source_queue"],
    }

    return rec


def main():
    # Read CSV
    with open(CSV_PATH, newline="") as f:
        reader = csv.DictReader(f)
        all_rows = list(reader)

    print(f"Read {len(all_rows)} rows from CSV")

    # Group by (view, year)
    groups = {}
    for row in all_rows:
        key = (row["view"], int(row["year"]))
        groups.setdefault(key, []).append(row)

    # Generate each output file
    for (view, year), rows in sorted(groups.items()):
        if (view, year) not in OUTPUT_MAP:
            print(f"  WARNING: No output mapping for ({view}, {year}), skipping")
            continue

        filename, top_key = OUTPUT_MAP[(view, year)]
        meta_template = METADATA[(view, year)]

        # Sort by capacity_additions_mw descending
        rows.sort(key=lambda r: float(r["capacity_additions_mw"] or 0), reverse=True)

        records = [build_record(r) for r in rows]

        metadata = {
            "title": meta_template["title"],
            "author": meta_template["author"],
            "compiled": str(meta_template["primary_year"]),
            "primary_year": meta_template["primary_year"],
            "notes": meta_template["notes"],
        }

        output = {"metadata": metadata, top_key: records}

        out_path = os.path.join(VERIFIED_DIR, filename)
        with open(out_path, "w") as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
            f.write("\n")

        print(f"  {filename}: {len(records)} records")

    print("Done.")


if __name__ == "__main__":
    main()
