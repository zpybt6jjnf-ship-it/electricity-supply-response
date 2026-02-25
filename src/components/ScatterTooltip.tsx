import { defaultStyles, TooltipWithBounds } from "@visx/tooltip";
import type { ISODataPoint, PriceMetric, CapacityWeighting, GranularityLevel } from "../lib/types";
import { capacityPerGwPeak, capacityPerGwPeakElcc, projectsPerGwPeak } from "../lib/types";
import { FONT } from "../lib/theme";
import { GROUP_FILLS } from "../lib/colors";

interface Props {
  data: ISODataPoint;
  priceMetric: PriceMetric;
  weighting: CapacityWeighting;
  granularity: GranularityLevel;
  top: number;
  left: number;
}

const tooltipStyles: React.CSSProperties = {
  ...defaultStyles,
  fontFamily: FONT.body,
  fontSize: 13,
  lineHeight: 1.5,
  padding: "12px 16px",
  maxWidth: 320,
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  border: "1px solid #ddd",
  borderRadius: 4,
};

export function ScatterTooltip({ data, priceMetric, weighting, granularity, top, left }: Props) {
  const showElcc = weighting === "elcc" && data.capacity_additions_elcc_mw != null;
  const isStateView = granularity === "state";

  // In state view, show "TX (ERCOT)" format.
  const displayName = isStateView ? `${data.id} (${data.region})` : data.id;
  const subtitle = isStateView
    ? data.name
    : `${data.name} — ${data.region}`;

  // Check if queue rate is inherited from ISO.
  const queueInherited = data.queue_cohort?.startsWith("ISO-level");

  return (
    <TooltipWithBounds top={top} left={left} style={tooltipStyles}>
      <div
        style={{
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 6,
          color: GROUP_FILLS[data.color_group],
        }}
      >
        {displayName}
      </div>
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
          {data.price_2023_mwh != null && (
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
          <Row label="Per GW peak" value={`${projectsPerGwPeak(data).toFixed(1)} projects/GW`} />
          <Row label="Peak demand" value={`${data.peak_demand_gw.toFixed(1)} GW`} />
          <Row
            label="Queue completion"
            value={`${data.queue_completion_pct}%${data.queue_cohort ? ` (${data.queue_cohort})` : ""}${queueInherited ? " *" : ""}`}
          />
          {queueInherited && (
            <tr>
              <td colSpan={2} style={{ color: "#999", fontSize: 10.5, fontStyle: "italic", paddingTop: 2 }}>
                * ISO-level estimate — state-level data not available
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
