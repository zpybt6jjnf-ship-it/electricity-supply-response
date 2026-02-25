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
_STATE_OUTPUT_FILE = _VERIFIED_DIR / "state_scatter_data.json"


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

    # Collect state-level data.
    state_additions_mw, state_additions_count, state_tech_mix = (
        _collect_state_generator_additions()
    )
    state_peaks = _collect_state_peak_demand()
    state_queue_rates = _collect_state_queue_completion()

    # Merge into the output structures.
    dataset = _build_output(prices, additions_mw, additions_count, peaks, queue_rates)

    # Write ISO output.
    _OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(_OUTPUT_FILE, "w") as f:
        json.dump(dataset, f, indent=2)
    print()
    print(f"  Output written to {_OUTPUT_FILE}")

    # Build and write state output.
    state_dataset = _build_state_output(
        prices, queue_rates,
        state_additions_mw, state_additions_count, state_tech_mix,
        state_peaks, state_queue_rates,
    )
    with open(_STATE_OUTPUT_FILE, "w") as f:
        json.dump(state_dataset, f, indent=2)
    print(f"  Output written to {_STATE_OUTPUT_FILE}")
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


def _collect_state_generator_additions(
) -> tuple[dict[str, float], dict[str, int], dict[str, dict[str, float]]]:
    """Run the generator additions parser at state level."""
    print("[5/7] State generator additions (EIA-860M)...")

    filepath = _RAW_DIR / "eia860m.xlsx"
    if not filepath.exists():
        print(f"  SKIP: {filepath.name} not found in data/raw/")
        return {}, {}, {}

    try:
        from .sources.generator_additions import parse_generator_additions_by_state
        result = parse_generator_additions_by_state(filepath, year=2024)
        print(
            f"  OK: got additions for {len(result.mw_by_state)} states — "
            f"{list(result.mw_by_state.keys())[:10]}..."
        )
        return result.mw_by_state, result.count_by_state, result.tech_mix_by_state
    except Exception as exc:
        print(f"  ERROR: {exc}")
        return {}, {}, {}


def _collect_state_peak_demand() -> dict[str, float]:
    """Run the state peak demand parser."""
    print("[6/7] State peak demand (EIA-861)...")

    filepath = _RAW_DIR / "eia861.xlsx"
    if not filepath.exists():
        print(f"  SKIP: {filepath.name} not found in data/raw/")
        return {}

    try:
        from .sources.state_peak_demand import parse_state_peak_demand
        result = parse_state_peak_demand(filepath)
        print(f"  OK: got peak demand for {len(result)} states")
        return result
    except Exception as exc:
        print(f"  ERROR: {exc}")
        return {}


def _collect_state_queue_completion() -> dict[str, float]:
    """Run the state queue completion parser."""
    print("[7/7] State queue completion (LBNL Queued Up)...")

    filepath = _RAW_DIR / "queued_up.xlsx"
    if not filepath.exists():
        print(f"  SKIP: {filepath.name} not found in data/raw/")
        return {}

    try:
        from .sources.state_queue_completion import parse_state_queue_completion
        result = parse_state_queue_completion(filepath)
        if result:
            print(f"  OK: got completion rates for {len(result)} states")
        else:
            print("  INFO: LBNL data does not include state-level records; "
                  "states will inherit ISO rates")
        return result
    except Exception as exc:
        print(f"  ERROR: {exc}")
        return {}


def _build_state_output(
    iso_prices: dict[str, float],
    iso_queue_rates: dict[str, float],
    state_mw: dict[str, float],
    state_counts: dict[str, int],
    state_tech_mix: dict[str, dict[str, float]],
    state_peaks: dict[str, float],
    state_queue_rates: dict[str, float],
) -> dict:
    """Build state_scatter_data.json from state-level and ISO-level data.

    States inherit wholesale price and queue completion from their parent ISO
    (Option B hybrid approach). Capacity and peak demand are state-level.
    """
    from .sources.state_to_iso_mapping import (
        STATE_TO_ISO, MULTI_ISO_STATES, STATE_NAMES,
    )

    # All-in prices by ISO (same as in _build_output).
    _ALL_IN_PRICES: dict[str, float] = {
        "ERCOT": 27.33, "SPP": 29.00, "MISO": 33.00,
        "CAISO": 43.00, "PJM": 36.00, "NYISO": 50.00, "ISO-NE": 51.00,
    }

    # ELCC factors by technology (approximate).
    _ELCC_FACTORS: dict[str, float] = {
        "solar": 0.35, "wind": 0.25, "battery": 0.90,
        "gas": 1.0, "natural gas": 1.0, "nuclear": 0.95,
        "hydro": 0.50, "other": 0.50,
    }

    states = []
    for state_code, iso in STATE_TO_ISO.items():
        # Skip states without capacity additions.
        if state_code not in state_mw:
            continue

        mw = state_mw[state_code]
        if mw < 50:  # Minimum threshold for meaningful data point
            continue

        # Peak demand: use state data or skip.
        peak = state_peaks.get(state_code)
        if peak is None or peak < 0.5:
            continue

        # Compute ELCC from technology mix if available.
        elcc_mw = None
        tech_mix = state_tech_mix.get(state_code, {})
        if tech_mix:
            elcc_mw = sum(
                mw_val * _ELCC_FACTORS.get(tech.lower(), 0.5)
                for tech, mw_val in tech_mix.items()
            )
            elcc_mw = round(elcc_mw)

        # Inherit price from parent ISO.
        wholesale_price = iso_prices.get(iso)
        all_in_price = _ALL_IN_PRICES.get(iso)
        if wholesale_price is None or all_in_price is None:
            continue

        # Queue completion: state-level if available, else ISO fallback.
        queue_pct = state_queue_rates.get(state_code)
        queue_inherited = queue_pct is None
        if queue_inherited:
            queue_pct = iso_queue_rates.get(iso, 0)

        entry = {
            "id": state_code,
            "name": STATE_NAMES.get(state_code, state_code),
            "region": iso,
            "wholesale_price_mwh": wholesale_price,
            "all_in_price_mwh": all_in_price,
            "capacity_additions_mw": round(mw),
            "project_count": state_counts.get(state_code, 0),
            "peak_demand_gw": peak,
            "queue_completion_pct": queue_pct,
            "color_group": _iso_to_color_group(iso),
        }

        if elcc_mw is not None:
            entry["capacity_additions_elcc_mw"] = elcc_mw
        if state_code in MULTI_ISO_STATES:
            entry["qualitative_note"] = (
                f"Spans multiple ISOs. Price from dominant ISO ({iso})."
            )
        else:
            entry["qualitative_note"] = ""
        if queue_inherited:
            entry["queue_cohort"] = f"ISO-level ({iso})"
        entry["sources"] = {
            "price": f"Inherited from {iso} wholesale market",
            "capacity": "EIA-860M plant state",
            "peak": "EIA-861 state peak demand",
            "queue": (
                "LBNL Queued Up (state-level)" if not queue_inherited
                else f"Inherited from {iso} (ISO-level)"
            ),
        }

        states.append(entry)

    return {
        "metadata": {
            "title": "US State-Level Electricity Supply Response Data",
            "author": "Bottlenecks Lab",
            "compiled": date.today().isoformat(),
            "primary_year": 2024,
            "notes": (
                "State-level hybrid view: capacity from EIA-860M plant state, "
                "peak demand from EIA-861, wholesale prices inherited from "
                "parent ISO/RTO. See methodology notes for details."
            ),
        },
        "states": states,
    }


def _iso_to_color_group(iso: str) -> str:
    """Map ISO to color group for state-level entries."""
    _COLOR_MAP = {
        "ERCOT": "functional",
        "MISO": "functional",
        "SPP": "intermediate",
        "CAISO": "intermediate",
        "PJM": "intermediate",
        "NYISO": "broken",
        "ISO-NE": "broken",
    }
    return _COLOR_MAP.get(iso, "intermediate")


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
