import { ElectricityScatter } from "./components/ElectricityScatter";
import isoDataset from "../data/verified/iso_scatter_data.json";
import stateDataset from "../data/verified/state_scatter_data.json";
import type { ISOScatterDataset, ISODataPoint } from "./lib/types";

const isoData = isoDataset as ISOScatterDataset;
const stateData = stateDataset as { metadata: ISOScatterDataset["metadata"]; states: ISODataPoint[] };

export default function App() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "20px 12px",
        minHeight: "100vh",
        background: "#fff",
      }}
    >
      <ElectricityScatter
        isoData={isoData.isos}
        stateData={stateData.states}
      />
    </div>
  );
}
