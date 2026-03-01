import { useState } from "react";
import type { GranularityLevel } from "../lib/types";
import { FONT, COLOR } from "../lib/theme";

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: FONT.title,
  fontSize: 12,
  fontWeight: 700,
  color: COLOR.text.tertiary,
  margin: "12px 0 4px",
};

const TEXT_STYLE: React.CSSProperties = {
  fontFamily: FONT.body,
  fontSize: 11,
  color: COLOR.text.muted,
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
  compact?: boolean;
}

export function MethodologyNotes({ granularity, compact }: Props) {
  const [open, setOpen] = useState(false);

  const bodyFontSize = compact ? 12 : 11;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          fontFamily: FONT.body,
          fontSize: 11,
          fontWeight: 500,
          color: COLOR.text.secondary,
          display: "flex",
          alignItems: "center",
          gap: 6,
          transition: "color 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = COLOR.text.primary)}
        onMouseLeave={(e) => (e.currentTarget.style.color = COLOR.text.secondary)}
      >
        <span style={{ fontSize: 9, color: COLOR.text.muted, width: 8, textAlign: "center" }}>{open ? "▼" : "▶"}</span>
        Methodology & Data Notes
      </button>

      {open && (
        <div style={{ maxWidth: "65ch", marginTop: 8, marginBottom: 12, fontSize: bodyFontSize }}>
          {granularity === "state" && (
            <>
              <h4 style={HEADING_STYLE}>State-level view</h4>
              <ul style={{ listStyle: "disc", paddingLeft: 20, margin: 0 }}>
                <li style={LI_STYLE}>
                  State capacity additions from EIA-860M "Plant State" field — counts all generators
                  reaching commercial operation in the selected year, regardless of which ISO the plant's
                  Balancing Authority belongs to. Data available for 2023, 2024, and 2025 (estimated).
                </li>
                <li style={LI_STYLE}>
                  State peak demand from EIA-861 Annual Electric Power Industry Report (coincident state peak).
                  2023 view uses 2024 peak demand as proxy (~1–2% YoY variation).
                </li>
                <li style={LI_STYLE}>
                  Y-axis uses EIA average retail electricity prices (selected year, all sectors, cents/kWh).
                  Retail prices include generation, transmission, distribution, taxes, and regulatory
                  charges — giving each state an independent value. Wholesale prices (from parent ISO) are
                  shown in the tooltip for reference.
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
                  ELCC weighting uses state-level technology mix from EIA-860M with approximate national-average
                  factors: solar 30–35%, wind 15–25%, battery 85–90%, gas 95%. Three ISO-specific overrides
                  are applied: MISO solar 50% (published seasonal default), SPP wind 22.5%, CAISO battery 87.5%.
                  These are <em>average</em> ELCC estimates, not marginal. Published ISO accreditation values
                  differ substantially — e.g., PJM marginal ELCC for solar is 11% vs. ERCOT CDR at 71% — but
                  these measure different things (next-MW reliability contribution vs. fleet-average peak credit)
                  and are not directly comparable across ISOs.
                </li>
              </ul>
            </>
          )}

          <h4 style={HEADING_STYLE}>Multi-year data</h4>
          <ul style={{ listStyle: "disc", paddingLeft: 20, margin: 0 }}>
            <li style={LI_STYLE}>
              <strong>Capacity additions (2023–2025):</strong> sourced from EIA-860M January 2026 vintage
              — a single federal source providing consistent methodology across all three years. Industry sources
              report higher figures for some ISOs (e.g., ~18.7 GW for ERCOT 2024 vs. 14.0 GW in EIA-860M),
              likely due to filing lag in the monthly generator inventory. 2025 state data may
              undercount late-2025 additions not yet filed.
            </li>
            <li style={LI_STYLE}>
              <strong>2023 prices:</strong> ERCOT, SPP, PJM, and ISO-NE from market monitor State of the
              Market reports (high confidence). MISO, CAISO, and NYISO are estimates derived from all-in
              figures minus capacity adders (medium confidence, marked in tooltip).
            </li>
            <li style={LI_STYLE}>
              <strong>2025 estimates (all 7 ISOs + 32 states):</strong> No annual SOM reports published yet
              (expect May–Aug 2026). ISO prices: ERCOT $37.57 and SPP $37.91 from EIA STEO monthly;
              CAISO ~$35 from DMM quarterly; NYISO and ISO-NE ~$55 (winter gas spikes). PJM BRA
              2025/26 at $269.92/MW-day (~$18/MWh capacity adder, 9× increase); MISO PRA at
              $217/MW-day annualized (~$9/MWh, 10× increase). ISO capacity: ERCOT 11 GW (Modo Energy),
              CAISO 5.7 GW (Year in Review), others estimated proportionally to 2024. State-level
              2025 capacity from EIA-860M (operating year 2025); retail prices from EIA EPM Table 5.06.B
              (actual full-year 2025 data). All shown with dashed outline to distinguish from observed data.
            </li>
          </ul>

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
              Default view shows <strong>gross</strong> nameplate MW additions. Use the <strong>Gross/Net
                toggle</strong> to subtract retirements — retirement data from EIA-860M (Retired sheet,
              same vintage as additions). Key net figures: ISO-NE 2024 net <strong>−1,412 MW</strong> (1,937
              retired vs 525 added); PJM 2023 net +901 MW (7,009 retired from 7,910 gross); MISO 2024
              net +2,776 MW (4,380 retired). Negative net values shift bubbles left of the origin.
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
