import { cn } from "@/utils/cn";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className }: Props) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-375 px-page min-h-[calc(100svh-66px)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
