import { useCallback, useState } from "react";

export function useContainerWidth(): [
  (node: HTMLDivElement | null) => void,
  number,
] {
  const [width, setWidth] = useState(0);
  const [ro] = useState(() => new ResizeObserver(([entry]) => {
    setWidth(entry.contentBoxSize[0].inlineSize);
  }));

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      ro.disconnect();
      if (node) ro.observe(node);
    },
    [ro],
  );

  return [ref, width];
}
