"""
Parser for EIA-860M monthly generator inventory data.

Raw file: EIA-860M (Monthly Update to the Annual Electric Generator Report)
Download: https://www.eia.gov/electricity/data/eia860m/
          → "Current Month" or specific month archive → save to data/raw/

The file is an Excel workbook. The key sheet is typically named
"Operating" or similar. Key columns we use:
  - Balancing Authority Code  (maps to ISO via ba_to_iso_mapping)
  - Operating Year             (year the generator reached commercial operation)
  - Nameplate Capacity (MW)    (generator nameplate rating)
  - Status                     (should be "OP" for operating)

We filter for generators whose operating year matches the target year
to get new capacity additions.
"""

from dataclasses import dataclass
from pathlib import Path

import pandas as pd

from .ba_to_iso_mapping import get_iso_for_ba, ISO_LIST


@dataclass
class GeneratorAdditions:
    """MW totals and project (generator) counts by ISO."""
    mw_by_iso: dict[str, float]
    count_by_iso: dict[str, int]


@dataclass
class StateGeneratorAdditions:
    """MW totals, project counts, and technology mix by state."""
    mw_by_state: dict[str, float]
    count_by_state: dict[str, int]
    tech_mix_by_state: dict[str, dict[str, float]]  # state → {technology: MW}


# Common column name variations across EIA-860M vintages.
# We normalize to a canonical set after reading.
_COL_ALIASES = {
    "balancing authority code": "ba_code",
    "balancing_authority_code": "ba_code",
    "ba code": "ba_code",
    "ba_code": "ba_code",
    "operating year": "operating_year",
    "operating_year": "operating_year",
    "year of initial commercial operation": "operating_year",
    "nameplate capacity (mw)": "capacity_mw",
    "nameplate capacity(mw)": "capacity_mw",
    "nameplate_capacity_mw": "capacity_mw",
    "nameplate capacity": "capacity_mw",
    "summer capacity (mw)": "summer_capacity_mw",
    "status": "status",
    "plant state": "state",
}


def parse_generator_additions(
    filepath: Path,
    year: int = 2024,
) -> GeneratorAdditions:
    """Parse EIA-860M and return new capacity additions by ISO for a given year.

    Args:
        filepath: Path to the EIA-860M Excel file.
        year: Target year to filter for new commercial operations.

    Returns:
        GeneratorAdditions with MW totals and generator counts by ISO.
        Only includes ISOs with nonzero additions.

    Raises:
        FileNotFoundError: If the filepath doesn't exist.
        ValueError: If required columns are missing.
    """
    if not filepath.exists():
        raise FileNotFoundError(f"EIA-860M file not found: {filepath}")

    df = _read_generator_sheet(filepath)
    df = _normalize_columns(df)

    # Validate required columns exist.
    required = {"ba_code", "operating_year", "capacity_mw"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(
            f"Missing required columns after normalization: {missing}. "
            f"Available columns: {list(df.columns)}"
        )

    # Filter for generators that began operating in the target year.
    df["operating_year"] = pd.to_numeric(df["operating_year"], errors="coerce")
    df["capacity_mw"] = pd.to_numeric(df["capacity_mw"], errors="coerce")
    new_gen = df[df["operating_year"] == year].copy()

    # If there's a status column, keep only operating units.
    if "status" in new_gen.columns:
        # EIA uses "OP" for operating, but also accept variations.
        new_gen = new_gen[
            new_gen["status"].astype(str).str.strip().str.upper().isin(
                ["OP", "OA", "OS", "SB"]
            )
        ]

    # Map BA codes to ISOs.
    new_gen["iso"] = new_gen["ba_code"].astype(str).apply(get_iso_for_ba)
    new_gen = new_gen.dropna(subset=["iso", "capacity_mw"])

    # Aggregate MW by ISO.
    mw_result = (
        new_gen.groupby("iso")["capacity_mw"]
        .sum()
        .to_dict()
    )

    # Count distinct generators by ISO.
    count_result = (
        new_gen.groupby("iso")["capacity_mw"]
        .count()
        .to_dict()
    )

    return GeneratorAdditions(
        mw_by_iso={iso: round(mw) for iso, mw in mw_result.items() if mw > 0},
        count_by_iso={iso: int(n) for iso, n in count_result.items() if n > 0},
    )


def _read_generator_sheet(filepath: Path) -> pd.DataFrame:
    """Read the operating generators sheet from the EIA-860M workbook."""
    # Try common sheet name patterns.
    sheet_names_to_try = [
        "Operating",
        "operating",
        "Operable",
        "operable",
        0,  # fall back to first sheet
    ]
    for sheet in sheet_names_to_try:
        try:
            df = pd.read_excel(filepath, sheet_name=sheet, header=0)
            if len(df) > 10:  # sanity check: should have many rows
                return df
        except (ValueError, KeyError):
            continue

    # Last resort: try first sheet with header on row 1 (some files have a
    # title row before the actual header).
    return pd.read_excel(filepath, sheet_name=0, header=1)


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize column names to canonical forms."""
    rename_map = {}
    for col in df.columns:
        col_lower = str(col).strip().lower()
        if col_lower in _COL_ALIASES:
            rename_map[col] = _COL_ALIASES[col_lower]
    return df.rename(columns=rename_map)


# Technology column aliases for ELCC computation.
_TECH_COL_ALIASES = {
    "technology": "technology",
    "prime mover": "technology",
    "energy source": "energy_source",
    "energy source 1": "energy_source",
    "energy_source_1": "energy_source",
}


def parse_generator_additions_by_state(
    filepath: Path,
    year: int = 2024,
) -> StateGeneratorAdditions:
    """Parse EIA-860M and return new capacity additions by state for a given year.

    Uses the 'Plant State' column from EIA-860M to group generators by state.
    Also extracts technology/energy source for ELCC weighting.

    Args:
        filepath: Path to the EIA-860M Excel file.
        year: Target year to filter for new commercial operations.

    Returns:
        StateGeneratorAdditions with MW totals, generator counts, and
        technology mix by state. Only includes states with nonzero additions.

    Raises:
        FileNotFoundError: If the filepath doesn't exist.
        ValueError: If required columns are missing.
    """
    if not filepath.exists():
        raise FileNotFoundError(f"EIA-860M file not found: {filepath}")

    df = _read_generator_sheet(filepath)
    df = _normalize_columns(df)

    # Also normalize technology columns.
    for col in df.columns:
        col_lower = str(col).strip().lower()
        if col_lower in _TECH_COL_ALIASES:
            df = df.rename(columns={col: _TECH_COL_ALIASES[col_lower]})

    # Validate required columns.
    required = {"state", "operating_year", "capacity_mw"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(
            f"Missing required columns after normalization: {missing}. "
            f"Available columns: {list(df.columns)}"
        )

    # Filter for generators that began operating in the target year.
    df["operating_year"] = pd.to_numeric(df["operating_year"], errors="coerce")
    df["capacity_mw"] = pd.to_numeric(df["capacity_mw"], errors="coerce")
    new_gen = df[df["operating_year"] == year].copy()

    # Keep only operating units.
    if "status" in new_gen.columns:
        new_gen = new_gen[
            new_gen["status"].astype(str).str.strip().str.upper().isin(
                ["OP", "OA", "OS", "SB"]
            )
        ]

    # Clean state column.
    new_gen["state"] = new_gen["state"].astype(str).str.strip().str.upper()
    new_gen = new_gen.dropna(subset=["state", "capacity_mw"])
    new_gen = new_gen[new_gen["state"].str.len() == 2]  # Valid 2-letter codes

    # Aggregate MW by state.
    mw_result = new_gen.groupby("state")["capacity_mw"].sum().to_dict()
    count_result = new_gen.groupby("state")["capacity_mw"].count().to_dict()

    # Technology mix by state (for ELCC computation).
    tech_col = "technology" if "technology" in new_gen.columns else "energy_source"
    tech_mix: dict[str, dict[str, float]] = {}
    if tech_col in new_gen.columns:
        for state, group in new_gen.groupby("state"):
            state_str = str(state)
            mix = group.groupby(tech_col)["capacity_mw"].sum().to_dict()
            tech_mix[state_str] = {str(k): round(v) for k, v in mix.items() if v > 0}

    return StateGeneratorAdditions(
        mw_by_state={s: round(mw) for s, mw in mw_result.items() if mw > 0},
        count_by_state={s: int(n) for s, n in count_result.items() if n > 0},
        tech_mix_by_state=tech_mix,
    )
