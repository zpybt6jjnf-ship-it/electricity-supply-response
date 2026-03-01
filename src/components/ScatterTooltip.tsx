import { defaultStyles, TooltipWithBounds } from "@visx/tooltip";
import type { ISODataPoint, XAxisMetric, PriceMetric, CapacityWeighting, CapacityBasis, GranularityLevel } from "../lib/types";
import type { YearKey } from "../App";
import { capacityPerGwPeak, capacityPerGwPeakElcc, netCapacity } from "../lib/types";
import { FONT, COLOR } from "../lib/theme";
import { ISO_FILLS } from "../lib/colors";

interface Props {
  data: ISODataPoint;
  xMetric: XAxisMetric;
  priceMetric: PriceMetric;
  weighting: CapacityWeighting;
  basis?: CapacityBasis;
  granularity: GranularityLevel;
  year: YearKey;
  top: number;
  left: number;
  compact?: boolean;
}

function getTooltipStyles(isCompact?: boolean): React.CSSProperties {
  return {
    ...defaultStyles,
    fontFamily: FONT.body,
    fontSize: isCompact ? 12 : 13,
    lineHeight: 1.5,
    padding: isCompact ? "10px 12px" : "12px 16px",
    maxWidth: "min(320px, 90vw)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)",
    border: `1px solid ${COLOR.border.light}`,
    borderRadius: 8,
  };
}

export function ScatterTooltip({ data, xMetric, priceMetric, weighting, basis, granularity, year, top, left, compact }: Props) {
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
    <TooltipWithBounds top={top} left={left} style={getTooltipStyles(compact)}>
      <div
        style={{
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 2,
          color: ISO_FILLS[isStateView ? data.region : data.id] ?? COLOR.text.secondary,
        }}
      >
        {displayName}
        <span style={{ fontWeight: 400, fontSize: 11, color: COLOR.text.muted, marginLeft: 6 }}>
          {yearLabel}
        </span>
      </div>
      {isEst && (
        <div style={{ color: COLOR.accent.warning, fontSize: 10.5, fontStyle: "italic", marginBottom: 4 }}>
          Estimated — {data.confidence ?? "projected values"}
        </div>
      )}
      <div style={{ color: COLOR.text.tertiary, fontSize: 12, marginBottom: 8 }}>
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
          {data.retirements_mw != null && (
            <Row
              label="Retirements"
              value={`${data.retirements_mw.toLocaleString()} MW`}
            />
          )}
          {data.retirements_mw != null && (
            <Row
              label="Net additions"
              value={`${(data.capacity_additions_mw - data.retirements_mw).toLocaleString()} MW`}
              warning={data.capacity_additions_mw - data.retirements_mw < 0}
            />
          )}
          <Row
            label={basis === "net" ? "Net per GW peak" : "Per GW peak"}
            value={(() => {
              if (basis === "net") {
                const net = showElcc
                  ? (data.capacity_additions_elcc_mw ?? data.capacity_additions_mw) - (data.retirements_mw ?? 0)
                  : netCapacity(data);
                return `${(net / data.peak_demand_gw).toFixed(1)} MW/GW${showElcc ? " (ELCC)" : ""}`;
              }
              return showElcc
                ? `${capacityPerGwPeakElcc(data).toFixed(1)} MW/GW (ELCC)`
                : `${capacityPerGwPeak(data).toFixed(1)} MW/GW`;
            })()}
            highlight={basis === "net"}
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
              <td colSpan={2} style={{ color: COLOR.text.muted, fontSize: 10.5, fontStyle: "italic", paddingTop: 2 }}>
                * ISO-level estimate — state-level data not available
              </td>
            </tr>
          )}
          {(data.id === "ERCOT" || data.id === "MISO") && xMetric === "queue" && !isStateView && (
            <tr>
              <td colSpan={2} style={{ color: COLOR.accent.warning, fontSize: 10.5, fontStyle: "italic", paddingTop: 2 }}>
                Brattle 2018–2020 cohort — not directly comparable to LBNL 2000–2019 used by other ISOs
              </td>
            </tr>
          )}
          {data.id === "TX" && isStateView && (
            <tr>
              <td colSpan={2} style={{ color: COLOR.accent.warning, fontSize: 10.5, fontStyle: "italic", paddingTop: 2 }}>
                State capacity (18.7 GW) includes unfiled generators. ISO ERCOT view shows 14.0 GW (EIA-860M only).
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
            borderTop: `1px solid ${COLOR.border.light}`,
            fontSize: 11.5,
            color: COLOR.text.tertiary,
            fontStyle: "italic",
          }}
        >
          {data.qualitative_note}
        </div>
      )}
    </TooltipWithBounds>
  );
}

function Row({ label, value, highlight, warning }: { label: string; value: string; highlight?: boolean; warning?: boolean }) {
  return (
    <tr>
      <td style={{ color: COLOR.text.muted, paddingRight: 12, paddingBottom: 2 }}>{label}</td>
      <td
        style={{
          fontFamily: FONT.data,
          fontWeight: 600,
          fontSize: 11.5,
          color: warning ? COLOR.accent.error : highlight ? COLOR.text.primary : COLOR.text.secondary,
          paddingBottom: 2,
          background: warning ? `${COLOR.accent.error}0F` : highlight ? `${COLOR.accent.brand}14` : undefined,
          borderRadius: (highlight || warning) ? 2 : undefined,
          padding: (highlight || warning) ? "0 4px 2px" : "0 0 2px",
        }}
      >
        {value}
      </td>
    </tr>
  );
}
