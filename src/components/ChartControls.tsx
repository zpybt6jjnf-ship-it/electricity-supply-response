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

/* ── Segmented control (shared by view tabs + year) ────────────────── */
function Segment<T extends string>({
  value,
  label,
  active,
  onClick,
  position,
  tier,
  compact,
}: {
  value: T;
  label: string;
  active: boolean;
  onClick: (v: T) => void;
  position: "first" | "middle" | "last" | "only";
  tier: "primary" | "secondary";
  compact?: boolean;
}) {
  const isPrimary = tier === "primary";
  const radius = 3;
  const borderRadius =
    position === "only"
      ? radius
      : position === "first"
        ? `${radius}px 0 0 ${radius}px`
        : position === "last"
          ? `0 ${radius}px ${radius}px 0`
          : "0";

  return (
    <button
      onClick={() => onClick(value)}
      aria-pressed={active}
      style={{
        padding: isPrimary
          ? compact
            ? "6px 10px"
            : "6px 14px"
          : compact
            ? "4px 9px"
            : "4px 12px",
        border: "1px solid",
        borderColor: active
          ? isPrimary
            ? "#333"
            : "#888"
          : isPrimary
            ? "#bbb"
            : "#ccc",
        borderRadius,
        marginLeft: position === "first" || position === "only" ? 0 : -1,
        background: active
          ? isPrimary
            ? "#333"
            : "#f5f5f5"
          : "#fff",
        color: active
          ? isPrimary
            ? "#fff"
            : "#333"
          : isPrimary
            ? "#555"
            : "#888",
        fontFamily: FONT.body,
        fontSize: isPrimary
          ? compact
            ? 11.5
            : 12.5
          : compact
            ? 11
            : 12,
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.15s ease",
        position: "relative",
        zIndex: active ? 1 : 0,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

/* ── Tier 3: Small pill toggle ─────────────────────────────────────── */
function SmallToggleGroup<T extends string>({
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
        alignItems: "center",
        gap: 0,
      }}
    >
      <span
        style={{
          color: "#767676",
          fontSize: compact ? 10 : 11,
          fontFamily: FONT.body,
          whiteSpace: "nowrap",
          marginRight: compact ? 4 : 5,
        }}
      >
        {label}
      </span>
      <span
        style={{
          display: "inline-flex",
          border: "1px solid #ccc",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {options.map((o, i) => {
          const isActive = activeValue === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onClick(o.value)}
              aria-pressed={isActive}
              style={{
                padding: compact ? "2px 7px" : "2px 9px",
                border: "none",
                borderLeft: i > 0 ? "1px solid #ccc" : "none",
                borderRadius: 0,
                background: isActive ? "#f5f5f5" : "#fff",
                color: isActive ? "#333" : "#aaa",
                fontFamily: FONT.body,
                fontSize: compact ? 10 : 11,
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
                lineHeight: 1.6,
              }}
            >
              {o.label}
            </button>
          );
        })}
      </span>
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

  const labelWidth = compact ? 34 : 40;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        fontFamily: FONT.body,
        fontSize: compact ? 11 : 13,
      }}
    >
      {/* Tier 1 — View: primary segmented control (dark fill) */}
      <div
        style={{
          display: "flex",
          gap: 0,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            color: "#767676",
            minWidth: labelWidth,
            fontSize: compact ? 11 : 12,
            fontFamily: FONT.body,
          }}
        >
          View
        </span>
        {tabOptions.map((o, i) => (
          <Segment
            key={o.value}
            value={o.value}
            label={o.label}
            active={viewTab === o.value}
            onClick={onViewTabChange}
            tier="primary"
            position={
              i === 0
                ? "first"
                : i === tabOptions.length - 1
                  ? "last"
                  : "middle"
            }
            compact={compact}
          />
        ))}
      </div>

      {/* Tier 2 — Year: secondary segmented control (outline) */}
      <div
        style={{
          display: "flex",
          gap: 0,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 4,
        }}
      >
        <span
          style={{
            color: "#767676",
            minWidth: labelWidth,
            fontSize: compact ? 11 : 12,
            fontFamily: FONT.body,
          }}
        >
          Year
        </span>
        {availableYears.map((y, i) => (
          <Segment
            key={y}
            value={y}
            label={yearLabels[y]}
            active={year === y}
            onClick={onYearChange}
            tier="secondary"
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
            color: playing ? "#2a9d8f" : "#999",
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

      {/* Tier 3 — Secondary settings: small toggle groups */}
      {showSecondaryRow && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: compact ? 8 : 14,
            paddingLeft: labelWidth,
          }}
        >
          {showCapBasis && (
            <SmallToggleGroup
              label="Capacity:"
              options={weightingOptions}
              activeValue={weighting}
              onClick={onWeightingChange}
              compact={compact}
            />
          )}
          {showCapBasis && (
            <SmallToggleGroup
              label="Gross/net:"
              options={basisOptions}
              activeValue={basis}
              onClick={onBasisChange}
              compact={compact}
            />
          )}
          {showPriceBasis && (
            <SmallToggleGroup
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
