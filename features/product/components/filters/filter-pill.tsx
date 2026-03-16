import { cn } from "@/utils/cn";

export const pillBase =
  "inline-flex items-center gap-1.5 text-sm border rounded-sm px-3 py-1.5 transition-colors cursor-pointer select-none";
export const pillIdle = "border-border bg-white hover:border-foreground/50";
export const pillActive = "border-foreground bg-foreground text-background";

interface FilterPillProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  count?: number;
  children: React.ReactNode;
}

export function FilterPill({
  active,
  count,
  children,
  className,
  ...props
}: FilterPillProps) {
  return (
    <button
      type="button"
      className={cn(pillBase, active ? pillActive : pillIdle, className)}
      {...props}
    >
      {children}
      {count != null && count > 0 && (
        <span
          className={cn(
            "text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center",
            active
              ? "bg-background text-foreground"
              : "bg-foreground text-background",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
