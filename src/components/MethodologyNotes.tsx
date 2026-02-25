import { useState } from "react";
import { FONT } from "../lib/theme";

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: FONT.title,
  fontSize: 12,
  fontWeight: 700,
  color: "#555",
  margin: "12px 0 4px",
};

const TEXT_STYLE: React.CSSProperties = {
  fontFamily: FONT.body,
  fontSize: 11,
  color: "#777",
  lineHeight: 1.6,
  margin: "0 0 4px",
};

const LI_STYLE: React.CSSProperties = {
  ...TEXT_STYLE,
  marginLeft: 16,
  paddingLeft: 4,
};

export function MethodologyNotes() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          fontFamily: FONT.title,
          fontSize: 13,
          fontWeight: 600,
          color: "#888",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span style={{ fontSize: 10 }}>{open ? "\u25BE" : "\u25B8"}</span>
        Methodology & Data Notes
      </button>

      {open && (
        <div style={{ maxWidth: 680, marginTop: 8 }}>
          <h4 style={HEADING_STYLE}>Data sources & comparability</h4>
          <ul style={{ listStyle: "disc", paddingLeft: 20, margin: 0 }}>
            <li style={LI_STYLE}>
              Price basis: ERCOT, SPP, ISO-NE use day-ahead averages; MISO, PJM use real-time
              load-weighted averages; CAISO, NYISO are estimated. DA prices typically run $1–3/MWh
              higher than RT.
            </li>
            <li style={LI_STYLE}>
              CAISO's $38/MWh is an estimate from quarterly reports, not a final annual figure.
            </li>
            <li style={LI_STYLE}>
              All-in prices add only capacity auction payments to energy prices. ISO-NE's published
              $87/MWh total wholesale cost (which includes RECs, RGGI, ancillary, transmission) is
              NOT used — the comparable energy + FCA capacity figure (~$51) is shown instead.
            </li>
            <li style={LI_STYLE}>
              PJM's capacity adder uses the 2024/2025 BRA ($28.92/MW-day). The 2025/2026 BRA jumped
              to $269.92/MW-day (~$18/MWh).
            </li>
          </ul>

          <h4 style={HEADING_STYLE}>Capacity measurement</h4>
          <ul style={{ listStyle: "disc", paddingLeft: 20, margin: 0 }}>
            <li style={LI_STYLE}>
              All capacity figures are gross nameplate MW additions, not net of retirements. Notable
              2024 retirements: ~2.5 GW coal in MISO, ~1.8 GW coal in PJM.
            </li>
            <li style={LI_STYLE}>
              Nameplate MW overstates variable resources. 1 MW solar does not equal 1 MW gas for
              reliability. Use the ELCC toggle (capacity view) for effective capacity estimates.
            </li>
          </ul>

          <h4 style={HEADING_STYLE}>Queue completion</h4>
          <ul style={{ listStyle: "disc", paddingLeft: 20, margin: 0 }}>
            <li style={LI_STYLE}>
              ERCOT uses 2018–2020 entry cohort (Brattle/AEU Scorecard). All others use 2000–2019
              (LBNL Queued Up). Narrower recent cohorts naturally show higher completion rates.
            </li>
            <li style={LI_STYLE}>
              ERCOT's isolated grid (no FERC jurisdiction, no multi-state coordination, single-entity
              approval) is a structural advantage for interconnection speed, not just evidence of
              better queue management.
            </li>
          </ul>

          <h4 style={HEADING_STYLE}>Interpreting the scatter</h4>
          <ul style={{ listStyle: "disc", paddingLeft: 20, margin: 0 }}>
            <li style={LI_STYLE}>
              ERCOT's 2024 price ($27/MWh) is the result of the supply response — down from
              $55/MWh in 2023. The building was triggered by 2021–2023 price signals.
            </li>
            <li style={LI_STYLE}>
              CAISO's high capacity additions are driven by state mandates (SB 100), not wholesale
              price signals.
            </li>
            <li style={LI_STYLE}>
              PJM's data center demand boom is growing peak demand faster than new supply, deflating
              the MW/GW ratio even as absolute MW increase.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
