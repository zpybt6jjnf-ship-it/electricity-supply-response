import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { useTooltip } from "@visx/tooltip";
import type { ISODataPoint, XAxisMetric, PriceMetric, CapacityWeighting, GranularityLevel, ViewTab } from "../lib/types";
import type { YearKey } from "../App";
import { createScales, getXValue, getXLabel, getXSubtitle, getYValue, getYLabel } from "../lib/scales";
import { ISO_FILLS, ISO_STROKES } from "../lib/colors";
import { FONT, AXIS_STYLE, GRID_STYLE } from "../lib/theme";
import { ScatterTooltip } from "./ScatterTooltip";
import { ChartControls } from "./ChartControls";
import { ChartToolbar } from "./ChartToolbar";
import { MethodologyNotes } from "./MethodologyNotes";
import { HiddenDataTable } from "./HiddenDataTable";
import { useContainerWidth } from "../lib/useContainerWidth";

const MAX_WIDTH = 820;

/**
 * Hand-tuned label offsets per ISO to avoid overlaps.
 * [dx, dy] relative to bubble center, in px.
 * Keyed by view key: "queue", "capacity" (nameplate), "capacity_elcc".
 */
type ViewKey = "queue" | "capacity" | "capacity_elcc";

const LABEL_OFFSETS: Record<string, Record<string, Record<ViewKey, [number, number]>>> = {
  "2024": {
    ERCOT:    { capacity: [15, -30],  capacity_elcc: [15, -30],  queue: [15, -22] },
    SPP:      { capacity: [15, -18],  capacity_elcc: [15, -18],  queue: [15, -18] },
    MISO:     { capacity: [15, -10],  capacity_elcc: [15, -10],  queue: [15, 8] },
    CAISO:    { capacity: [-55, -20], capacity_elcc: [-55, -20], queue: [-55, -15] },
    PJM:      { capacity: [58, -15],  capacity_elcc: [15, -22],  queue: [30, -55] },
    NYISO:    { capacity: [15, -22],  capacity_elcc: [15, -22],  queue: [-52, -10] },
    "ISO-NE": { capacity: [-15, -18], capacity_elcc: [-15, -18], queue: [-52, 8] },
  },
  "2023": {
    ERCOT:    { capacity: [15, -30],  capacity_elcc: [15, -30],  queue: [15, -22] },
    SPP:      { capacity: [15, -18],  capacity_elcc: [15, -18],  queue: [15, -18] },
    MISO:     { capacity: [15, -10],  capacity_elcc: [15, -10],  queue: [15, 8] },
    CAISO:    { capacity: [-55, -20], capacity_elcc: [-55, -20], queue: [-55, -15] },
    PJM:      { capacity: [-65, -15], capacity_elcc: [15, -22],  queue: [30, -55] },
    NYISO:    { capacity: [15, -22],  capacity_elcc: [15, -22],  queue: [-52, -10] },
    "ISO-NE": { capacity: [-15, -18], capacity_elcc: [-15, -18], queue: [-52, 8] },
  },
  "2025": {
    ERCOT:    { capacity: [15, -30],  capacity_elcc: [15, -30],  queue: [15, -22] },
    SPP:      { capacity: [15, -18],  capacity_elcc: [15, -18],  queue: [15, -18] },
    MISO:     { capacity: [15, -10],  capacity_elcc: [15, -10],  queue: [15, 8] },
    CAISO:    { capacity: [-55, -20], capacity_elcc: [-55, -20], queue: [-55, -15] },
    PJM:      { capacity: [15, -22],  capacity_elcc: [15, -22],  queue: [15, -22] },
    NYISO:    { capacity: [20, -35],  capacity_elcc: [20, -35],  queue: [-52, -18] },
    "ISO-NE": { capacity: [-55, -5],  capacity_elcc: [-55, -5],  queue: [-52, 15] },
  },
};

function getViewKey(metric: XAxisMetric, weighting: CapacityWeighting): ViewKey {
  if (metric === "queue") return "queue";
  return weighting === "elcc" ? "capacity_elcc" : "capacity";
}

/** ISO color mapping for horizontal band labels — matches ISO_STROKES */
const ISO_BAND_COLORS: Record<string, string> = {
  ERCOT:    "#2166ac",
  MISO:     "#1b9e77",
  SPP:      "#d95f02",
  CAISO:    "#c51b7d",
  PJM:      "#5e4fa2",
  NYISO:    "#4d9221",
  "ISO-NE": "#b8860b",
};

interface Props {
  isoData: ISODataPoint[];
  allIsoData: ISODataPoint[];
  isoDataByYear: Record<YearKey, ISODataPoint[]>;
  stateData: ISODataPoint[];
  allStateData: ISODataPoint[];
  stateDataByYear: Record<YearKey, ISODataPoint[]>;
  year: YearKey;
  availableYears: YearKey[];
  stateYears: YearKey[];
  onYearChange: (y: YearKey) => void;
}

export function ElectricityScatter({
  isoData, allIsoData, isoDataByYear, stateData, allStateData, stateDataByYear,
  year, availableYears, stateYears, onYearChange,
}: Props) {
  const [containerRef, containerWidth] = useContainerWidth();
  const [viewTab, setViewTab] = useState<ViewTab>("capacity");
  const [priceMetric, setPriceMetric] = useState<PriceMetric>("all_in");
  const [weighting, setWeighting] = useState<CapacityWeighting>("nameplate");
  const [tappedId, setTappedId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<ISODataPoint>();

  // Derive granularity and metric from viewTab
  const granularity: GranularityLevel = viewTab === "state" ? "state" : "iso";
  const metric: XAxisMetric = viewTab === "queue" ? "queue" : "capacity";

  // Responsive dimensions
  const width = containerWidth > 0 ? Math.min(containerWidth, MAX_WIDTH) : MAX_WIDTH;
  const isCompact = width < 480;
  const isMid = width >= 480 && width < MAX_WIDTH;

  const margin = useMemo(() => {
    if (isCompact) return { top: 48, right: 16, bottom: 72, left: 62 };
    if (isMid) return { top: 52, right: 30, bottom: 80, left: 64 };
    return { top: 60, right: 50, bottom: 88, left: 82 };
  }, [isCompact, isMid]);

  const height = isCompact ? 320 : isMid ? Math.round(width * 0.65) : 580;

  // Handle tab changes
  const handleViewTabChange = useCallback((t: ViewTab) => {
    setViewTab(t);
    hideTooltip();
    setTappedId(null);
    if (t === "state") {
      setPlaying(false);
    }
  }, [hideTooltip]);

  // Manual year change stops playback
  const handleYearChange = useCallback((y: YearKey) => {
    setPlaying(false);
    onYearChange(y);
  }, [onYearChange]);

  // Play/pause toggle
  const handlePlayToggle = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  const isStateView = granularity === "state";
  const activeYears = isStateView ? stateYears : availableYears;

  // Playback effect — advance through years, loop continuously
  useEffect(() => {
    if (!playing) return;
    const idx = activeYears.indexOf(year);
    // If current year isn't in active list (e.g. 2025 in state view), jump to first
    if (idx < 0) {
      onYearChange(activeYears[0]);
      return;
    }
    const isLast = idx >= activeYears.length - 1;
    // State view has 30+ bubbles — give more time to settle
    const delay = isStateView
      ? (isLast ? 5000 : 4500)
      : (isLast ? 3000 : 2800);
    const timer = setTimeout(() => {
      onYearChange(activeYears[isLast ? 0 : idx + 1]);
    }, delay);
    return () => clearTimeout(timer);
  }, [playing, year, activeYears, onYearChange]);

  const data = isStateView ? stateData : isoData;

  // Smaller bubbles on compact
  const rRangeOverride: [number, number] | undefined = isCompact
    ? (isStateView ? [4, 18] : [8, 28])
    : undefined;

  // Fixed axes across years for both views
  const domainData = isStateView ? allStateData : allIsoData;

  const { xScale, yScale, rScale, xMax, yMax } = createScales(
    data,
    metric,
    priceMetric,
    width,
    height,
    margin,
    weighting,
    granularity,
    rRangeOverride,
    domainData,
  );

  const handleMouseEnter = useCallback(
    (d: ISODataPoint, cx: number, cy: number) => {
      showTooltip({
        tooltipData: d,
        tooltipLeft: cx + margin.left,
        tooltipTop: cy + margin.top,
      });
    },
    [showTooltip, margin.left, margin.top],
  );

  // Tap-to-toggle tooltips on compact
  const handleBubbleClick = useCallback(
    (d: ISODataPoint, cx: number, cy: number) => {
      if (!isCompact) return;
      if (tappedId === d.id) {
        setTappedId(null);
        hideTooltip();
      } else {
        setTappedId(d.id);
        showTooltip({
          tooltipData: d,
          tooltipLeft: cx + margin.left,
          tooltipTop: cy + margin.top,
        });
      }
    },
    [isCompact, tappedId, hideTooltip, showTooltip, margin.left, margin.top],
  );

  // Build union of all ISOs for transition continuity (ISO view).
  // Keeps all 7 ISOs in DOM so CSS transitions work when switching years.
  const isoUnion = useMemo(() => {
    if (isStateView) return [];
    const map = new Map<string, ISODataPoint>();
    // Use 2024 as fallback position for ISOs not in current year
    for (const d of isoDataByYear["2024"]) map.set(d.id, d);
    // Override with current year's data
    for (const d of isoData) map.set(d.id, d);
    return Array.from(map.values());
  }, [isStateView, isoData, isoDataByYear]);

  const currentIds = useMemo(() => new Set(isoData.map((d) => d.id)), [isoData]);

  // Build union of all states for transition continuity (state view).
  const stateUnion = useMemo(() => {
    if (!isStateView) return [];
    const map = new Map<string, ISODataPoint>();
    for (const d of stateDataByYear["2024"]) map.set(d.id, d);
    for (const d of stateData) map.set(d.id, d);
    return Array.from(map.values());
  }, [isStateView, stateData, stateDataByYear]);

  const currentStateIds = useMemo(
    () => new Set(stateData.map((d) => d.id)),
    [stateData],
  );

  // Compute ISO bands for state view using min/max retail price per ISO.
  const isoBands = useMemo(() => {
    if (!isStateView) return [];

    const isoGroups: Record<string, { prices: number[] }> = {};
    for (const d of stateData) {
      const iso = d.region;
      if (!isoGroups[iso]) {
        isoGroups[iso] = { prices: [] };
      }
      isoGroups[iso].prices.push(getYValue(d, priceMetric, granularity));
    }

    return Object.entries(isoGroups).map(([iso, { prices }]) => {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const yTop = yScale(maxPrice);
      const yBottom = yScale(minPrice);
      // Add small padding for single-state ISOs
      const pad = prices.length === 1 ? 12 : 4;
      return {
        iso,
        yTop: yTop - pad,
        yBottom: yBottom + pad,
        yCenter: (yTop + yBottom) / 2,
      };
    });
  }, [isStateView, stateData, priceMetric, granularity, yScale]);

  // Chart title adapts to granularity and metric.
  const priceLabel = isStateView
    ? "Retail Electricity Price"
    : priceMetric === "all_in" ? "All-In Price" : "Wholesale Price";
  const supplyLabel = metric === "queue" ? "Queue Completion" : "Supply Response";
  const title = isStateView
    ? `${supplyLabel} vs. ${priceLabel} by State`
    : `${supplyLabel} vs. ${priceLabel} Across RTOs/ISOs`;

  // Bubble legend config — concentric circles, bottom-aligned
  const legendItems = isCompact
    ? (isStateView ? [5, 30] : [30, 120])
    : (isStateView ? [3, 15, 50] : [25, 85, 150]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", maxWidth: MAX_WIDTH }}>
      {/* Title block */}
      <div style={{ marginBottom: 2, paddingLeft: margin.left }}>
        <h2
          style={{
            fontFamily: FONT.title,
            fontSize: isCompact ? 15 : 19,
            fontWeight: 700,
            color: "#1a1a1a",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: FONT.body,
            fontSize: isCompact ? 11 : 13,
            color: "#666",
            margin: "2px 0 0",
          }}
        >
          {getXSubtitle(metric, weighting)}, {year}{year === "2025" ? " (est.)" : ""}
          {isStateView && (
            <span style={{ color: "#767676", marginLeft: 8, fontSize: isCompact ? 9 : 11 }}>
              State retail prices from EIA ({year} avg, all sectors)
            </span>
          )}
        </p>
      </div>

      {/* Controls */}
      <div style={{ marginBottom: 4, paddingLeft: margin.left }}>
        <ChartControls
          compact={isCompact}
          viewTab={viewTab}
          priceMetric={priceMetric}
          weighting={weighting}
          year={year}
          availableYears={activeYears}
          playing={playing}
          onViewTabChange={handleViewTabChange}
          onPriceMetricChange={setPriceMetric}
          onWeightingChange={setWeighting}
          onYearChange={handleYearChange}
          onPlayToggle={handlePlayToggle}
        />
      </div>

      {/* SVG chart */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ overflow: "visible" }}
        role="img"
        aria-label={`Scatter chart showing ${isStateView ? "state-level capacity" : metric === "queue" ? "queue completion" : "supply response"} versus ${isStateView ? "retail electricity price" : priceMetric === "all_in" ? "all-in price" : "wholesale price"} for ${year}${year === "2025" ? " (estimated)" : ""}`}
      >
        <Group top={margin.top} left={margin.left}>
          {/* Grid */}
          <GridRows
            scale={yScale}
            width={xMax}
            stroke={GRID_STYLE.stroke}
            strokeDasharray={GRID_STYLE.strokeDasharray}
          />
          <GridColumns
            scale={xScale}
            height={yMax}
            stroke={GRID_STYLE.stroke}
            strokeDasharray={GRID_STYLE.strokeDasharray}
          />

          {/* Horizontal ISO price bands — state view only */}
          {isStateView && isoBands.map(({ iso, yTop, yBottom, yCenter }) => (
            <g key={`band-${iso}`}>
              {/* Band spanning retail price range */}
              <rect
                x={0}
                y={yTop}
                width={xMax}
                height={Math.max(yBottom - yTop, 4)}
                fill={ISO_BAND_COLORS[iso] ?? "#999"}
                opacity={0.04}
                rx={2}
              />
              {/* ISO label on right edge — hidden on compact */}
              {!isCompact && (
                <text
                  x={xMax + 6}
                  y={yCenter}
                  textAnchor="start"
                  dominantBaseline="central"
                  fontFamily={FONT.body}
                  fontSize={10}
                  fontWeight={600}
                  fill={ISO_BAND_COLORS[iso] ?? "#999"}
                  opacity={0.6}
                >
                  {iso}
                </text>
              )}
            </g>
          ))}

          {/* ISO view bubbles — with animated transitions */}
          {!isStateView && isoUnion.map((baseD) => {
            const isActive = currentIds.has(baseD.id);
            const d = isoData.find((curr) => curr.id === baseD.id) ?? baseD;
            const cx = xScale(getXValue(d, metric, weighting)) ?? 0;
            const cy = yScale(getYValue(d, priceMetric, granularity)) ?? 0;
            const r = rScale(d.peak_demand_gw);
            const isEst = d.isEstimate === true;
            const [dx, dy] = LABEL_OFFSETS[year]?.[d.id]?.[getViewKey(metric, weighting)]
              ?? LABEL_OFFSETS["2024"]?.[d.id]?.[getViewKey(metric, weighting)]
              ?? [15, -15];
            return (
              <g
                key={d.id}
                tabIndex={isActive ? 0 : -1}
                role="button"
                aria-label={`${d.id}: ${d.capacity_additions_mw.toLocaleString()} MW new capacity, $${d.wholesale_price_mwh.toFixed(0)}/MWh, ${d.peak_demand_gw.toFixed(1)} GW peak demand`}
                onFocus={() => { if (isActive) handleMouseEnter(d, cx, cy); }}
                onBlur={() => hideTooltip()}
                style={{
                  transform: `translate(${cx}px, ${cy}px)`,
                  transition: "transform 1.8s ease-in-out, opacity 1s ease",
                  opacity: isActive ? 1 : 0,
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <circle
                  r={r}
                  fill={ISO_FILLS[d.id] ?? "#999"}
                  fillOpacity={isEst ? 0.20 : 0.55}
                  stroke={ISO_STROKES[d.id] ?? "#666"}
                  strokeWidth={isEst ? 2 : 1.5}
                  strokeDasharray={isEst ? "4,3" : undefined}
                  style={{ cursor: "pointer", transition: "r 0.4s ease" }}
                  onMouseEnter={isCompact ? undefined : () => handleMouseEnter(d, cx, cy)}
                  onMouseLeave={isCompact ? undefined : hideTooltip}
                  onClick={() => handleBubbleClick(d, cx, cy)}
                />
                {/* "2025 est." annotation for estimated points */}
                {isEst && !isCompact && (
                  <text
                    x={r + 6}
                    y={-r + 2}
                    fontFamily={FONT.body}
                    fontSize={10}
                    fontStyle="italic"
                    fontWeight={600}
                    fill={ISO_STROKES[d.id] ?? "#666"}
                    opacity={0.7}
                    style={{ pointerEvents: "none" }}
                  >
                    2025 est.
                  </text>
                )}
                {/* Direct label */}
                {!isCompact && (
                  <text
                    x={dx}
                    y={dy}
                    fontFamily={FONT.body}
                    fontSize={12}
                    fontWeight={600}
                    fill={ISO_STROKES[d.id] ?? "#666"}
                    style={{ pointerEvents: "none" }}
                  >
                    {d.id}
                    {metric === "queue" && (d.id === "ERCOT" || d.id === "MISO") && (
                      <tspan fill="#e65100" fontSize={10} fontWeight={400}>{" \u2020"}</tspan>
                    )}
                  </text>
                )}
              </g>
            );
          })}

          {/* State view bubbles — with animated transitions */}
          {isStateView && stateUnion.map((baseD) => {
            const isActive = currentStateIds.has(baseD.id);
            const d = stateData.find((curr) => curr.id === baseD.id) ?? baseD;
            const cx = xScale(getXValue(d, metric, weighting)) ?? 0;
            const cy = yScale(getYValue(d, priceMetric, granularity)) ?? 0;
            const r = rScale(d.peak_demand_gw);
            const isEst = d.isEstimate === true;
            const bubbleFill = ISO_FILLS[d.region] ?? "#999";
            const bubbleStroke = ISO_STROKES[d.region] ?? "#666";
            return (
              <g
                key={d.id}
                tabIndex={isActive ? 0 : -1}
                role="button"
                aria-label={`${d.id} (${d.region}): ${d.capacity_additions_mw.toLocaleString()} MW, ${d.retail_price_cents_kwh?.toFixed(1) ?? "—"}¢/kWh retail, ${d.peak_demand_gw.toFixed(1)} GW peak`}
                onFocus={() => { if (isActive) handleMouseEnter(d, cx, cy); }}
                onBlur={() => hideTooltip()}
                style={{
                  transform: `translate(${cx}px, ${cy}px)`,
                  transition: "transform 1.8s ease-in-out, opacity 1s ease",
                  opacity: isActive ? 1 : 0,
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <circle
                  r={r}
                  fill={bubbleFill}
                  fillOpacity={isEst ? 0.20 : 0.45}
                  stroke={bubbleStroke}
                  strokeWidth={isEst ? 1.5 : 1}
                  strokeDasharray={isEst ? "4,3" : undefined}
                  style={{ cursor: "pointer", transition: "r 0.4s ease" }}
                  onMouseEnter={isCompact ? undefined : () => handleMouseEnter(d, cx, cy)}
                  onMouseLeave={isCompact ? undefined : hideTooltip}
                  onClick={() => handleBubbleClick(d, cx, cy)}
                />
                {/* State label — hidden for small bubbles to reduce clutter */}
                {!isCompact && r > 8 && (
                  <text
                    x={0}
                    y={-r - 3}
                    textAnchor="middle"
                    fontFamily={FONT.body}
                    fontSize={9}
                    fontWeight={600}
                    fill={bubbleStroke}
                    opacity={0.7}
                    style={{ pointerEvents: "none" }}
                  >
                    {d.id}
                  </text>
                )}
              </g>
            );
          })}

          {/* Axes */}
          <AxisBottom
            top={yMax}
            scale={xScale}
            label={getXLabel(metric, weighting)}
            stroke={AXIS_STYLE.strokeColor}
            tickStroke={AXIS_STYLE.tickStroke}
            tickLabelProps={() => AXIS_STYLE.tickLabelProps}
            labelProps={{
              ...AXIS_STYLE.labelProps,
              dy: 12,
            }}
            tickFormat={(v) =>
              metric === "queue" ? `${v}%` : String(v)
            }
          />
          {/* Queue cohort footnote below x-axis — desktop only, compact moves to data source line */}
          {!isCompact && metric === "queue" && !isStateView && (
            <text
              x={xMax / 2}
              y={yMax + 68}
              textAnchor="middle"
              fontFamily={FONT.body}
              fontSize={9.5}
              fontStyle="italic"
              fill="#767676"
            >
              † ERCOT & MISO: 2018–2020 cohort (Brattle/AEU); all others: 2000–2019 (LBNL Queued Up)
            </text>
          )}
          {!isCompact && metric === "queue" && isStateView && (
            <text
              x={xMax / 2}
              y={yMax + 68}
              textAnchor="middle"
              fontFamily={FONT.body}
              fontSize={9.5}
              fontStyle="italic"
              fill="#767676"
            >
              Queue completion rates are ISO-level estimates inherited by states within each ISO
            </text>
          )}

          <AxisLeft
            scale={yScale}
            label={getYLabel(priceMetric, granularity)}
            stroke={AXIS_STYLE.strokeColor}
            tickStroke={AXIS_STYLE.tickStroke}
            tickLabelProps={() => ({
              ...AXIS_STYLE.tickLabelProps,
              dx: -6,
              textAnchor: "end" as const,
            })}
            labelProps={{
              ...AXIS_STYLE.labelProps,
              dx: isCompact ? -14 : -28,
            }}
            tickFormat={(v) => isStateView ? `${v}¢` : `$${v}`}
          />
        </Group>

        {/* Bubble size legend — concentric circles, upper-right of chart area */}
        {(() => {
          const maxR = rScale(legendItems[legendItems.length - 1]);
          const legendW = maxR * 2 + 50;
          const legendCx = maxR;
          const legendBottom = maxR * 2 + 4;
          return (
            <Group top={margin.top + 8} left={margin.left + xMax - legendW}>
              <text
                fontFamily={FONT.body}
                fontSize={isCompact ? 9 : 10}
                fill="#767676"
                dy={-6}
              >
                Bubble size = {isStateView ? "state" : "system"} peak demand
              </text>
              {legendItems.map((gw) => {
                const r = rScale(gw);
                const cy = legendBottom - r;
                return (
                  <g key={gw}>
                    <circle
                      cx={legendCx}
                      cy={cy}
                      r={r}
                      fill="none"
                      stroke="#bbb"
                      strokeWidth={1}
                    />
                    {/* Dashed line from top of circle to label */}
                    <line
                      x1={legendCx + r}
                      y1={cy - r}
                      x2={legendCx + maxR + 4}
                      y2={cy - r}
                      stroke="#ccc"
                      strokeWidth={0.5}
                      strokeDasharray="2,2"
                    />
                    <text
                      x={legendCx + maxR + 7}
                      y={cy - r}
                      dominantBaseline="central"
                      fontFamily={FONT.body}
                      fontSize={9}
                      fill="#767676"
                    >
                      {gw} GW
                    </text>
                  </g>
                );
              })}
            </Group>
          );
        })()}

        {/* Estimated point legend — only when estimated data is visible */}
        {data.some((d) => d.isEstimate) && (() => {
          const maxLegendR = rScale(legendItems[legendItems.length - 1]);
          const estTop = margin.top + 8 + maxLegendR * 2 + 16;
          const estLeft = margin.left + xMax - maxLegendR * 2 - 50;
          return (
            <Group top={estTop} left={estLeft}>
              <circle
                cx={8}
                cy={4}
                r={6}
                fill="none"
                stroke="#8073ac"
                strokeWidth={1.5}
                strokeDasharray="4,3"
              />
              <text
                x={20}
                y={4}
                dominantBaseline="central"
                fontFamily={FONT.body}
                fontSize={isCompact ? 9 : 10}
                fontStyle="italic"
                fill="#767676"
              >
                Estimated
              </text>
            </Group>
          );
        })()}

        {/* Color legend — hidden on compact */}
        {!isCompact && (() => {
          const colorLegendItems = [
                { label: "ERCOT", fill: ISO_FILLS.ERCOT, stroke: ISO_STROKES.ERCOT },
                { label: "MISO", fill: ISO_FILLS.MISO, stroke: ISO_STROKES.MISO },
                { label: "SPP", fill: ISO_FILLS.SPP, stroke: ISO_STROKES.SPP },
                { label: "PJM", fill: ISO_FILLS.PJM, stroke: ISO_STROKES.PJM },
                { label: "CAISO", fill: ISO_FILLS.CAISO, stroke: ISO_STROKES.CAISO },
                { label: "NYISO", fill: ISO_FILLS.NYISO, stroke: ISO_STROKES.NYISO },
                { label: "ISO-NE", fill: ISO_FILLS["ISO-NE"], stroke: ISO_STROKES["ISO-NE"] },
              ];
          let cx = 0;
          return (
            <Group top={height - 10} left={margin.left}>
              {colorLegendItems.map((item) => {
                const x = cx;
                cx += item.label.length * 6.5 + 24;
                return (
                  <g key={item.label}>
                    <circle cx={x + 5} cy={0} r={5} fill={item.fill} fillOpacity={0.55} stroke={item.stroke} strokeWidth={1} />
                    <text
                      x={x + 14}
                      y={0}
                      dominantBaseline="central"
                      fontFamily={FONT.body}
                      fontSize={10}
                      fill="#666"
                    >
                      {item.label}
                    </text>
                  </g>
                );
              })}
            </Group>
          );
        })()}

      </svg>

      {/* Hidden data table for screen readers */}
      <HiddenDataTable
        data={data}
        metric={metric}
        priceMetric={priceMetric}
        weighting={weighting}
        granularity={granularity}
        year={year}
      />

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <ScatterTooltip
          data={tooltipData}
          xMetric={metric}
          priceMetric={priceMetric}
          weighting={weighting}
          granularity={granularity}
          year={year}
          top={tooltipTop ?? 0}
          left={tooltipLeft ?? 0}
        />
      )}

      {/* Footer — data source + toolbar + attribution */}
      <div
        style={{
          maxWidth: width,
          paddingLeft: margin.left,
          paddingRight: margin.right,
          marginTop: isCompact ? -4 : -20,
        }}
      >
        {/* Data source + toolbar row */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: isCompact ? 4 : 6,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontFamily: FONT.body,
              fontSize: 9,
              color: "#767676",
              flex: isCompact ? "1 1 100%" : undefined,
            }}
          >
            Data: EIA, ISO Market Monitor Reports, LBNL Queued Up 2025
            {isCompact && metric === "queue" && !isStateView &&
              " (ERCOT/MISO: 2018–20 cohort via Brattle; others: 2000–19 via LBNL)"}
            {isCompact && metric === "queue" && isStateView &&
              " (queue rates are ISO-level estimates)"}
          </span>
          <div style={{ marginLeft: isCompact ? undefined : "auto" }}>
            <ChartToolbar svgRef={svgRef} width={width} height={height} />
          </div>
        </div>

        {/* Attribution row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 6,
          }}
        >
          {/* Logo mark */}
          <svg width={14} height={14} viewBox="0 0 14 14">
            <defs>
              <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2a9d8f" />
                <stop offset="50%" stopColor="#e9c46a" />
                <stop offset="100%" stopColor="#e76f51" />
              </linearGradient>
            </defs>
            <rect width={14} height={14} fill="#1a1a2e" rx={1.5} />
            <path
              d="M 0,9.8 L 1.12,8.8 L 2.52,10.5 L 3.92,7 L 5.32,8.4 L 7,4.2 L 8.68,7.7 L 10.08,6.3 L 11.48,8.4 L 12.88,7.7 L 14,9.1"
              stroke="url(#brandGrad)"
              strokeWidth={0.9}
              fill="none"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontFamily: FONT.brand,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.02em",
              color: "#555",
            }}
          >
            Bottlenecks Lab
          </span>
        </div>
      </div>

      {/* Methodology & Data Notes (collapsible) */}
      <div style={{ paddingLeft: margin.left, paddingRight: margin.right }}>
        <MethodologyNotes granularity={granularity} />
      </div>
    </div>
  );
}
