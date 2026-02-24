import { useState, useCallback } from "react";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { useTooltip } from "@visx/tooltip";
import type { ISODataPoint, YAxisMetric } from "../lib/types";
import { createScales, getYValue, getYLabel, getYSubtitle } from "../lib/scales";
import { GROUP_FILLS, GROUP_STROKES, SHADED_REGION } from "../lib/colors";
import { FONT, AXIS_STYLE, GRID_STYLE } from "../lib/theme";
import { ScatterTooltip } from "./ScatterTooltip";
import { ChartControls } from "./ChartControls";

const WIDTH = 820;
const HEIGHT = 560;
const MARGIN = { top: 80, right: 50, bottom: 70, left: 72 };

/**
 * Hand-tuned label offsets per ISO to avoid overlaps.
 * [dx, dy] relative to bubble center, in px.
 */
const LABEL_OFFSETS: Record<string, Record<YAxisMetric, [number, number]>> = {
  ERCOT:    { capacity: [-50, -30], queue: [15, -22] },
  SPP:      { capacity: [15, -18],  queue: [15, -18] },
  MISO:     { capacity: [15, -10],  queue: [15, 8] },
  CAISO:    { capacity: [15, 6],    queue: [18, -26] },
  PJM:      { capacity: [-52, -38], queue: [-52, -30] },
  NYISO:    { capacity: [15, -26],  queue: [-50, 22] },
  "ISO-NE": { capacity: [15, -16],  queue: [15, -16] },
};

interface Props {
  data: ISODataPoint[];
}

export function ElectricityScatter({ data }: Props) {
  const [metric, setMetric] = useState<YAxisMetric>("capacity");

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

  // Shaded "broken supply response" region — bottom-right quadrant.
  // Capacity view: PJM, NYISO, ISO-NE (CAISO excluded — high output from state mandates).
  // Queue view: PJM, CAISO, NYISO, ISO-NE (all have ≤12% completion).
  const shadedX0 = metric === "capacity"
    ? xScale(32)
    : xScale(32);
  const shadedY0 = metric === "capacity"
    ? yScale(50)
    : yScale(16);

  return (
    <div style={{ position: "relative" }}>
      {/* Title block */}
      <div style={{ marginBottom: 8, paddingLeft: MARGIN.left }}>
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
          (a) Wholesale Price vs. New Capacity Across RTOs/ISOs
        </h2>
        <p
          style={{
            fontFamily: FONT.body,
            fontSize: 13,
            color: "#666",
            margin: "4px 0 0",
          }}
        >
          {getYSubtitle(metric)}, 2024
        </p>
      </div>

      {/* Controls */}
      <div style={{ marginBottom: 12, paddingLeft: MARGIN.left }}>
        <ChartControls metric={metric} onChange={setMetric} />
      </div>

      {/* SVG chart */}
      <svg width={WIDTH} height={HEIGHT} style={{ overflow: "visible" }}>
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

          {/* Shaded "broken supply response" region */}
          <rect
            x={shadedX0}
            y={shadedY0}
            width={xMax - shadedX0}
            height={yMax - shadedY0}
            fill={SHADED_REGION.fill}
            stroke={SHADED_REGION.stroke}
            strokeDasharray={SHADED_REGION.strokeDasharray}
            strokeWidth={1.2}
            rx={4}
          />
          <text
            x={xMax - 8}
            y={yMax - 10}
            textAnchor="end"
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
            const cx = xScale(d.wholesale_price_mwh) ?? 0;
            const cy = yScale(getYValue(d, metric)) ?? 0;
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
            const cx = xScale(d.wholesale_price_mwh) ?? 0;
            const cy = yScale(getYValue(d, metric)) ?? 0;
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
            label="Average Wholesale Price ($/MWh)"
            stroke={AXIS_STYLE.strokeColor}
            tickStroke={AXIS_STYLE.tickStroke}
            tickLabelProps={() => AXIS_STYLE.tickLabelProps}
            labelProps={{
              ...AXIS_STYLE.labelProps,
              dy: 12,
            }}
            tickFormat={(v) => `$${v}`}
          />
          <AxisLeft
            scale={yScale}
            label={getYLabel(metric)}
            stroke={AXIS_STYLE.strokeColor}
            tickStroke={AXIS_STYLE.tickStroke}
            tickLabelProps={() => AXIS_STYLE.tickLabelProps}
            labelProps={{
              ...AXIS_STYLE.labelProps,
              dx: -10,
            }}
            tickFormat={(v) =>
              metric === "queue" ? `${v}%` : String(v)
            }
          />
        </Group>

        {/* Footer */}
        <text
          x={WIDTH - MARGIN.right}
          y={HEIGHT - 8}
          textAnchor="end"
          fontFamily={FONT.body}
          fontSize={10}
          fill="#aaa"
        >
          Bottlenecks Lab · Data: EIA, ISO Market Monitor Reports, LBNL Queued Up 2025
        </text>

        {/* Bubble size legend */}
        <Group top={HEIGHT - 56} left={MARGIN.left + 4}>
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

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <ScatterTooltip
          data={tooltipData}
          top={tooltipTop ?? 0}
          left={tooltipLeft ?? 0}
        />
      )}
    </div>
  );
}
