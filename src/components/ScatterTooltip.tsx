import { defaultStyles, TooltipWithBounds } from "@visx/tooltip";
import type { ISODataPoint, XAxisMetric, PriceMetric, CapacityWeighting, GranularityLevel } from "../lib/types";
import type { YearKey } from "../App";
import { capacityPerGwPeak, capacityPerGwPeakElcc } from "../lib/types";
import { FONT } from "../lib/theme";
import { GROUP_FILLS } from "../lib/colors";

interface Props {
  data: ISODataPoint;
  xMetric: XAxisMetric;
  priceMetric: PriceMetric;
  weighting: CapacityWeighting;
  granularity: GranularityLevel;
  year: YearKey;
  top: number;
  left: number;
}

const tooltipStyles: React.CSSProperties = {
  ...defaultStyles,
  fontFamily: FONT.body,
  fontSize: 13,
  lineHeight: 1.5,
  padding: "12px 16px",
  maxWidth: "min(320px, 90vw)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  border: "1px solid #ddd",
  borderRadius: 4,
};

export function ScatterTooltip({ data, xMetric, priceMetric, weighting, granularity, year, top, left }: Props) {
  const showElcc = weighting === "elcc" && data.capacity_additions_elcc_mw != null;
  const isStateView = granularity === "state";
  const isEst = data.isEstimate === true;

  // In state view, show "TX (ERCOT)" format.
  const displayName = isStateView ? `${data.id} (${data.region})` : data.id;
  const subtitle = isStateView
    ? data.name
    : `${data.name} — ${data.region}`;
  const yearLabel = year === "2025" ? "2025 (est.)" : year;

  // Check if queue rate is inherited from ISO.
  const queueInherited = data.queue_cohort?.startsWith("ISO-level");

  return (
    <TooltipWithBounds top={top} left={left} style={tooltipStyles}>
      <div
        style={{
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 2,
          color: GROUP_FILLS[data.color_group],
        }}
      >
        {displayName}
        <span style={{ fontWeight: 400, fontSize: 11, color: "#999", marginLeft: 6 }}>
          {yearLabel}
        </span>
      </div>
      {isEst && (
        <div style={{ color: "#e65100", fontSize: 10.5, fontStyle: "italic", marginBottom: 4 }}>
          Estimated — {data.confidence ?? "projected values"}
        </div>
      )}
      <div style={{ color: "#666", fontSize: 12, marginBottom: 8 }}>
        {subtitle}
      </div>
      <table style={{ fontSize: 12, borderCollapse: "collapse" }}>
        <tbody>
          {isStateView && data.retail_price_cents_kwh != null && (
            <Row
              label="Retail price"
              value={`${data.retail_price_cents_kwh.toFixed(1)}¢/kWh`}
              highlight={true}
            />
          )}
          <Row
            label={isStateView ? `Wholesale price (${data.region})` : "Wholesale price"}
            value={`$${data.wholesale_price_mwh.toFixed(2)}/MWh`}
            highlight={!isStateView && priceMetric === "energy"}
          />
          {year === "2024" && data.price_2023_mwh != null && (
            <Row
              label="2023 price"
              value={`$${data.price_2023_mwh.toFixed(2)}/MWh`}
            />
          )}
          <Row
            label={isStateView ? `All-in price (${data.region})` : "All-in price"}
            value={`$${data.all_in_price_mwh.toFixed(2)}/MWh`}
            highlight={!isStateView && priceMetric === "all_in"}
          />
          <Row
            label="New capacity"
            value={`${data.capacity_additions_mw.toLocaleString()} MW${showElcc ? ` (${data.capacity_additions_elcc_mw!.toLocaleString()} MW ELCC)` : ""}`}
          />
          <Row
            label="Per GW peak"
            value={showElcc
              ? `${capacityPerGwPeakElcc(data).toFixed(1)} MW/GW (ELCC)`
              : `${capacityPerGwPeak(data).toFixed(1)} MW/GW`}
          />
          <Row label="Projects" value={`${data.project_count}`} />
          <Row label="Peak demand" value={`${data.peak_demand_gw.toFixed(1)} GW`} />
          <Row
            label="Queue completion"
            value={`${data.queue_completion_pct}%${data.queue_cohort ? ` (${data.queue_cohort})` : ""}${queueInherited ? " *" : ""}`}
          />
          {data.avg_queue_duration_months != null && (
            <Row label="Avg queue duration" value={`${data.avg_queue_duration_months} months`} />
          )}
          {queueInherited && (
            <tr>
              <td colSpan={2} style={{ color: "#999", fontSize: 10.5, fontStyle: "italic", paddingTop: 2 }}>
                * ISO-level estimate — state-level data not available
              </td>
            </tr>
          )}
          {data.id === "ERCOT" && xMetric === "queue" && !isStateView && (
            <tr>
              <td colSpan={2} style={{ color: "#e65100", fontSize: 10.5, fontStyle: "italic", paddingTop: 2 }}>
                2018–2020 cohort — not directly comparable to 2000–2019 used by other ISOs
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {data.qualitative_note && (
        <div
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: "1px solid #eee",
            fontSize: 11.5,
            color: "#555",
            fontStyle: "italic",
          }}
        >
          {data.qualitative_note}
        </div>
      )}
    </TooltipWithBounds>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <tr>
      <td style={{ color: "#888", paddingRight: 12, paddingBottom: 2 }}>{label}</td>
      <td
        style={{
          fontWeight: 600,
          color: highlight ? "#1a1a1a" : "#333",
          paddingBottom: 2,
          background: highlight ? "rgba(42, 157, 143, 0.08)" : undefined,
          borderRadius: highlight ? 2 : undefined,
          padding: highlight ? "0 4px 2px" : "0 0 2px",
        }}
      >
        {value}
      </td>
    </tr>
  );
}
