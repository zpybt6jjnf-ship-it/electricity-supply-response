import type { ViewTab, PriceMetric, CapacityWeighting, CapacityBasis } from "../lib/types";
import type { YearKey } from "../App";
import { FONT } from "../lib/theme";

interface Props {
  compact?: boolean;
  viewTab: ViewTab;
  priceMetric: PriceMetric;
  weighting: CapacityWeighting;
  basis: CapacityBasis;
  year: YearKey;
  availableYears: YearKey[];
  playing: boolean;
  onViewTabChange: (t: ViewTab) => void;
  onPriceMetricChange: (m: PriceMetric) => void;
  onWeightingChange: (w: CapacityWeighting) => void;
  onBasisChange: (b: CapacityBasis) => void;
  onYearChange: (y: YearKey) => void;
  onPlayToggle: () => void;
}

const tabOptions: { value: ViewTab; label: string }[] = [
  { value: "capacity", label: "RTO/ISO Capacity \u00d7 Price" },
  { value: "queue", label: "RTO/ISO Queue \u00d7 Price" },
  { value: "state", label: "State Capacity \u00d7 Price" },
];

const priceOptions: { value: PriceMetric; label: string }[] = [
  { value: "all_in", label: "All-In" },
  { value: "energy", label: "Energy-Only" },
];

const weightingOptions: { value: CapacityWeighting; label: string }[] = [
  { value: "nameplate", label: "Nameplate" },
  { value: "elcc", label: "ELCC" },
];

const basisOptions: { value: CapacityBasis; label: string }[] = [
  { value: "gross", label: "Gross" },
  { value: "net", label: "Net" },
];

const yearLabels: Record<YearKey, string> = {
  "2023": "2023",
  "2024": "2024",
  "2025": "2025 (est.)",
};

/* ── Tier 1: View tabs ─────────────────────────────────────────────── */
function ViewTab({
  value,
  label,
  active,
  onClick,
  compact,
}: {
  value: ViewTab;
  label: string;
  active: boolean;
  onClick: (v: ViewTab) => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={() => onClick(value)}
      aria-pressed={active}
      style={{
        padding: compact ? "6px 0" : "6px 2px",
        marginRight: compact ? 14 : 18,
        border: "none",
        borderBottom: active ? "2px solid #333" : "2px solid transparent",
        borderRadius: 0,
        background: "none",
        color: active ? "#1a1a1a" : "#999",
        fontFamily: FONT.body,
        fontSize: compact ? 11.5 : 13,
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.15s ease",
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

/* ── Tier 2: Year segmented control ────────────────────────────────── */
function YearSegment({
  value,
  label,
  active,
  onClick,
  position,
  compact,
}: {
  value: YearKey;
  label: string;
  active: boolean;
  onClick: (v: YearKey) => void;
  position: "first" | "middle" | "last";
  compact?: boolean;
}) {
  const radius = 3;
  const borderRadius =
    position === "first"
      ? `${radius}px 0 0 ${radius}px`
      : position === "last"
        ? `0 ${radius}px ${radius}px 0`
        : "0";

  return (
    <button
      onClick={() => onClick(value)}
      aria-pressed={active}
      style={{
        padding: compact ? "5px 10px" : "5px 14px",
        border: "1px solid",
        borderColor: active ? "#333" : "#bbb",
        borderRadius,
        // collapse internal borders so there's no doubling
        marginLeft: position === "first" ? 0 : -1,
        background: active ? "#333" : "#fff",
        color: active ? "#fff" : "#666",
        fontFamily: FONT.body,
        fontSize: compact ? 11.5 : 12.5,
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.15s ease",
        position: "relative",
        zIndex: active ? 1 : 0,
        lineHeight: 1.4,
      }}
    >
      {label}
    </button>
  );
}

/* ── Tier 3: Inline text toggle ────────────────────────────────────── */
function TextToggle<T extends string>({
  value,
  label,
  active,
  onClick,
  compact,
}: {
  value: T;
  label: string;
  active: boolean;
  onClick: (v: T) => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={() => onClick(value)}
      aria-pressed={active}
      style={{
        padding: "2px 1px",
        border: "none",
        borderRadius: 0,
        background: "none",
        color: active ? "#333" : "#aaa",
        fontFamily: FONT.body,
        fontSize: compact ? 10.5 : 11.5,
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.15s ease",
        lineHeight: 1.4,
        borderBottom: active ? "1px solid #999" : "1px solid transparent",
      }}
    >
      {label}
    </button>
  );
}

function TextToggleGroup<T extends string>({
  label,
  options,
  activeValue,
  onClick,
  compact,
}: {
  label: string;
  options: { value: T; label: string }[];
  activeValue: T;
  onClick: (v: T) => void;
  compact?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: compact ? 4 : 5,
      }}
    >
      <span
        style={{
          color: "#999",
          fontSize: compact ? 10 : 11,
          fontFamily: FONT.body,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      {options.map((o) => (
        <TextToggle
          key={o.value}
          value={o.value}
          label={o.label}
          active={activeValue === o.value}
          onClick={onClick}
          compact={compact}
        />
      ))}
    </span>
  );
}

export function ChartControls({
  compact,
  viewTab,
  priceMetric,
  weighting,
  basis,
  year,
  availableYears,
  playing,
  onViewTabChange,
  onPriceMetricChange,
  onWeightingChange,
  onBasisChange,
  onYearChange,
  onPlayToggle,
}: Props) {
  const isIsoView = viewTab !== "state";
  const showCapBasis = viewTab !== "queue";
  const showPriceBasis = isIsoView;
  const showSecondaryRow = showCapBasis || showPriceBasis;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        fontFamily: FONT.body,
        fontSize: compact ? 11 : 13,
      }}
    >
      {/* Tier 1 — View tabs: underline style */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          borderBottom: "1px solid #e8e8e8",
          paddingBottom: 1,
        }}
      >
        <span
          style={{
            color: "#767676",
            marginRight: 8,
            fontSize: compact ? 11 : 12.5,
            fontFamily: FONT.body,
          }}
        >
          View
        </span>
        {tabOptions.map((o) => (
          <ViewTab
            key={o.value}
            value={o.value}
            label={o.label}
            active={viewTab === o.value}
            onClick={onViewTabChange}
            compact={compact}
          />
        ))}
      </div>

      {/* Tier 2 — Year: segmented control */}
      <div
        style={{
          display: "flex",
          gap: 0,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            color: "#767676",
            marginRight: 8,
            fontSize: compact ? 11 : 12.5,
            fontFamily: FONT.body,
          }}
        >
          Year
        </span>
        {availableYears.map((y, i) => (
          <YearSegment
            key={y}
            value={y}
            label={yearLabels[y]}
            active={year === y}
            onClick={onYearChange}
            position={
              i === 0
                ? "first"
                : i === availableYears.length - 1
                  ? "last"
                  : "middle"
            }
            compact={compact}
          />
        ))}
        <button
          onClick={onPlayToggle}
          aria-label={playing ? "Pause year animation" : "Play through years"}
          aria-pressed={playing}
          title={playing ? "Pause" : "Play through years"}
          style={{
            marginLeft: 8,
            padding: 0,
            border: "none",
            borderRadius: 0,
            background: "none",
            color: playing ? "#2a9d8f" : "#bbb",
            fontFamily: FONT.body,
            fontSize: compact ? 12 : 13,
            fontWeight: 400,
            cursor: "pointer",
            transition: "all 0.15s ease",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {playing ? "\u23F8" : "\u25B6"}
        </button>
      </div>

      {/* Tier 3 — Secondary settings: inline text toggles */}
      {showSecondaryRow && (
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: compact ? 8 : 12,
          }}
        >
          {showCapBasis && (
            <TextToggleGroup
              label="Capacity:"
              options={weightingOptions}
              activeValue={weighting}
              onClick={onWeightingChange}
              compact={compact}
            />
          )}
          {showCapBasis && (
            <TextToggleGroup
              label="Gross/net:"
              options={basisOptions}
              activeValue={basis}
              onClick={onBasisChange}
              compact={compact}
            />
          )}
          {showPriceBasis && (
            <TextToggleGroup
              label="Price:"
              options={priceOptions}
              activeValue={priceMetric}
              onClick={onPriceMetricChange}
              compact={compact}
            />
          )}
        </div>
      )}
    </div>
  );
}
