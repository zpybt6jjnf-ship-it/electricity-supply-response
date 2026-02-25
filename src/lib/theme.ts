/** Academic economics chart aesthetic — serif titles, clean axes */

export const FONT = {
  title: "Georgia, 'Times New Roman', serif",
  body: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  brand: "'Space Mono', 'Courier New', monospace",
};

export const AXIS_STYLE = {
  tickLabelProps: {
    fontFamily: FONT.body,
    fontSize: 12,
    fill: "#555",
  },
  labelProps: {
    fontFamily: FONT.body,
    fontSize: 13,
    fill: "#333",
    fontWeight: 500,
  },
  strokeColor: "#ccc",
  tickStroke: "#ccc",
};

export const GRID_STYLE = {
  stroke: "#e8e8e8",
  strokeDasharray: "2 3",
};
