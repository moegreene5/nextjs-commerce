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
        "mx-auto w-full max-w-375 px-4 sm:px-6 lg:px-8 xl:px-12",
        className,
      )}
    >
      {children}
    </div>
  );
}
