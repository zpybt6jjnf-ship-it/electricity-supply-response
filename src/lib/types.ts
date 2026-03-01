export type ColorGroup = "functional" | "intermediate" | "broken";

export type GranularityLevel = "iso" | "state";

export type XAxisMetric = "capacity" | "queue";

export type PriceMetric = "energy" | "all_in";

export type CapacityWeighting = "nameplate" | "elcc";

export type CapacityBasis = "gross" | "net";

export type ViewTab = "capacity" | "queue" | "state";

export interface ISODataPoint {
  id: string;
  name: string;
  region: string;
  wholesale_price_mwh: number;
  all_in_price_mwh: number;
  capacity_additions_mw: number;
  capacity_additions_elcc_mw?: number;
  retirements_mw?: number;
  project_count: number;
  peak_demand_gw: number;
  queue_completion_pct: number;
  queue_cohort?: string;
  price_2023_mwh?: number;
  retail_price_cents_kwh?: number;
  isEstimate?: boolean;
  confidence?: string;
  color_group: ColorGroup;
  avg_queue_duration_months?: number;
  qualitative_note: string;
  sources: {
    price: string;
    capacity: string;
    peak: string;
    queue: string;
  };
}

export interface ISOScatterDataset {
  metadata: {
    title: string;
    author: string;
    compiled: string;
    primary_year: number;
    notes: string;
  };
  isos: ISODataPoint[];
}

/** Net capacity additions (gross minus retirements), falls back to gross */
export function netCapacity(d: ISODataPoint): number {
  return d.retirements_mw != null
    ? d.capacity_additions_mw - d.retirements_mw
    : d.capacity_additions_mw;
}

/** Derived metric: MW of new capacity per GW of system peak */
export function capacityPerGwPeak(d: ISODataPoint): number {
  return d.capacity_additions_mw / d.peak_demand_gw;
}

/** Derived metric: ELCC-weighted capacity per GW of system peak */
export function capacityPerGwPeakElcc(d: ISODataPoint): number {
  return (d.capacity_additions_elcc_mw ?? d.capacity_additions_mw) / d.peak_demand_gw;
}

