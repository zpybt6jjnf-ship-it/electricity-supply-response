import type { XAxisMetric, PriceMetric, CapacityWeighting } from "../lib/types";
import { FONT } from "../lib/theme";

interface Props {
  xMetric: XAxisMetric;
  yMetric: PriceMetric;
  weighting: CapacityWeighting;
  onXChange: (m: XAxisMetric) => void;
  onYChange: (m: PriceMetric) => void;
  onWeightingChange: (w: CapacityWeighting) => void;
}

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
}: {
  value: T;
  label: string;
  active: boolean;
  onClick: (v: T) => void;
}) {
  return (
    <button
      onClick={() => onClick(value)}
      style={{
        padding: "4px 14px",
        border: "1px solid",
        borderColor: active ? "#333" : "#ccc",
        borderRadius: 4,
        background: active ? "#333" : "#fff",
        color: active ? "#fff" : "#555",
        fontFamily: FONT.body,
        fontSize: 12.5,
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
  xMetric,
  yMetric,
  weighting,
  onXChange,
  onYChange,
  onWeightingChange,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        fontFamily: FONT.body,
        fontSize: 13,
      }}
    >
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <span style={{ color: "#888", marginRight: 4, lineHeight: "30px", minWidth: 80 }}>
          X-axis:
        </span>
        {xOptions.map((o) => (
          <ToggleButton
            key={o.value}
            value={o.value}
            label={o.label}
            active={xMetric === o.value}
            onClick={onXChange}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <span style={{ color: "#888", marginRight: 4, lineHeight: "30px", minWidth: 80 }}>
          Y-axis:
        </span>
        {yOptions.map((o) => (
          <ToggleButton
            key={o.value}
            value={o.value}
            label={o.label}
            active={yMetric === o.value}
            onClick={onYChange}
          />
        ))}
      </div>
      {xMetric === "capacity" && (
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ color: "#888", marginRight: 4, lineHeight: "30px", minWidth: 80 }}>
            Capacity basis:
          </span>
          {weightingOptions.map((o) => (
            <ToggleButton
              key={o.value}
              value={o.value}
              label={o.label}
              active={weighting === o.value}
              onClick={onWeightingChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
