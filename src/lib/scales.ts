import { scaleLinear, scaleSqrt } from "@visx/scale";
import type { ISODataPoint, XAxisMetric, PriceMetric, CapacityWeighting, CapacityBasis, GranularityLevel } from "./types";
import { capacityPerGwPeak, capacityPerGwPeakElcc, netCapacity } from "./types";

export function getXValue(d: ISODataPoint, metric: XAxisMetric, weighting?: CapacityWeighting, basis?: CapacityBasis): number {
  if (metric === "queue") return d.queue_completion_pct;
  if (basis === "net") {
    const cap = weighting === "elcc"
      ? (d.capacity_additions_elcc_mw ?? d.capacity_additions_mw) - (d.retirements_mw ?? 0)
      : netCapacity(d);
    return cap / d.peak_demand_gw;
  }
  return weighting === "elcc" ? capacityPerGwPeakElcc(d) : capacityPerGwPeak(d);
}

export function getXLabel(metric: XAxisMetric, weighting?: CapacityWeighting, basis?: CapacityBasis): string {
  if (metric === "queue") return "Queue Completion Rate (%)";
  const net = basis === "net" ? "Net " : "";
  return weighting === "elcc"
    ? `${net}New Capacity (ELCC-Weighted MW per GW of System Peak)`
    : `${net}New Capacity (MW per GW of System Peak)`;
}

export function getXSubtitle(metric: XAxisMetric, weighting?: CapacityWeighting, basis?: CapacityBasis): string {
  if (metric === "queue")
    return "Share of Interconnection Requests Reaching Commercial Operation";
  const net = basis === "net" ? "Net " : "";
  return weighting === "elcc"
    ? `${net}ELCC-Estimated Effective Capacity Reaching Commercial Operation (MW per GW of System Peak)`
    : `Annual ${net}New Generation Reaching Commercial Operation (MW per GW of System Peak)`;
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
    ? "All-In Price ($/MWh, Energy + Capacity, DA/RT mix)"
    : "Average Wholesale Price ($/MWh, DA/RT mix)";
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
  domainData?: ISODataPoint[],
  basis?: CapacityBasis,
) {
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const forDomain = domainData ?? data;
  const xValues = forDomain.map((d) => getXValue(d, metric, weighting, basis));
  const priceValues = forDomain.map((d) => getYValue(d, priceMetric, granularity));
  const peakValues = forDomain.map((d) => d.peak_demand_gw);

  // X-axis: capacity metric (supply response)
  const xMin = Math.min(...xValues);
  const xRawMax = Math.max(...xValues) * 1.15;
  const xDomainMax = granularity === "state" ? Math.min(xRawMax, 240) : xRawMax;
  // Allow negative domain when net capacity is negative
  const xDomainMin = basis === "net" && xMin < 0 ? xMin * 1.3 : 0;
  const xScale = scaleLinear<number>({
    domain: [xDomainMin, xDomainMax],
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
