import { scaleLinear, scaleSqrt } from "@visx/scale";
import type { ISODataPoint, XAxisMetric, PriceMetric, CapacityWeighting, GranularityLevel } from "./types";
import { capacityPerGwPeak, capacityPerGwPeakElcc } from "./types";

export function getXValue(d: ISODataPoint, metric: XAxisMetric, weighting?: CapacityWeighting): number {
  if (metric === "queue") return d.queue_completion_pct;
  return weighting === "elcc" ? capacityPerGwPeakElcc(d) : capacityPerGwPeak(d);
}

export function getXLabel(metric: XAxisMetric, weighting?: CapacityWeighting): string {
  if (metric === "queue") return "Queue Completion Rate (%)";
  return weighting === "elcc"
    ? "New Capacity (ELCC-Weighted MW per GW of System Peak)"
    : "New Capacity (MW per GW of System Peak)";
}

export function getXSubtitle(metric: XAxisMetric, weighting?: CapacityWeighting): string {
  if (metric === "queue")
    return "Share of Interconnection Requests Reaching Commercial Operation";
  return weighting === "elcc"
    ? "ELCC-Estimated Effective Capacity Reaching Commercial Operation (MW per GW of System Peak)"
    : "Annual New Generation Reaching Commercial Operation (MW per GW of System Peak)";
}

export function getYValue(d: ISODataPoint, priceMetric: PriceMetric, granularity?: GranularityLevel): number {
  if (granularity === "state" && d.retail_price_cents_kwh != null) {
    return d.retail_price_cents_kwh;
  }
  return priceMetric === "all_in" ? d.all_in_price_mwh : d.wholesale_price_mwh;
}

export function getYLabel(priceMetric: PriceMetric, granularity?: GranularityLevel): string {
  if (granularity === "state") {
    return "Average Retail Electricity Price (cents/kWh)";
  }
  return priceMetric === "all_in"
    ? "All-In Price ($/MWh, Energy + Capacity)"
    : "Average Wholesale Price ($/MWh)";
}

export function createScales(
  data: ISODataPoint[],
  metric: XAxisMetric,
  priceMetric: PriceMetric,
  width: number,
  height: number,
  margin: { top: number; right: number; bottom: number; left: number },
  weighting?: CapacityWeighting,
  granularity?: GranularityLevel,
  rRangeOverride?: [number, number],
) {
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xValues = data.map((d) => getXValue(d, metric, weighting));
  const priceValues = data.map((d) => getYValue(d, priceMetric, granularity));
  const peakValues = data.map((d) => d.peak_demand_gw);

  // X-axis: capacity metric (supply response)
  const xScale = scaleLinear<number>({
    domain: [0, Math.max(...xValues) * 1.15],
    range: [0, xMax],
    nice: true,
  });

  // Y-axis: price (Marshallian convention — P on y)
  const yScale = scaleLinear<number>({
    domain: [
      Math.min(...priceValues) - 3,
      Math.max(...priceValues) + 3,
    ],
    range: [yMax, 0],
    nice: true,
  });

  // Bubble radius: smaller range for state view (many more points)
  const rRange: [number, number] = rRangeOverride ?? (granularity === "state" ? [6, 28] : [14, 48]);
  const rScale = scaleSqrt<number>({
    domain: [Math.min(...peakValues), Math.max(...peakValues)],
    range: rRange,
  });

  return { xScale, yScale, rScale, xMax, yMax };
}
