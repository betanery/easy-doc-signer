import logoImage from "@/assets/mdsign-logo.png";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className = "", showText = true, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={logoImage} 
        alt="MDSign Logo" 
        className={`${sizeClasses[size]} w-auto`}
      />
      {showText && (
        <div className="flex flex-col">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            MDSign
          </span>
        </div>
      )}
    </div>
  );
};