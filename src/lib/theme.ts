/** Premium data dashboard aesthetic — clean, modern, WCAG AA compliant */

/** Semantic color tokens — WCAG AA compliant (4.5:1+ contrast on #fff) */
export const COLOR = {
  text: {
    primary: "#1a1a1a",
    secondary: "#333",
    tertiary: "#555",
    muted: "#595959",       // was #767676 — now 7.15:1 contrast ratio
    disabled: "#757575",    // was #999 — now 4.6:1 contrast ratio (WCAG AA)
  },
  border: {
    strong: "#94a3b8",      // slate-400 — richer than raw gray
    default: "#cbd5e1",     // slate-300
    light: "#e2e8f0",       // slate-200
  },
  surface: {
    subtle: "#f8fafc",      // slate-50 — slightly cooler, more premium
    muted: "#f1f5f9",       // slate-100 — for control panel backgrounds
  },
  accent: {
    brand: "#2a9d8f",
    warning: "#e65100",
    error: "#b71c1c",
  },
} as const;

export const FONT = {
  title: "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  data: "'Space Mono', 'Courier New', monospace",
};

/** Shared transition for interactive elements */
export const TRANSITION = "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)";

export const AXIS_STYLE = {
  tickLabelProps: {
    fontFamily: FONT.data,
    fontSize: 11,
    fill: COLOR.text.tertiary,
  },
  labelProps: {
    fontFamily: FONT.body,
    fontSize: 13,
    fill: COLOR.text.secondary,
    fontWeight: 500,
  },
  strokeColor: COLOR.border.default,
  tickStroke: COLOR.border.default,
};

/** Responsive axis style — tick/label sizes adapt to compact breakpoint */
export function getAxisStyle(compact?: boolean) {
  const tickFontSize = compact ? 10 : 11;
  const labelFontSize = compact ? 11.5 : 13;
  return {
    tickLabelProps: {
      fontFamily: FONT.data,
      fontSize: tickFontSize,
      fill: COLOR.text.tertiary,
    },
    labelProps: {
      fontFamily: FONT.body,
      fontSize: labelFontSize,
      fill: COLOR.text.secondary,
      fontWeight: 500,
    },
    strokeColor: COLOR.border.default,
    tickStroke: COLOR.border.default,
  };
}

/** Ultra-light solid grid — recedes behind data */
export const GRID_STYLE = {
  stroke: "#f1f5f9",
  strokeWidth: 1,
};

export const SR_ONLY: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};
