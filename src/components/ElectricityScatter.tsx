import { useState, useCallback, useRef, useMemo } from "react";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { useTooltip } from "@visx/tooltip";
import type { ISODataPoint, XAxisMetric, PriceMetric, CapacityWeighting, GranularityLevel } from "../lib/types";
import { createScales, getXValue, getXLabel, getXSubtitle, getYValue, getYLabel } from "../lib/scales";
import { GROUP_FILLS, GROUP_STROKES } from "../lib/colors";
import { FONT, AXIS_STYLE, GRID_STYLE } from "../lib/theme";
import { ScatterTooltip } from "./ScatterTooltip";
import { ChartControls } from "./ChartControls";
import { ChartToolbar } from "./ChartToolbar";
import { QueueCompletionBar } from "./QueueCompletionBar";
import { MethodologyNotes } from "./MethodologyNotes";

const WIDTH = 820;
const HEIGHT = 580;
const MARGIN = { top: 60, right: 50, bottom: 88, left: 82 };

/**
 * Hand-tuned label offsets per ISO to avoid overlaps.
 * [dx, dy] relative to bubble center, in px.
 * Keyed by view key: "queue", "capacity" (nameplate), "capacity_elcc".
 */
type ViewKey = "queue" | "capacity" | "capacity_elcc";

const LABEL_OFFSETS: Record<string, Record<ViewKey, [number, number]>> = {
  ERCOT:    { capacity: [15, -30],  capacity_elcc: [15, -30],  queue: [15, -22] },
  SPP:      { capacity: [15, -18],  capacity_elcc: [15, -18],  queue: [15, -18] },
  MISO:     { capacity: [15, -10],  capacity_elcc: [15, -10],  queue: [15, 8] },
  CAISO:    { capacity: [-55, -20], capacity_elcc: [-55, -20], queue: [-55, -15] },
  PJM:      { capacity: [58, -15],  capacity_elcc: [15, -22],  queue: [30, -55] },
  NYISO:    { capacity: [15, -22],  capacity_elcc: [15, -22],  queue: [-52, -10] },
  "ISO-NE": { capacity: [-15, -18], capacity_elcc: [-15, -18], queue: [-52, 8] },
};

function getViewKey(metric: XAxisMetric, weighting: CapacityWeighting): ViewKey {
  if (metric === "queue") return "queue";
  return weighting === "elcc" ? "capacity_elcc" : "capacity";
}

/** ISO color mapping for horizontal band labels */
const ISO_BAND_COLORS: Record<string, string> = {
  ERCOT: "#2166ac",
  MISO: "#2166ac",
  SPP: "#5e4fa2",
  CAISO: "#5e4fa2",
  PJM: "#5e4fa2",
  NYISO: "#b2182b",
  "ISO-NE": "#b2182b",
};

interface Props {
  isoData: ISODataPoint[];
  stateData: ISODataPoint[];
}

export function ElectricityScatter({ isoData, stateData }: Props) {
  const [granularity, setGranularity] = useState<GranularityLevel>("iso");
  const [metric, setMetric] = useState<XAxisMetric>("queue");
  const [priceMetric, setPriceMetric] = useState<PriceMetric>("energy");
  const [weighting, setWeighting] = useState<CapacityWeighting>("nameplate");
  const svgRef = useRef<SVGSVGElement>(null);

  // Force capacity x-axis in state view (queue completion is ISO-level, not per-state)
  const handleGranularityChange = useCallback((g: GranularityLevel) => {
    setGranularity(g);
    if (g === "state") setMetric("capacity");
  }, []);

  const data = granularity === "state" ? stateData : isoData;
  const isStateView = granularity === "state";

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<ISODataPoint>();

  const { xScale, yScale, rScale, xMax, yMax } = createScales(
    data,
    metric,
    priceMetric,
    WIDTH,
    HEIGHT,
    MARGIN,
    weighting,
    granularity,
  );

  const handleMouseEnter = useCallback(
    (d: ISODataPoint, cx: number, cy: number) => {
      showTooltip({
        tooltipData: d,
        tooltipLeft: cx + MARGIN.left,
        tooltipTop: cy + MARGIN.top,
      });
    },
    [showTooltip],
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

  // Chart title adapts to granularity.
  const title = isStateView
    ? "New Capacity vs. Retail Electricity Price by State"
    : "New Capacity vs. Wholesale Price Across RTOs/ISOs";

  return (
    <div style={{ position: "relative", minWidth: WIDTH }}>
      {/* Title block */}
      <div style={{ marginBottom: 2, paddingLeft: MARGIN.left }}>
        <h2
          style={{
            fontFamily: FONT.title,
            fontSize: 19,
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
            fontSize: 13,
            color: "#666",
            margin: "2px 0 0",
          }}
        >
          {getXSubtitle(metric, weighting)}, 2024
          {isStateView && (
            <span style={{ color: "#999", marginLeft: 8, fontSize: 11 }}>
              State retail prices from EIA (2024 avg, all sectors)
            </span>
          )}
        </p>
      </div>

      {/* Controls */}
      <div style={{ marginBottom: 4, paddingLeft: MARGIN.left }}>
        <ChartControls
          granularity={granularity}
          xMetric={metric}
          yMetric={priceMetric}
          weighting={weighting}
          onGranularityChange={handleGranularityChange}
          onXChange={setMetric}
          onYChange={setPriceMetric}
          onWeightingChange={setWeighting}
        />
      </div>

      {/* SVG chart */}
      <svg ref={svgRef} width={WIDTH} height={HEIGHT} style={{ overflow: "visible" }}>
        <Group top={MARGIN.top} left={MARGIN.left}>
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
              {/* ISO label on right edge */}
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
            </g>
          ))}

          {/* Bubbles */}
          {data.map((d) => {
            const cx = xScale(getXValue(d, metric, weighting)) ?? 0;
            const cy = yScale(getYValue(d, priceMetric, granularity)) ?? 0;
            const r = rScale(d.peak_demand_gw);
            return (
              <g key={d.id}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={GROUP_FILLS[d.color_group]}
                  fillOpacity={isStateView ? 0.45 : 0.55}
                  stroke={GROUP_STROKES[d.color_group]}
                  strokeWidth={isStateView ? 1 : 1.5}
                  style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                  onMouseEnter={() => handleMouseEnter(d, cx, cy)}
                  onMouseLeave={hideTooltip}
                />
              </g>
            );
          })}

          {/* Direct labels — ISO view: always visible. State view: hover-only (no persistent labels). */}
          {!isStateView && data.map((d) => {
            const cx = xScale(getXValue(d, metric, weighting)) ?? 0;
            const cy = yScale(getYValue(d, priceMetric, granularity)) ?? 0;
            const [dx, dy] = LABEL_OFFSETS[d.id]?.[getViewKey(metric, weighting)] ?? [15, -15];
            return (
              <text
                key={`label-${d.id}`}
                x={cx + dx}
                y={cy + dy}
                fontFamily={FONT.body}
                fontSize={12}
                fontWeight={600}
                fill={GROUP_STROKES[d.color_group]}
                style={{ pointerEvents: "none" }}
              >
                {d.id}
              </text>
            );
          })}

          {/* State view: small 2-letter code near each bubble (subtle, not overlapping) */}
          {isStateView && data.map((d) => {
            const cx = xScale(getXValue(d, metric, weighting)) ?? 0;
            const cy = yScale(getYValue(d, priceMetric, granularity)) ?? 0;
            const r = rScale(d.peak_demand_gw);
            return (
              <text
                key={`state-label-${d.id}`}
                x={cx}
                y={cy - r - 3}
                textAnchor="middle"
                fontFamily={FONT.body}
                fontSize={9}
                fontWeight={600}
                fill={GROUP_STROKES[d.color_group]}
                opacity={0.7}
                style={{ pointerEvents: "none" }}
              >
                {d.id}
              </text>
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
          {/* Queue cohort footnote below x-axis */}
          {metric === "queue" && !isStateView && (
            <text
              x={xMax / 2}
              y={yMax + 68}
              textAnchor="middle"
              fontFamily={FONT.body}
              fontSize={9.5}
              fontStyle="italic"
              fill="#999"
            >
              * ERCOT: 2018–2020 cohort (Brattle/AEU); all others: 2000–2019 (LBNL Queued Up)
            </text>
          )}
          {metric === "queue" && isStateView && (
            <text
              x={xMax / 2}
              y={yMax + 68}
              textAnchor="middle"
              fontFamily={FONT.body}
              fontSize={9.5}
              fontStyle="italic"
              fill="#999"
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
              dx: -28,
            }}
            tickFormat={(v) => isStateView ? `${v}¢` : `$${v}`}
          />
        </Group>

        {/* Bubble size legend — upper-right of chart area */}
        <Group top={MARGIN.top + 8} left={MARGIN.left + xMax - 230}>
          <text
            fontFamily={FONT.body}
            fontSize={10}
            fill="#999"
            dy={-6}
          >
            Bubble size = {isStateView ? "state" : "system"} peak demand
          </text>
          {(isStateView ? [5, 20, 50] : [25, 80, 150]).map((gw, i) => {
            const r = rScale(gw);
            const cx = i * 56 + 14;
            return (
              <g key={gw}>
                <circle
                  cx={cx}
                  cy={16}
                  r={r * 0.4}
                  fill="none"
                  stroke="#bbb"
                  strokeWidth={1}
                />
                <text
                  x={cx}
                  y={34}
                  textAnchor="middle"
                  fontFamily={FONT.body}
                  fontSize={9}
                  fill="#aaa"
                >
                  {gw} GW
                </text>
              </g>
            );
          })}
        </Group>
      </svg>

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <ScatterTooltip
          data={tooltipData}
          xMetric={metric}
          priceMetric={priceMetric}
          weighting={weighting}
          granularity={granularity}
          top={tooltipTop ?? 0}
          left={tooltipLeft ?? 0}
        />
      )}

      {/* Footer — attribution + toolbar */}
      <div
        style={{
          maxWidth: WIDTH,
          paddingLeft: MARGIN.left,
          paddingRight: MARGIN.right,
          marginTop: -20,
        }}
      >
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
          <span
            style={{
              fontFamily: FONT.body,
              fontSize: 9,
              color: "#aaa",
              marginLeft: "auto",
            }}
          >
            Data: EIA, ISO Market Monitor Reports, LBNL Queued Up 2025
          </span>
        </div>

        {/* Toolbar row */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <ChartToolbar svgRef={svgRef} width={WIDTH} height={HEIGHT} />
        </div>
      </div>

      {/* Queue Completion Bar Chart (Panel B) */}
      <div style={{ marginTop: 16, borderTop: "1px solid #e8e8e8", paddingTop: 16 }}>
        <QueueCompletionBar
          data={data}
          marginLeft={MARGIN.left}
          width={WIDTH}
          granularity={granularity}
        />
      </div>

      {/* Methodology & Data Notes (collapsible) */}
      <div style={{ paddingLeft: MARGIN.left, paddingRight: MARGIN.right }}>
        <MethodologyNotes granularity={granularity} />
      </div>
    </div>
  );
}
