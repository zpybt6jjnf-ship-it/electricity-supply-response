"""
Parser for state-level peak demand from EIA-861 Annual Electric Power Industry Report.

Raw file: EIA-861 (Annual Electric Power Industry Report)
Download: https://www.eia.gov/electricity/data/eia861/
          → "Zip file" → extract → use the "Sales_Ult_Cust_*.xlsx" or
          "Demand_*.xlsx" tab for state-level data.

Alternative: EIA API v2 state-level electricity endpoint.

We extract state-level coincident peak demand for normalizing capacity
additions (MW per GW of state peak).
"""

from pathlib import Path
from typing import Optional

import pandas as pd


def parse_state_peak_demand(
    filepath: Path,
) -> dict[str, float]:
    """Parse EIA-861 data and return state-level peak demand in GW.

    Args:
        filepath: Path to the EIA-861 Excel file (Demand side).

    Returns:
        Dict mapping 2-letter state code to peak demand in GW.

    Raises:
        FileNotFoundError: If the filepath doesn't exist.
    """
    if not filepath.exists():
        raise FileNotFoundError(f"EIA-861 file not found: {filepath}")

    # Try common sheet names.
    sheet_names_to_try = [
        "Demand",
        "demand",
        "State",
        "state",
        "Peak_Demand",
        0,
    ]

    df: Optional[pd.DataFrame] = None
    for sheet in sheet_names_to_try:
        try:
            candidate = pd.read_excel(filepath, sheet_name=sheet, header=0)
            if len(candidate) > 5:
                df = candidate
                break
        except (ValueError, KeyError):
            continue

    if df is None:
        df = pd.read_excel(filepath, sheet_name=0, header=1)

    # Normalize column names.
    col_map = {}
    for col in df.columns:
        col_lower = str(col).strip().lower()
        if "state" in col_lower:
            col_map[col] = "state"
        elif "peak" in col_lower and "demand" in col_lower:
            col_map[col] = "peak_demand_mw"
        elif "coincident" in col_lower and "peak" in col_lower:
            col_map[col] = "peak_demand_mw"

    df = df.rename(columns=col_map)

    if "state" not in df.columns or "peak_demand_mw" not in df.columns:
        raise ValueError(
            f"Could not find state and peak demand columns. "
            f"Available: {list(df.columns)}"
        )

    df["state"] = df["state"].astype(str).str.strip().str.upper()
    df["peak_demand_mw"] = pd.to_numeric(df["peak_demand_mw"], errors="coerce")

    # Aggregate by state (may have multiple utility entries per state).
    state_peaks = df.groupby("state")["peak_demand_mw"].sum()

    # Convert MW to GW.
    return {
        state: round(mw / 1000, 1)
        for state, mw in state_peaks.items()
        if mw > 0 and len(str(state)) == 2
    }
