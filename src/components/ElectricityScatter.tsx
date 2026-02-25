import { useState, useCallback, useRef } from "react";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { useTooltip } from "@visx/tooltip";
import type { ISODataPoint, XAxisMetric, PriceMetric } from "../lib/types";
import { createScales, getXValue, getXLabel, getXSubtitle, getYValue, getYLabel } from "../lib/scales";
import { GROUP_FILLS, GROUP_STROKES, SHADED_REGION } from "../lib/colors";
import { FONT, AXIS_STYLE, GRID_STYLE } from "../lib/theme";
import { ScatterTooltip } from "./ScatterTooltip";
import { ChartControls } from "./ChartControls";
import { ChartToolbar } from "./ChartToolbar";
import { QueueCompletionBar } from "./QueueCompletionBar";

const WIDTH = 820;
const HEIGHT = 580;
const MARGIN = { top: 60, right: 50, bottom: 88, left: 82 };

/**
 * Hand-tuned label offsets per ISO to avoid overlaps.
 * [dx, dy] relative to bubble center, in px.
 * Keyed by x-axis metric. Energy vs all-in price may shift y positions
 * but the offsets are robust enough for both price modes.
 */
const LABEL_OFFSETS: Record<string, Record<XAxisMetric, [number, number]>> = {
  ERCOT:    { capacity: [15, -30],  queue: [15, -22],  projects: [15, -30] },
  SPP:      { capacity: [15, -18],  queue: [15, -18],  projects: [15, -18] },
  MISO:     { capacity: [15, -10],  queue: [15, 8],    projects: [15, 8] },
  CAISO:    { capacity: [-55, -20], queue: [-55, -15], projects: [-55, -20] },
  PJM:      { capacity: [58, -15],  queue: [30, -55],  projects: [55, -15] },
  NYISO:    { capacity: [15, -22],  queue: [-52, -10], projects: [15, -22] },
  "ISO-NE": { capacity: [-15, -18], queue: [-52, 8],   projects: [-15, -18] },
};

interface Props {
  data: ISODataPoint[];
}

export function ElectricityScatter({ data }: Props) {
  const [metric, setMetric] = useState<XAxisMetric>("capacity");
  const [priceMetric, setPriceMetric] = useState<PriceMetric>("energy");
  const svgRef = useRef<SVGSVGElement>(null);

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

  // Shaded "broken supply response" region — upper-left (high price, low building).
  const shadedXThreshold =
    metric === "capacity" ? 50
    : metric === "queue" ? 16
    : 0.7; // projects per GW peak
  const shadedYThreshold = priceMetric === "all_in" ? 40 : 32;
  const shadedX1 = xScale(shadedXThreshold);
  const shadedY1 = yScale(shadedYThreshold);

  return (
    <div style={{ position: "relative" }}>
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
          New Capacity vs. Wholesale Price Across RTOs/ISOs
        </h2>
        <p
          style={{
            fontFamily: FONT.body,
            fontSize: 13,
            color: "#666",
            margin: "2px 0 0",
          }}
        >
          {getXSubtitle(metric)}, 2024
        </p>
      </div>

      {/* Controls */}
      <div style={{ marginBottom: 4, paddingLeft: MARGIN.left }}>
        <ChartControls
          xMetric={metric}
          yMetric={priceMetric}
          onXChange={setMetric}
          onYChange={setPriceMetric}
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

          {/* Shaded "broken supply response" region — upper-left */}
          <rect
            x={0}
            y={0}
            width={shadedX1}
            height={shadedY1}
            fill={SHADED_REGION.fill}
            stroke={SHADED_REGION.stroke}
            strokeDasharray={SHADED_REGION.strokeDasharray}
            strokeWidth={1.2}
            rx={4}
          />
          <text
            x={8}
            y={18}
            textAnchor="start"
            fontFamily={FONT.title}
            fontSize={12}
            fontStyle="italic"
            fill="#b2182b"
            opacity={0.6}
          >
            Broken supply response
          </text>

          {/* Bubbles */}
          {data.map((d) => {
            const cx = xScale(getXValue(d, metric)) ?? 0;
            const cy = yScale(getYValue(d, priceMetric)) ?? 0;
            const r = rScale(d.peak_demand_gw);
            return (
              <g key={d.id}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={GROUP_FILLS[d.color_group]}
                  fillOpacity={0.55}
                  stroke={GROUP_STROKES[d.color_group]}
                  strokeWidth={1.5}
                  style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                  onMouseEnter={() => handleMouseEnter(d, cx, cy)}
                  onMouseLeave={hideTooltip}
                />
              </g>
            );
          })}

          {/* Direct labels */}
          {data.map((d) => {
            const cx = xScale(getXValue(d, metric)) ?? 0;
            const cy = yScale(getYValue(d, priceMetric)) ?? 0;
            const [dx, dy] = LABEL_OFFSETS[d.id]?.[metric] ?? [15, -15];
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

          {/* Axes */}
          <AxisBottom
            top={yMax}
            scale={xScale}
            label={getXLabel(metric)}
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
          <AxisLeft
            scale={yScale}
            label={getYLabel(priceMetric)}
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
            tickFormat={(v) => `$${v}`}
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
            Bubble size = system peak demand
          </text>
          {[25, 80, 150].map((gw, i) => {
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

      {/* CAISO annotation — only on capacity view, only on hover */}
      {tooltipOpen && tooltipData?.id === "CAISO" && metric === "capacity" && (
        <div
          style={{
            position: "absolute",
            left: MARGIN.left + (xScale(getXValue(tooltipData, metric)) ?? 0) - 100,
            top: MARGIN.top + (yScale(getYValue(tooltipData, priceMetric)) ?? 0) + 30,
            width: 150,
            fontFamily: FONT.title,
            fontSize: 9,
            fontStyle: "italic",
            color: "#8073ac",
            opacity: 0.7,
            lineHeight: 1.3,
            pointerEvents: "none",
            textAlign: "center",
          }}
        >
          State mandates drive procurement despite queue friction
        </div>
      )}

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <ScatterTooltip
          data={tooltipData}
          priceMetric={priceMetric}
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
        <QueueCompletionBar data={data} marginLeft={MARGIN.left} width={WIDTH} />
      </div>
    </div>
  );
}
