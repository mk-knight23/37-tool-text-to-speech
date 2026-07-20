"use client";

import { useEffect, useState, useRef } from "react";

interface ReadingRulerProps {
  show: boolean;
  followMode: "cursor" | "sentence";
  activeIndex: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function ReadingRuler({
  show,
  followMode,
  activeIndex,
  containerRef,
}: ReadingRulerProps) {
  const [top, setTop] = useState<number | null>(null);
  const [height, setHeight] = useState<number>(32);
  const rulerRef = useRef<HTMLDivElement>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!show || !containerRef.current) {
      setTop(null);
      return;
    }

    const container = containerRef.current;

    // Follow Sentence Mode
    if (followMode === "sentence") {
      if (activeIndex < 0) {
        setTop(null);
        return;
      }
      const activeEl = container.querySelector(
        `[data-sentence-index="${activeIndex}"]`
      ) as HTMLElement;

      if (activeEl) {
        const updatePosition = () => {
          const containerRect = container.getBoundingClientRect();
          const elRect = activeEl.getBoundingClientRect();
          const topPos = elRect.top - containerRect.top + container.scrollTop;
          setTop(topPos);
          setHeight(elRect.height + 4); // Add padding
        };

        updatePosition();
        // Recalculate on window resize or scroll
        window.addEventListener("resize", updatePosition);
        container.addEventListener("scroll", updatePosition);
        return () => {
          window.removeEventListener("resize", updatePosition);
          container.removeEventListener("scroll", updatePosition);
        };
      } else {
        setTop(null);
      }
      return;
    }

    // Follow Cursor Mode
    const handleMouseMove = (e: MouseEvent) => {
      const containerRect = container.getBoundingClientRect();
      const relativeY = e.clientY - containerRect.top + container.scrollTop;
      // Clamp within the container boundaries
      if (relativeY >= 0 && relativeY <= container.scrollHeight) {
        setTop(relativeY - height / 2);
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, [show, followMode, activeIndex, containerRef, height]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!show || top === null) return null;

  return (
    <div
      ref={rulerRef}
      className="pointer-events-none absolute left-0 right-0 z-10 bg-accent/15 border-y-2 border-accent/40 mix-blend-multiply dark:mix-blend-screen transition-all duration-150"
      style={{
        top: `${top}px`,
        height: `${height}px`,
      }}
    />
  );
}
