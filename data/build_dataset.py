"""
Build the iso_scatter_data.json dataset from raw source files.

Usage:
    python -m data.build_dataset

Prerequisites:
    1. Place raw files in data/raw/:
       - EIA wholesale prices Excel  → wholesale_prices.xlsx
       - EIA-860M generator data     → eia860m.xlsx
       - LBNL Queued Up data         → queued_up.xlsx

    2. Set EIA_API_KEY environment variable for peak demand queries:
       export EIA_API_KEY=your_key_here

The script runs each source parser independently. If a raw file is
missing, that source is skipped with a warning — the output will
contain whatever data was available.

Output: data/verified/iso_scatter_data.json
"""

import json
import os
import sys
from datetime import date
from pathlib import Path

# Resolve paths relative to this file's location.
_DATA_DIR = Path(__file__).resolve().parent
_RAW_DIR = _DATA_DIR / "raw"
_VERIFIED_DIR = _DATA_DIR / "verified"
_OUTPUT_FILE = _VERIFIED_DIR / "iso_scatter_data.json"


def main() -> None:
    """Run all source parsers and build the merged dataset."""
    print("=" * 60)
    print("  Electricity Supply Response — Dataset Builder")
    print("=" * 60)
    print()

    # Ensure output directory exists.
    _VERIFIED_DIR.mkdir(parents=True, exist_ok=True)

    # Collect data from each source.
    prices = _collect_wholesale_prices()
    additions_mw, additions_count = _collect_generator_additions()
    peaks = _collect_peak_demand()
    queue_rates = _collect_queue_completion()

    # Merge into the output structure.
    dataset = _build_output(prices, additions_mw, additions_count, peaks, queue_rates)

    # Write output.
    _OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(_OUTPUT_FILE, "w") as f:
        json.dump(dataset, f, indent=2)
    print()
    print(f"  Output written to {_OUTPUT_FILE}")
    print("  Done.")


def _collect_wholesale_prices() -> dict[str, float]:
    """Run the wholesale prices parser."""
    print("[1/4] Wholesale prices...")

    filepath = _RAW_DIR / "wholesale_prices.xlsx"
    if not filepath.exists():
        print(f"  SKIP: {filepath.name} not found in data/raw/")
        return {}

    try:
        from .sources.wholesale_prices import parse_wholesale_prices
        result = parse_wholesale_prices(filepath)
        print(f"  OK: got prices for {len(result)} ISOs — {list(result.keys())}")
        return result
    except Exception as exc:
        print(f"  ERROR: {exc}")
        return {}


def _collect_generator_additions() -> tuple[dict[str, float], dict[str, int]]:
    """Run the generator additions parser. Returns (mw_dict, count_dict)."""
    print("[2/4] Generator additions (EIA-860M)...")

    filepath = _RAW_DIR / "eia860m.xlsx"
    if not filepath.exists():
        print(f"  SKIP: {filepath.name} not found in data/raw/")
        return {}, {}

    try:
        from .sources.generator_additions import parse_generator_additions
        result = parse_generator_additions(filepath, year=2024)
        print(f"  OK: got additions for {len(result.mw_by_iso)} ISOs — {list(result.mw_by_iso.keys())}")
        return result.mw_by_iso, result.count_by_iso
    except Exception as exc:
        print(f"  ERROR: {exc}")
        return {}, {}


def _collect_peak_demand() -> dict[str, float]:
    """Fetch peak demand from the EIA API."""
    print("[3/4] Peak demand (EIA API)...")

    api_key = os.environ.get("EIA_API_KEY", "").strip()
    if not api_key:
        print("  SKIP: EIA_API_KEY environment variable not set")
        print("  Register at https://www.eia.gov/opendata/register.php")
        return {}

    try:
        from .sources.peak_demand import fetch_peak_demand
        result = fetch_peak_demand(api_key, year=2024)
        print(f"  OK: got peak demand for {len(result)} ISOs — {list(result.keys())}")
        return result
    except Exception as exc:
        print(f"  ERROR: {exc}")
        return {}


def _collect_queue_completion() -> dict[str, float]:
    """Run the queue completion parser."""
    print("[4/4] Queue completion rates (LBNL Queued Up)...")

    filepath = _RAW_DIR / "queued_up.xlsx"
    if not filepath.exists():
        print(f"  SKIP: {filepath.name} not found in data/raw/")
        return {}

    try:
        from .sources.queue_completion import parse_queue_completion
        result = parse_queue_completion(filepath)
        print(f"  OK: got completion rates for {len(result)} ISOs — {list(result.keys())}")
        return result
    except Exception as exc:
        print(f"  ERROR: {exc}")
        return {}


def _build_output(
    prices: dict[str, float],
    additions_mw: dict[str, float],
    additions_count: dict[str, int],
    peaks: dict[str, float],
    queue_rates: dict[str, float],
) -> dict:
    """Merge all source data into the iso_scatter_data.json format."""
    from .sources.ba_to_iso_mapping import ISO_LIST

    # ISO metadata for the output file.
    _ISO_META = {
        "ERCOT": {
            "name": "Electric Reliability Council of Texas",
            "region": "Texas",
        },
        "SPP": {
            "name": "Southwest Power Pool",
            "region": "Central US",
        },
        "MISO": {
            "name": "Midcontinent ISO",
            "region": "Central US (15 states)",
        },
        "CAISO": {
            "name": "California ISO",
            "region": "California",
        },
        "PJM": {
            "name": "PJM Interconnection",
            "region": "Mid-Atlantic & Midwest (13 states + DC)",
        },
        "NYISO": {
            "name": "New York ISO",
            "region": "New York",
        },
        "ISO-NE": {
            "name": "ISO New England",
            "region": "New England (6 states)",
        },
    }

    # All-in prices: energy + capacity market payments ($/MWh equivalent).
    # ERCOT has no capacity market; others add RPM/FCA/ICAP/RA/PRA.
    # Note: ISO-NE's published $87/MWh includes RECs, RGGI, ancillary, and
    # transmission — the comparable energy + FCA capacity figure is ~$51.
    # PJM uses 2024/25 BRA at $28.92/MW-day ≈ $2/MWh capacity.
    _ALL_IN_PRICES: dict[str, float] = {
        "ERCOT": 27.33,  # energy-only, no capacity market
        "SPP": 29.00,    # minimal capacity payments
        "MISO": 33.00,   # PRA ~$2/MWh equivalent
        "CAISO": 43.00,  # RA ~$5/MWh equivalent
        "PJM": 36.00,    # RPM BRA 2024/25 at $28.92/MW-day ≈ $2/MWh
        "NYISO": 50.00,  # ICAP ~$8/MWh equivalent
        "ISO-NE": 51.00, # FCA ~$10/MWh capacity (energy + capacity only)
    }

    isos = []
    for iso_id in ISO_LIST:
        meta = _ISO_META.get(iso_id, {})
        entry = {
            "id": iso_id,
            "name": meta.get("name", iso_id),
            "region": meta.get("region", ""),
        }

        # Add each metric if available.
        if iso_id in prices:
            entry["wholesale_price_mwh"] = prices[iso_id]
        if iso_id in _ALL_IN_PRICES:
            entry["all_in_price_mwh"] = _ALL_IN_PRICES[iso_id]
        if iso_id in additions_mw:
            entry["capacity_additions_mw"] = additions_mw[iso_id]
        if iso_id in additions_count:
            entry["project_count"] = additions_count[iso_id]
        if iso_id in peaks:
            entry["peak_demand_gw"] = peaks[iso_id]
        if iso_id in queue_rates:
            entry["queue_completion_pct"] = queue_rates[iso_id]

        isos.append(entry)

    return {
        "metadata": {
            "title": "US ISO/RTO Electricity Supply Response Data",
            "author": "Bottlenecks Lab",
            "compiled": date.today().isoformat(),
            "primary_year": 2024,
            "notes": (
                "Auto-generated by data/build_dataset.py from raw EIA/LBNL files. "
                "See each source module's docstring for download instructions."
            ),
        },
        "isos": isos,
    }


if __name__ == "__main__":
    main()
