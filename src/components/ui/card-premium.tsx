import * as React from "react";
import { cn } from "@/lib/utils";

const CardPremium = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "glass" | "gradient" | "elevated";
  }
>(({ className, variant = "glass", ...props }, ref) => {
  const variants = {
    glass: "bg-card/40 backdrop-blur-md border border-border/50 shadow-elegant",
    gradient: "bg-gradient-to-br from-card via-card to-primary/5 border border-primary/20 shadow-premium",
    elevated: "bg-card border border-border shadow-premium hover:shadow-premium hover:-translate-y-1",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl transition-all duration-300",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
CardPremium.displayName = "CardPremium";

const CardPremiumHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardPremiumHeader.displayName = "CardPremiumHeader";

const CardPremiumTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text",
      className
    )}
    {...props}
  />
));
CardPremiumTitle.displayName = "CardPremiumTitle";

const CardPremiumDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardPremiumDescription.displayName = "CardPremiumDescription";

const CardPremiumContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardPremiumContent.displayName = "CardPremiumContent";

const CardPremiumFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardPremiumFooter.displayName = "CardPremiumFooter";

export {
  CardPremium,
  CardPremiumHeader,
  CardPremiumFooter,
  CardPremiumTitle,
  CardPremiumDescription,
  CardPremiumContent,
};