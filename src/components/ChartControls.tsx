import type { XAxisMetric, PriceMetric, CapacityWeighting, GranularityLevel } from "../lib/types";
import { FONT } from "../lib/theme";

interface Props {
  compact?: boolean;
  granularity: GranularityLevel;
  xMetric: XAxisMetric;
  yMetric: PriceMetric;
  weighting: CapacityWeighting;
  onGranularityChange: (g: GranularityLevel) => void;
  onXChange: (m: XAxisMetric) => void;
  onYChange: (m: PriceMetric) => void;
  onWeightingChange: (w: CapacityWeighting) => void;
}

const granularityOptions: { value: GranularityLevel; label: string }[] = [
  { value: "iso", label: "RTO/ISO" },
  { value: "state", label: "State" },
];

const xOptions: { value: XAxisMetric; label: string }[] = [
  { value: "capacity", label: "New Capacity (MW / GW peak)" },
  { value: "queue", label: "Queue Completion Rate (%)" },
];

const yOptions: { value: PriceMetric; label: string }[] = [
  { value: "energy", label: "Energy-Only Price" },
  { value: "all_in", label: "All-In Price (Energy + Capacity)" },
];

const weightingOptions: { value: CapacityWeighting; label: string }[] = [
  { value: "nameplate", label: "Nameplate MW" },
  { value: "elcc", label: "ELCC-Estimated" },
];

function ToggleButton<T extends string>({
  value,
  label,
  active,
  onClick,
  padding = "4px 14px",
  fontSize = 12.5,
}: {
  value: T;
  label: string;
  active: boolean;
  onClick: (v: T) => void;
  padding?: string;
  fontSize?: number;
}) {
  return (
    <button
      onClick={() => onClick(value)}
      style={{
        padding,
        border: "1px solid",
        borderColor: active ? "#333" : "#ccc",
        borderRadius: 4,
        background: active ? "#333" : "#fff",
        color: active ? "#fff" : "#555",
        fontFamily: FONT.body,
        fontSize,
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

export function ChartControls({
  compact,
  granularity,
  xMetric,
  yMetric,
  weighting,
  onGranularityChange,
  onXChange,
  onYChange,
  onWeightingChange,
}: Props) {
  const rowStyle: React.CSSProperties = {
    display: "flex",
    gap: 4,
    alignItems: "center",
    flexWrap: compact ? "wrap" : undefined,
  };
  const labelStyle: React.CSSProperties = {
    color: "#888",
    marginRight: 4,
    lineHeight: "30px",
    minWidth: compact ? undefined : 80,
    width: compact ? "100%" : undefined,
    fontSize: compact ? 11 : undefined,
  };
  const btnPadding = compact ? "3px 10px" : "4px 14px";
  const btnFontSize = compact ? 11.5 : 12.5;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        fontFamily: FONT.body,
        fontSize: compact ? 11 : 13,
      }}
    >
      <div style={rowStyle}>
        <span style={labelStyle}>View by:</span>
        {granularityOptions.map((o) => (
          <ToggleButton
            key={o.value}
            value={o.value}
            label={o.label}
            active={granularity === o.value}
            onClick={onGranularityChange}
            padding={btnPadding}
            fontSize={btnFontSize}
          />
        ))}
      </div>
      {granularity !== "state" && (
        <div style={rowStyle}>
          <span style={labelStyle}>X-axis:</span>
          {xOptions.map((o) => (
            <ToggleButton
              key={o.value}
              value={o.value}
              label={o.label}
              active={xMetric === o.value}
              onClick={onXChange}
              padding={btnPadding}
              fontSize={btnFontSize}
            />
          ))}
        </div>
      )}
      {granularity !== "state" && (
        <div style={rowStyle}>
          <span style={labelStyle}>Y-axis:</span>
          {yOptions.map((o) => (
            <ToggleButton
              key={o.value}
              value={o.value}
              label={o.label}
              active={yMetric === o.value}
              onClick={onYChange}
              padding={btnPadding}
              fontSize={btnFontSize}
            />
          ))}
        </div>
      )}
      {xMetric === "capacity" && (
        <div style={rowStyle}>
          <span style={labelStyle}>Capacity basis:</span>
          {weightingOptions.map((o) => (
            <ToggleButton
              key={o.value}
              value={o.value}
              label={o.label}
              active={weighting === o.value}
              onClick={onWeightingChange}
              padding={btnPadding}
              fontSize={btnFontSize}
            />
          ))}
        </div>
      )}
    </div>
  );
}
