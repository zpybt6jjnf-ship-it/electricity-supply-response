"""
Mapping of US state codes to their primary ISO/RTO.

For the state-level disaggregation view, each state is assigned to its
dominant ISO based on the share of installed generation capacity within
that ISO's footprint. States spanning multiple ISOs (e.g., Indiana spans
both MISO and PJM) are assigned to the ISO with the largest capacity share.

Multi-ISO states are flagged so the frontend can display a caveat marker.
"""

# Two-letter state code → primary ISO/RTO.
# Assignment based on dominant share of generation capacity.
STATE_TO_ISO: dict[str, str] = {
    # ERCOT — essentially single-state
    "TX": "ERCOT",
    # SPP
    "OK": "SPP",
    "KS": "SPP",
    "NE": "SPP",
    "NM": "SPP",       # SPP-dominant portion
    # MISO
    "MN": "MISO",
    "WI": "MISO",
    "IA": "MISO",
    "IL": "MISO",      # Split: MISO (Ameren) + PJM (ComEd) — MISO dominant by MW
    "IN": "MISO",      # Split: MISO (NIPS, IPL) + PJM (AEP) — roughly even, MISO edge
    "MI": "MISO",      # Split: MISO dominant, small PJM zone
    "MO": "MISO",      # Split: MISO (Ameren MO) + SPP — MISO dominant
    "AR": "MISO",      # Split: MISO (Entergy) + SPP — MISO dominant
    "LA": "MISO",      # Split: MISO (Entergy) + SPP — MISO dominant
    "MS": "MISO",
    "ND": "MISO",      # Split: MISO + SPP — MISO dominant
    "SD": "MISO",      # Split: MISO + SPP — roughly even
    "MT": "MISO",      # MISO portion (NorthWestern Energy)
    "KY": "MISO",      # Split: PJM (EKPC, DEOK) + MISO (LG&E) — roughly even, MISO edge
    # CAISO — single state
    "CA": "CAISO",
    # PJM
    "PA": "PJM",
    "NJ": "PJM",
    "DE": "PJM",
    "MD": "PJM",
    "VA": "PJM",
    "WV": "PJM",
    "OH": "PJM",
    "NC": "PJM",       # Small PJM footprint (Duke Carolinas)
    # NYISO — single state
    "NY": "NYISO",
    # ISO-NE
    "CT": "ISO-NE",
    "MA": "ISO-NE",
    "ME": "ISO-NE",
    "NH": "ISO-NE",
    "RI": "ISO-NE",
    "VT": "ISO-NE",
}

# States that span multiple ISOs. Capacity is aggregated across all ISOs
# within the state, but the wholesale price is inherited from the primary ISO.
MULTI_ISO_STATES: set[str] = {
    "IL",   # MISO (Ameren IL) + PJM (ComEd)
    "IN",   # MISO (NIPS, IPL) + PJM (AEP Indiana)
    "MI",   # MISO (most of state) + PJM (small eastern zone)
    "MO",   # MISO (Ameren MO) + SPP
    "AR",   # MISO (Entergy) + SPP
    "LA",   # MISO (Entergy) + SPP
    "KY",   # MISO (LG&E) + PJM (EKPC, DEOK)
    "ND",   # MISO + SPP
    "SD",   # MISO + SPP
    "MT",   # MISO + non-ISO (NorthWestern, BPA)
    "NC",   # PJM (small) + non-ISO (Duke Carolinas)
    "NM",   # SPP + non-ISO (PNM/El Paso Electric)
}

# Full state names for display.
STATE_NAMES: dict[str, str] = {
    "TX": "Texas", "OK": "Oklahoma", "KS": "Kansas", "NE": "Nebraska",
    "NM": "New Mexico", "MN": "Minnesota", "WI": "Wisconsin", "IA": "Iowa",
    "IL": "Illinois", "IN": "Indiana", "MI": "Michigan", "MO": "Missouri",
    "AR": "Arkansas", "LA": "Louisiana", "MS": "Mississippi", "ND": "North Dakota",
    "SD": "South Dakota", "MT": "Montana", "KY": "Kentucky", "CA": "California",
    "PA": "Pennsylvania", "NJ": "New Jersey", "DE": "Delaware", "MD": "Maryland",
    "VA": "Virginia", "WV": "West Virginia", "OH": "Ohio", "NC": "North Carolina",
    "NY": "New York", "CT": "Connecticut", "MA": "Massachusetts", "ME": "Maine",
    "NH": "New Hampshire", "RI": "Rhode Island", "VT": "Vermont",
}


def get_iso_for_state(state_code: str) -> str | None:
    """Return the primary ISO/RTO for a given US state code.

    Args:
        state_code: Two-letter US state abbreviation (e.g., "TX", "CA").

    Returns:
        ISO name string (e.g., "ERCOT", "CAISO") or None if the state
        is not within a tracked ISO/RTO footprint.
    """
    return STATE_TO_ISO.get(state_code.strip().upper())


def is_multi_iso_state(state_code: str) -> bool:
    """Return True if the state spans multiple ISOs."""
    return state_code.strip().upper() in MULTI_ISO_STATES
