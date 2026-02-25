import { useState } from "react";
import type { GranularityLevel } from "../lib/types";
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

interface Props {
  granularity: GranularityLevel;
}

export function MethodologyNotes({ granularity }: Props) {
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
          {granularity === "state" && (
            <>
              <h4 style={HEADING_STYLE}>State-level view</h4>
              <ul style={{ listStyle: "disc", paddingLeft: 20, margin: 0 }}>
                <li style={LI_STYLE}>
                  State capacity additions from EIA-860M "Plant State" field — counts all generators
                  reaching commercial operation in 2024, regardless of which ISO the plant's Balancing
                  Authority belongs to.
                </li>
                <li style={LI_STYLE}>
                  State peak demand from EIA-861 Annual Electric Power Industry Report (coincident state peak).
                </li>
                <li style={LI_STYLE}>
                  Y-axis uses EIA average retail electricity prices (2024, all sectors, cents/kWh). Retail
                  prices include generation, transmission, distribution, taxes, and regulatory charges —
                  giving each state an independent value. Wholesale prices (from parent ISO) are shown in
                  the tooltip for reference.
                </li>
                <li style={LI_STYLE}>
                  Queue completion rates are ISO-level estimates unless LBNL project-level data includes
                  state identifiers. States within the same ISO share the same rate.
                </li>
                <li style={LI_STYLE}>
                  Multi-ISO states (IL, IN, MI, KY, MO, AR, LA, ND, SD, MT) are assigned to their
                  dominant ISO by installed generation capacity. Capacity is aggregated across all ISOs
                  within the state.
                </li>
                <li style={LI_STYLE}>
                  ELCC weighting uses state-level technology mix from EIA-860M. Approximate ELCC factors:
                  solar 35%, wind 25%, battery 90%, gas/nuclear ~100%.
                </li>
              </ul>
            </>
          )}

          <h4 style={HEADING_STYLE}>Data sources & comparability</h4>
          <ul style={{ listStyle: "disc", paddingLeft: 20, margin: 0 }}>
            <li style={LI_STYLE}>
              <strong>DA/RT price mixing:</strong> ERCOT, SPP, ISO-NE use day-ahead averages; MISO, PJM
              use real-time load-weighted averages; CAISO, NYISO are estimated. DA prices typically
              run $1–3/MWh higher than RT, introducing ~$2–3/MWh noise. The relative ordering is
              robust despite this, but precise cross-ISO comparisons carry this uncertainty.
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
              All capacity figures are gross nameplate MW additions, not net of retirements. Gross
              figures overstate net additions, especially for MISO and ISO-NE. Material 2024
              retirements: MISO ~1.8 GW coal (South Oak Creek, Rush Island); ISO-NE 1.4 GW
              (Mystic CC, June 2024); PJM ~0.6 GW (Homer City coal).
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
              <strong>Brattle 2018–2020 cohort rates for comparison:</strong> ERCOT 42.6%, MISO 28.3%,
              all others {"<"}10%. The LBNL 2000–2019 rates used for non-ERCOT ISOs (SPP 15%, PJM 12%,
              CAISO 10%, NYISO 10%, ISO-NE 8%) include older projects and differ in methodology.
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
              Building barriers are a <strong>key structural factor</strong> behind persistently high
              electricity prices — alongside fuel mix exposure, pipeline constraints, and carbon
              policy costs.
            </li>
            <li style={LI_STYLE}>
              ERCOT's 2024 price ($27/MWh) is the result of the supply response — down from
              $55/MWh in 2023. The building was triggered by 2021–2023 price signals. This may be
              a transient solar-cannibalization trough, not a durable equilibrium.
            </li>
            <li style={LI_STYLE}>
              CAISO's high capacity additions are driven by state mandates (SB 100), not wholesale
              price signals.
            </li>
            <li style={LI_STYLE}>
              ISO-NE prices substantially reflect winter gas spikes and pipeline constraints (plus
              RGGI costs), not solely building barriers.
            </li>
            <li style={LI_STYLE}>
              PJM's data center demand boom is growing peak demand faster than new supply, deflating
              the MW/GW ratio even as absolute MW increase.
            </li>
            {granularity === "state" && (
              <li style={LI_STYLE}>
                In the state view, vertical spread within ISO bands shows retail price variation
                across states — driven by distribution costs, taxes, and regulatory charges.
                Horizontal variation reveals the impact of state-level permitting, siting, and
                policy on supply response.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
