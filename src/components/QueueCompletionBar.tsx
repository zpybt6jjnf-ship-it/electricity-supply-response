import { scaleLinear, scaleBand } from "@visx/scale";
import type { ISODataPoint } from "../lib/types";
import { GROUP_STROKES } from "../lib/colors";
import { FONT } from "../lib/theme";

interface Props {
  data: ISODataPoint[];
  marginLeft: number;
  width: number;
}

const BAR_HEIGHT = 200;
const LABEL_WIDTH = 52;
const MARGIN = { top: 40, right: 50, bottom: 24, left: LABEL_WIDTH };
const BAR_PADDING = 0.3;

export function QueueCompletionBar({ data, marginLeft, width }: Props) {
  // Sort by queue completion (highest first)
  const sorted = [...data].sort((a, b) => b.queue_completion_pct - a.queue_completion_pct);

  const innerWidth = width - marginLeft - MARGIN.left - MARGIN.right;
  const innerHeight = BAR_HEIGHT - MARGIN.top - MARGIN.bottom;

  const xScale = scaleLinear<number>({
    domain: [0, 50],
    range: [0, innerWidth],
  });

  const yScale = scaleBand<string>({
    domain: sorted.map((d) => d.id),
    range: [0, innerHeight],
    padding: BAR_PADDING,
  });

  return (
    <div style={{ paddingLeft: marginLeft }}>
      <h3
        style={{
          fontFamily: FONT.title,
          fontSize: 16,
          fontWeight: 700,
          color: "#1a1a1a",
          margin: "0 0 2px",
          lineHeight: 1.3,
        }}
      >
        Interconnection Queue Completion Rate by ISO
      </h3>
      <p
        style={{
          fontFamily: FONT.body,
          fontSize: 12,
          color: "#666",
          margin: "0 0 8px",
        }}
      >
        Share of queued projects reaching commercial operation (LBNL Queued Up 2025)
      </p>

      <svg width={width - marginLeft} height={BAR_HEIGHT}>
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {sorted.map((d) => {
            const barWidth = xScale(d.queue_completion_pct);
            const y = yScale(d.id) ?? 0;
            const bandHeight = yScale.bandwidth();
            return (
              <g key={d.id}>
                {/* Bar */}
                <rect
                  x={0}
                  y={y}
                  width={barWidth}
                  height={bandHeight}
                  fill={GROUP_STROKES[d.color_group]}
                  opacity={0.75}
                  rx={2}
                />
                {/* ISO label (left, inside or outside bar) */}
                <text
                  x={-6}
                  y={y + bandHeight / 2}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontFamily={FONT.body}
                  fontSize={11}
                  fontWeight={600}
                  fill={GROUP_STROKES[d.color_group]}
                >
                  {d.id}
                </text>
                {/* Percentage label (right of bar) */}
                <text
                  x={barWidth + 6}
                  y={y + bandHeight / 2}
                  textAnchor="start"
                  dominantBaseline="central"
                  fontFamily={FONT.body}
                  fontSize={11}
                  fill="#555"
                >
                  {d.queue_completion_pct}%{d.id === "ERCOT" ? "*" : ""}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <p
        style={{
          fontFamily: FONT.body,
          fontSize: 10,
          color: "#999",
          margin: "4px 0 0",
          fontStyle: "italic",
        }}
      >
        * ERCOT uses 2018–2020 cohort (Brattle/AEU); others use 2000–2019 (LBNL)
      </p>
    </div>
  );
}
