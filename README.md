# Electricity Supply Response

Interactive scatter chart comparing wholesale electricity prices vs. new generation capacity across US ISOs/RTOs. Inspired by Owen Zidar's housing economics work (rents vs. building permits across metros).

**Thesis**: Structural barriers to building new generation — queue dysfunction, permitting friction, multi-state coordination — are a key structural factor behind persistently high electricity prices, alongside fuel mix exposure, pipeline constraints, and carbon policy costs. ISOs that build easily (ERCOT, MISO) tend toward lower prices; ISOs that can't build (ISO-NE, NYISO) stay expensive.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173. The chart renders immediately using the curated dataset in `data/verified/iso_scatter_data.json`.

## Regenerating Data

The curated JSON is committed so the chart works out of the box. To regenerate from raw sources:

### 1. Download raw files

Place in `data/raw/`:

| File | Source | URL |
|------|--------|-----|
| EIA wholesale prices | EIA Wholesale Market data | eia.gov → Electricity → Wholesale Markets |
| EIA-860M | Monthly generator inventory | eia.gov/electricity/data/eia860m/ |
| LBNL Queued Up | Interconnection queue data | emp.lbl.gov/queues |

### 2. Set API key

```bash
export EIA_API_KEY=your_key_here
```

Required for peak demand data (the only metric available via API).

### 3. Run pipeline

```bash
pip install -e .
python data/build_dataset.py
```

The pipeline will skip any source with missing raw files and warn accordingly.

See [METHODOLOGY.md](METHODOLOGY.md) for data sources, calculations, and caveats.

## Tech Stack

- **Chart**: [visx](https://airbnb.io/visx/) (React + D3 primitives) for full SVG control
- **Build**: Vite + TypeScript
- **Data pipeline**: Python + pandas

## Author

Bottlenecks Lab
