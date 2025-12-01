import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonPremiumVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:scale-105 shadow-lg",
        "glass-primary": "bg-primary/10 backdrop-blur-md border border-primary/30 text-primary hover:bg-primary/20 hover:scale-105 shadow-lg hover:shadow-primary/20",
        gradient: "bg-gradient-to-r from-primary to-primary-glow text-white hover:opacity-90 hover:scale-105 shadow-premium",
        "gradient-secondary": "bg-gradient-to-r from-secondary to-orange-400 text-white hover:opacity-90 hover:scale-105 shadow-lg",
        shimmer: "relative bg-gradient-to-r from-primary via-primary-glow to-primary bg-[length:200%_auto] text-white hover:bg-right-top hover:scale-105 shadow-premium animate-shimmer",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "gradient",
      size: "default",
    },
  }
);

export interface ButtonPremiumProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonPremiumVariants> {
  asChild?: boolean;
}

const ButtonPremium = React.forwardRef<HTMLButtonElement, ButtonPremiumProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonPremiumVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
ButtonPremium.displayName = "ButtonPremium";

export { ButtonPremium, buttonPremiumVariants };