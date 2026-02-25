"""
Parser for state-level queue completion rates from LBNL Queued Up data.

Raw file: LBNL Queued Up 2025 public dataset
Download: https://emp.lbl.gov/queues
          → "Download Data" → save to data/raw/

If the LBNL dataset includes project-level records with state identifiers,
we compute state-level completion rates. Otherwise, states inherit their
parent ISO's queue completion rate (handled in build_dataset.py).
"""

from pathlib import Path
from typing import Optional

import pandas as pd


def parse_state_queue_completion(
    filepath: Path,
    cohort_cutoff: int = 2020,
) -> dict[str, float]:
    """Parse LBNL Queued Up data and return state-level queue completion rates.

    Args:
        filepath: Path to the LBNL Queued Up Excel file.
        cohort_cutoff: Only include projects entering queue before this year.

    Returns:
        Dict mapping 2-letter state code to completion rate (0-100%).
        Returns empty dict if state-level data is not available.
    """
    if not filepath.exists():
        raise FileNotFoundError(f"LBNL Queued Up file not found: {filepath}")

    # Try to find project-level data with state column.
    sheet_names_to_try = [
        "Data",
        "Projects",
        "All Projects",
        "Queue Data",
        0,
    ]

    df: Optional[pd.DataFrame] = None
    for sheet in sheet_names_to_try:
        try:
            candidate = pd.read_excel(filepath, sheet_name=sheet, header=0)
            if len(candidate) > 10:
                df = candidate
                break
        except (ValueError, KeyError):
            continue

    if df is None:
        return {}

    # Normalize column names.
    col_map = {}
    for col in df.columns:
        col_lower = str(col).strip().lower()
        if col_lower in ("state", "plant state", "project state"):
            col_map[col] = "state"
        elif col_lower in ("status", "project status", "queue status"):
            col_map[col] = "status"
        elif "year" in col_lower and ("queue" in col_lower or "entry" in col_lower):
            col_map[col] = "entry_year"
        elif col_lower in ("cod", "commercial operation date", "cod date"):
            col_map[col] = "cod"

    df = df.rename(columns=col_map)

    # Must have state and status columns for state-level analysis.
    if "state" not in df.columns or "status" not in df.columns:
        return {}

    df["state"] = df["state"].astype(str).str.strip().str.upper()

    # Filter to mature cohorts.
    if "entry_year" in df.columns:
        df["entry_year"] = pd.to_numeric(df["entry_year"], errors="coerce")
        df = df[df["entry_year"] <= cohort_cutoff]

    # Identify completed projects.
    _COMPLETED_STATUSES = {
        "operational", "op", "completed", "commercial operation",
        "built", "active", "online", "in service",
    }

    def is_completed(row: pd.Series) -> bool:
        status = str(row.get("status", "")).strip().lower()
        if status in _COMPLETED_STATUSES:
            return True
        if "cod" in row.index and pd.notna(row["cod"]):
            return True
        return False

    df["completed"] = df.apply(is_completed, axis=1)

    # Compute completion rate by state.
    results = {}
    for state, group in df.groupby("state"):
        state_str = str(state)
        if len(state_str) != 2:
            continue
        total = len(group)
        if total < 5:  # Skip states with too few projects for meaningful rate
            continue
        completed = group["completed"].sum()
        rate = completed / total * 100
        results[state_str] = round(rate, 1)

    return results
