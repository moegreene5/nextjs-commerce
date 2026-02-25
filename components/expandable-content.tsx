"use client";

import { cn } from "@/utils/cn";
import { type ReactNode, useEffect, useRef, useState } from "react";

type ExpandableContentProps = {
  children: ReactNode;
  className?: string;
  lines?: 1 | 2 | 3 | 4 | 5 | 6;
};

export const ExpandableContent = ({
  children,
  className,
  lines = 2,
}: ExpandableContentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef?.current) return;

    const checkClamp = () => {
      if (!contentRef.current) return;
      const isMoreThanLines =
        contentRef.current.scrollHeight > contentRef.current.clientHeight;
      setIsClamped(isMoreThanLines || isExpanded);
    };

    checkClamp();
    window.addEventListener("resize", checkClamp);
    return () => window.removeEventListener("resize", checkClamp);
  }, [isExpanded]);

  return (
    <div>
      <div
        ref={contentRef}
        style={
          {
            "--lines": lines,
          } as React.CSSProperties
        }
        className={cn(!isExpanded && "line-clamp-(--lines)", className)}
      >
        {children}
      </div>
      {isClamped && (
        <button
          className={cn("bg-transparent text-sm underline font-semibold")}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
};
