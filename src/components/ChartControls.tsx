import type { ViewTab, PriceMetric, CapacityWeighting, CapacityBasis } from "../lib/types";
import type { YearKey } from "../App";
import { FONT, COLOR, TRANSITION } from "../lib/theme";

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

const tabOptions: { value: ViewTab; label: string; compactLabel: string }[] = [
  { value: "capacity", label: "RTO/ISO Capacity \u00d7 Price", compactLabel: "Capacity" },
  { value: "queue", label: "RTO/ISO Queue \u00d7 Price", compactLabel: "Queue" },
  { value: "state", label: "State Capacity \u00d7 Price", compactLabel: "State" },
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
  const radius = 6;
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
            ? "6px 12px"
            : "7px 16px"
          : compact
            ? "5px 10px"
            : "5px 13px",
        border: "1px solid",
        borderColor: active
          ? isPrimary
            ? COLOR.text.secondary
            : COLOR.border.strong
          : COLOR.border.default,
        borderRadius,
        marginLeft: position === "first" || position === "only" ? 0 : -1,
        background: active
          ? isPrimary
            ? COLOR.text.secondary
            : COLOR.surface.muted
          : "#fff",
        color: active
          ? isPrimary
            ? "#fff"
            : COLOR.text.secondary
          : isPrimary
            ? COLOR.text.tertiary
            : COLOR.text.disabled,
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
        transition: TRANSITION,
        position: "relative",
        zIndex: active ? 1 : 0,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        boxShadow: active
          ? isPrimary
            ? "0 1px 3px rgba(0,0,0,0.12)"
            : "inset 0 1px 2px rgba(0,0,0,0.06)"
          : "0 1px 2px rgba(0,0,0,0.03)",
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
          color: COLOR.text.muted,
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
          border: `1px solid ${COLOR.border.default}`,
          borderRadius: 6,
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
                padding: compact ? "3px 8px" : "3px 10px",
                border: "none",
                borderLeft: i > 0 ? `1px solid ${COLOR.border.default}` : "none",
                borderRadius: 0,
                background: isActive ? COLOR.surface.muted : "#fff",
                color: isActive ? COLOR.text.secondary : COLOR.text.disabled,
                fontFamily: FONT.body,
                fontSize: compact ? 10 : 11,
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                transition: TRANSITION,
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
            color: COLOR.text.muted,
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
            label={compact ? o.compactLabel : o.label}
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
          marginBottom: 12,
        }}
      >
        <span
          style={{
            color: COLOR.text.muted,
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
            padding: "2px 4px",
            border: "none",
            borderRadius: 4,
            background: playing ? `${COLOR.accent.brand}14` : "none",
            color: playing ? COLOR.accent.brand : COLOR.text.disabled,
            fontFamily: FONT.body,
            fontSize: compact ? 12 : 13,
            fontWeight: 400,
            cursor: "pointer",
            transition: TRANSITION,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          {playing ? "\u23F8" : "\u25B6"}
          {playing && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: COLOR.accent.brand,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          )}
        </button>
      </div>

      {/* Tier 3 — Secondary settings: small toggle groups */}
      {showSecondaryRow && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: compact ? 6 : 14,
            paddingLeft: compact ? 0 : labelWidth,
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
