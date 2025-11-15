import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>;

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, value, ...rest }, ref) => {
  // Radix slider value is number[]; if consumer passes undefined we treat as single thumb.
  const values: number[] = Array.isArray(value) ? value : (typeof value === 'number' ? [value] : []);
  const thumbCount = values.length > 1 ? values.length : 1;
  return (
    <SliderPrimitive.Root
      ref={ref}
      value={value}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...rest}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-[hsl(var(--aqua))]/70" />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block h-5 w-5 rounded-full border-2 border-[hsl(var(--aqua))] bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
