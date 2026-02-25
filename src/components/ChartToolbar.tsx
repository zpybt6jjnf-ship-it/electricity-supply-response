import { useState, useRef, useEffect, type RefObject } from "react";
import { FONT } from "../lib/theme";

const DEPLOY_URL =
  "https://bottlenecks-lab.github.io/electricity-supply-response/";

interface Props {
  svgRef: RefObject<SVGSVGElement | null>;
  /** Full width of the chart wrapper for sizing the embed iframe */
  width: number;
  height: number;
}

/* ------------------------------------------------------------------ */
/*  Icons (inline SVG paths)                                          */
/* ------------------------------------------------------------------ */

function DownloadIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function EmbedIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function cloneSvgWithStyles(svg: SVGSVGElement): SVGSVGElement {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  // Walk original + clone in parallel, inline computed styles
  const origEls = svg.querySelectorAll("*");
  const cloneEls = clone.querySelectorAll("*");
  for (let i = 0; i < origEls.length; i++) {
    const cs = getComputedStyle(origEls[i]);
    const target = cloneEls[i] as SVGElement;
    target.setAttribute(
      "style",
      Array.from(cs)
        .map((k) => `${k}:${cs.getPropertyValue(k)}`)
        .join(";"),
    );
  }
  return clone;
}

function serializeSvg(svg: SVGSVGElement): string {
  const clone = cloneSvgWithStyles(svg);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return new XMLSerializer().serializeToString(clone);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadSvg(svg: SVGSVGElement) {
  const xml = serializeSvg(svg);
  downloadBlob(new Blob([xml], { type: "image/svg+xml" }), "chart.svg");
}

function downloadPng(svg: SVGSVGElement) {
  const scale = 2; // retina
  const xml = serializeSvg(svg);
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = svg.clientWidth * scale;
    canvas.height = svg.clientHeight * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    canvas.toBlob((pngBlob) => {
      if (pngBlob) downloadBlob(pngBlob, "chart.png");
    });
  };
  img.src = url;
}

/* ------------------------------------------------------------------ */
/*  Button style                                                      */
/* ------------------------------------------------------------------ */

const btnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "4px 10px",
  border: "1px solid #ddd",
  borderRadius: 4,
  background: "#fff",
  color: "#666",
  fontFamily: FONT.body,
  fontSize: 12,
  cursor: "pointer",
  transition: "all 0.15s ease",
  lineHeight: 1,
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function ChartToolbar({ svgRef, width, height }: Props) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!downloadOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDownloadOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [downloadOpen]);

  function flash(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 1800);
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      flash("Copied!");
    });
  }

  function handleEmbed() {
    const snippet = `<iframe src="${DEPLOY_URL}" width="${width}" height="${height + 120}" style="border:none;"></iframe>`;
    navigator.clipboard.writeText(snippet).then(() => {
      flash("Copied!");
    });
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {/* Download dropdown */}
      <div ref={dropRef} style={{ position: "relative" }}>
        <button
          style={btnStyle}
          onClick={() => setDownloadOpen((v) => !v)}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#aaa";
            e.currentTarget.style.color = "#333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#ddd";
            e.currentTarget.style.color = "#666";
          }}
        >
          <DownloadIcon /> Download
        </button>
        {downloadOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 4px)",
              right: 0,
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 4,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              zIndex: 10,
              minWidth: 100,
            }}
          >
            {(["PNG", "SVG"] as const).map((fmt) => (
              <button
                key={fmt}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "6px 14px",
                  border: "none",
                  background: "transparent",
                  fontFamily: FONT.body,
                  fontSize: 12,
                  color: "#555",
                  textAlign: "left",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                onClick={() => {
                  setDownloadOpen(false);
                  if (!svgRef.current) return;
                  if (fmt === "PNG") downloadPng(svgRef.current);
                  else downloadSvg(svgRef.current);
                }}
              >
                {fmt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Share */}
      <button
        style={btnStyle}
        onClick={handleShare}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#aaa";
          e.currentTarget.style.color = "#333";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#ddd";
          e.currentTarget.style.color = "#666";
        }}
      >
        <ShareIcon /> Share
      </button>

      {/* Embed */}
      <button
        style={btnStyle}
        onClick={handleEmbed}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#aaa";
          e.currentTarget.style.color = "#333";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#ddd";
          e.currentTarget.style.color = "#666";
        }}
      >
        <EmbedIcon /> Embed
      </button>

      {/* Feedback toast */}
      {feedback && (
        <span
          style={{
            fontFamily: FONT.body,
            fontSize: 12,
            color: "#2a9d8f",
            fontWeight: 600,
            marginLeft: 4,
          }}
        >
          {feedback}
        </span>
      )}
    </div>
  );
}
