import { useState, useCallback, useMemo } from "react";
import { FONT, COLOR } from "../lib/theme";
import csvRaw from "../../data/audit_all_data.csv?raw";

/** Columns to display in the audit table (order matters). */
const DISPLAY_COLUMNS = [
  "view",
  "year",
  "id",
  "name",
  "region",
  "is_estimate",
  "color_group",
  "siting_regime",
  "wholesale_price_mwh",
  "all_in_price_mwh",
  "retail_price_cents_kwh",
  "price_2023_mwh",
  "capacity_additions_mw",
  "capacity_additions_elcc_mw",
  "retirements_mw",
  "project_count",
  "peak_demand_gw",
  "queue_completion_pct",
  "queue_cohort",
  "avg_queue_duration_months",
  "source_price",
  "source_capacity",
  "source_peak",
  "source_queue",
  "qualitative_note",
] as const;

const HEADER_LABELS: Record<string, string> = {
  view: "View",
  year: "Year",
  id: "ID",
  name: "Name",
  region: "Region",
  is_estimate: "Estimate?",
  color_group: "Color Group",
  siting_regime: "Siting Regime",
  confidence: "Confidence",
  wholesale_price_mwh: "Wholesale ($/MWh)",
  all_in_price_mwh: "All-In ($/MWh)",
  retail_price_cents_kwh: "Retail (¢/kWh)",
  price_2023_mwh: "Prior Year ($/MWh)",
  capacity_additions_mw: "Capacity Added (MW)",
  capacity_additions_elcc_mw: "Capacity ELCC (MW)",
  retirements_mw: "Retirements (MW)",
  project_count: "Projects",
  peak_demand_gw: "Peak Demand (GW)",
  queue_completion_pct: "Queue Completion (%)",
  queue_cohort: "Queue Cohort",
  avg_queue_duration_months: "Avg Queue (mo)",
  qualitative_note: "Notes",
  source_price: "Source: Price",
  source_capacity: "Source: Capacity",
  source_peak: "Source: Peak",
  source_queue: "Source: Queue",
};

/** Columns that hold numeric data — right-align them. */
const NUMERIC_COLS = new Set([
  "year",
  "wholesale_price_mwh",
  "all_in_price_mwh",
  "retail_price_cents_kwh",
  "price_2023_mwh",
  "capacity_additions_mw",
  "capacity_additions_elcc_mw",
  "retirements_mw",
  "project_count",
  "peak_demand_gw",
  "queue_completion_pct",
  "avg_queue_duration_months",
]);

/** Parse the raw CSV into header + rows. Handles quoted fields with commas. */
function parseCsv(raw: string): { headers: string[]; rows: string[][] } {
  const lines = raw.trim().split("\n");
  const parse = (line: string): string[] => {
    const fields: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuote) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') {
          inQuote = false;
        } else {
          cur += ch;
        }
      } else {
        if (ch === '"') {
          inQuote = true;
        } else if (ch === ",") {
          fields.push(cur);
          cur = "";
        } else {
          cur += ch;
        }
      }
    }
    fields.push(cur);
    return fields;
  };
  const headers = parse(lines[0]);
  const rows = lines.slice(1).map(parse);
  return { headers, rows };
}

export function downloadCsv() {
  const blob = new Blob([csvRaw], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "electricity_supply_response_data.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function SourceDataTable() {
  const [open, setOpen] = useState(false);

  const { headers, rows } = useMemo(() => parseCsv(csvRaw), []);

  /** Map column name → index for fast lookup. */
  const colIndex = useMemo(() => {
    const map = new Map<string, number>();
    headers.forEach((h, i) => map.set(h, i));
    return map;
  }, [headers]);

  const handleToggle = useCallback(() => setOpen((v) => !v), []);

  return (
    <div>
      <button
        onClick={handleToggle}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          fontFamily: FONT.body,
          fontSize: 11,
          fontWeight: 500,
          color: COLOR.text.secondary,
          display: "flex",
          alignItems: "center",
          gap: 6,
          transition: "color 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = COLOR.text.primary)}
        onMouseLeave={(e) => (e.currentTarget.style.color = COLOR.text.secondary)}
      >
        <span style={{ fontSize: 9, color: COLOR.text.muted, width: 8, textAlign: "center" }}>{open ? "▼" : "▶"}</span>
        Source Data
      </button>

      {open && (
        <div
          style={{
            marginTop: 8,
            marginBottom: 12,
            overflowX: "auto",
            maxHeight: 480,
            overflowY: "auto",
            border: "1px solid " + COLOR.border.light,
            borderRadius: 8,
          }}
        >
          <table
            style={{
              borderCollapse: "collapse",
              fontFamily: FONT.body,
              fontSize: 11,
              whiteSpace: "nowrap",
            }}
          >
            <thead>
              <tr>
                {DISPLAY_COLUMNS.map((col) => (
                  <th
                    key={col}
                    style={{
                      position: "sticky",
                      top: 0,
                      background: COLOR.surface.muted,
                      borderBottom: "2px solid " + COLOR.border.default,
                      padding: "8px 10px",
                      textAlign: NUMERIC_COLS.has(col) ? "right" : "left",
                      fontWeight: 600,
                      color: COLOR.text.secondary,
                      zIndex: 1,
                    }}
                  >
                    {HEADER_LABELS[col] ?? col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    background: ri % 2 === 0 ? "#fff" : COLOR.surface.subtle,
                  }}
                >
                  {DISPLAY_COLUMNS.map((col) => {
                    const idx = colIndex.get(col);
                    const val = idx !== undefined ? row[idx] : "";
                    const isSourceCol = col.startsWith("source_") || col === "qualitative_note";
                    return (
                      <td
                        key={col}
                        title={isSourceCol ? val : undefined}
                        style={{
                          borderBottom: "1px solid " + COLOR.border.light,
                          padding: "5px 10px",
                          textAlign: NUMERIC_COLS.has(col) ? "right" : "left",
                          color: COLOR.text.tertiary,
                          maxWidth: isSourceCol ? 280 : undefined,
                          overflow: isSourceCol ? "hidden" : undefined,
                          textOverflow: isSourceCol ? "ellipsis" : undefined,
                        }}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
