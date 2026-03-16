import { Progress } from "@/components/ui/progress";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format-price";
import { Check } from "lucide-react";

function FreeShippingProgress({
  subtotal,
  showLabel = false,
}: {
  subtotal: number;
  showLabel?: boolean;
}) {
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const isFree = subtotal >= FREE_SHIPPING_THRESHOLD;

  const labelText = isFree
    ? "You've unlocked free shipping!"
    : `${formatPrice(remaining)} away from free shipping`;

  return (
    <div
      className="flex flex-col gap-2"
      role="group"
      aria-label="Free shipping progress"
    >
      {showLabel && (
        <p className="text-xs md:text-sm font-semibold text-center">
          {isFree ? <span>{labelText}</span> : labelText}
        </p>
      )}

      <div className="relative flex items-center pr-3">
        <div className="relative w-full bg-gray-200">
          <Progress
            value={progress}
            className="h-2.5"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={labelText}
          />
          <div
            className={cn(
              "absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 size-6 rounded-full flex items-center justify-center transition-colors duration-300 ring-2 ring-background",
              isFree ? "bg-foreground" : "bg-muted-foreground/30",
            )}
            aria-hidden="true"
          >
            <Check
              className={cn(
                "size-4 transition-colors duration-300",
                isFree ? "text-white" : "text-muted-foreground/50",
              )}
              strokeWidth={3}
            />
          </div>
        </div>
      </div>

      <span className="sr-only">{labelText}</span>
    </div>
  );
}

export default FreeShippingProgress;
