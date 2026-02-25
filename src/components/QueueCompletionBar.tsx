import { useMemo } from "react";
import { scaleLinear, scaleBand } from "@visx/scale";
import type { ISODataPoint, GranularityLevel } from "../lib/types";
import { GROUP_STROKES } from "../lib/colors";
import { FONT } from "../lib/theme";

interface Props {
  data: ISODataPoint[];
  marginLeft: number;
  width: number;
  granularity: GranularityLevel;
}

const LABEL_WIDTH = 52;
const MARGIN = { top: 40, right: 50, bottom: 24, left: LABEL_WIDTH };
const BAR_PADDING = 0.3;

export function QueueCompletionBar({ data, marginLeft, width, granularity }: Props) {
  const isStateView = granularity === "state";

  // In state view, queue rates are mostly inherited ISO-level estimates.
  // Show a condensed view: top 10 + bottom 5 with a "hidden" note,
  // or if all rates are inherited, show ISO-level rates directly.
  const { displayData, hiddenCount, allInherited } = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.queue_completion_pct - a.queue_completion_pct);

    if (!isStateView) {
      return { displayData: sorted, hiddenCount: 0, allInherited: false };
    }

    // Check if all states have inherited queue rates.
    const inherited = sorted.every((d) => d.queue_cohort?.startsWith("ISO-level"));

    if (inherited || sorted.length <= 15) {
      // Deduplicate: show one bar per unique queue rate (i.e., per ISO).
      const seen = new Map<number, ISODataPoint>();
      for (const d of sorted) {
        const rate = d.queue_completion_pct;
        if (!seen.has(rate)) {
          seen.set(rate, d);
        }
      }
      // Label with ISO name instead of state.
      const deduped = Array.from(seen.values()).map((d) => ({
        ...d,
        id: d.region, // Show ISO name
      }));
      return { displayData: deduped, hiddenCount: 0, allInherited: inherited };
    }

    // Show top 10 + bottom 5.
    const top = sorted.slice(0, 10);
    const bottom = sorted.slice(-5);
    const shown = [...top, ...bottom];
    return {
      displayData: shown,
      hiddenCount: sorted.length - shown.length,
      allInherited: false,
    };
  }, [data, isStateView]);

  const BAR_HEIGHT = Math.max(200, displayData.length * 28 + MARGIN.top + MARGIN.bottom);
  const innerWidth = width - marginLeft - MARGIN.left - MARGIN.right;
  const innerHeight = BAR_HEIGHT - MARGIN.top - MARGIN.bottom;

  const xScale = scaleLinear<number>({
    domain: [0, 50],
    range: [0, innerWidth],
  });

  const yScale = scaleBand<string>({
    domain: displayData.map((d) => d.id),
    range: [0, innerHeight],
    padding: BAR_PADDING,
  });

  const subtitle = isStateView && allInherited
    ? "ISO-level estimates (state-level queue data not available)"
    : "Share of queued projects reaching commercial operation (LBNL Queued Up 2025)";

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
        Interconnection Queue Completion Rate{isStateView ? "" : " by ISO"}
      </h3>
      <p
        style={{
          fontFamily: FONT.body,
          fontSize: 12,
          color: "#666",
          margin: "0 0 8px",
        }}
      >
        {subtitle}
      </p>

      <svg width={width - marginLeft} height={BAR_HEIGHT}>
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {displayData.map((d) => {
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
                {/* Label */}
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
                {/* Percentage */}
                <text
                  x={barWidth + 6}
                  y={y + bandHeight / 2}
                  textAnchor="start"
                  dominantBaseline="central"
                  fontFamily={FONT.body}
                  fontSize={11}
                  fill="#555"
                >
                  {d.queue_completion_pct}%{d.id === "ERCOT" || (isStateView && d.region === "ERCOT") ? "*" : ""}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {hiddenCount > 0 && (
        <p
          style={{
            fontFamily: FONT.body,
            fontSize: 10,
            color: "#999",
            margin: "4px 0 0",
            fontStyle: "italic",
          }}
        >
          {hiddenCount} additional states not shown
        </p>
      )}
      <p
        style={{
          fontFamily: FONT.body,
          fontSize: 10,
          color: "#999",
          margin: "4px 0 0",
          fontStyle: "italic",
        }}
      >
        {isStateView && allInherited
          ? "Queue completion rates are ISO-level estimates. States within the same ISO share the same rate."
          : "* ERCOT uses 2018–2020 cohort (Brattle/AEU); others use 2000–2019 (LBNL)"}
      </p>
    </div>
  );
}
