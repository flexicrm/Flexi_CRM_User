import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import React from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | string;

interface ReusableButtonProps extends HTMLMotionProps<"button"> {
  text?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const Reusable_Button: React.FC<ReusableButtonProps> = ({
  text,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) => {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-[#0d1954] text-white shadow-md shadow-indigo-900/20 hover:bg-[#1a2a6c]",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    outline: "bg-transparent text-slate-700 border border-slate-200 hover:border-[#1a2a6c] hover:text-[#1a2a6c]",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-100",
  };

  const sizeStyles: Record<string, string> = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const appliedSize = sizeStyles[size as keyof typeof sizeStyles] || size;
  const isInteractive = !disabled && !isLoading;

  return (
    <motion.button
      whileHover={isInteractive ? { 
        y: -2, 
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      } : {}}
      whileTap={isInteractive ? { 
        scale: 0.97,
        transition: { duration: 0.1, ease: "easeIn" }
      } : {}}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      disabled={isLoading || disabled}
      className={`
        relative inline-flex items-center justify-center
        rounded-md font-semibold tracking-wide
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-indigo-500/20
        focus:ring-offset-2 focus:ring-offset-white
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer active:cursor-pointer
        overflow-hidden select-none
        ${variants[variant]}
        ${appliedSize}
        ${fullWidth ? "w-full" : "w-auto"}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      {...props}
    >
      {/* Ripple effect on click */}
      {isInteractive && variant === "primary" && (
        <motion.div
          initial={{ scale: 0, opacity: 0.5 }}
          whileTap={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-white/20 rounded-full"
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* Shine effect on hover */}
      {isInteractive && variant === "primary" && (
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          whileHover={{ x: "100%", opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
          style={{ pointerEvents: "none" }}
        />
      )}

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex items-center justify-center bg-inherit z-10"
          >
            <Loader2 className="w-4 h-4 animate-spin text-current" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className={`relative z-10 flex items-center gap-2 ${isLoading ? "opacity-0" : "opacity-100"}`}
        animate={isLoading ? { scale: 0.9 } : { scale: 1 }}
        transition={{ duration: 0.15 }}
      >
        {icon && iconPosition === "left" && (
          <motion.span 
            className="flex-shrink-0"
            whileHover={isInteractive ? { rotate: 5, scale: 1.1 } : {}}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.span>
        )}
        {text && <span className="whitespace-nowrap">{text}</span>}
        {icon && iconPosition === "right" && (
          <motion.span 
            className="flex-shrink-0"
            whileHover={isInteractive ? { rotate: -5, scale: 1.1 } : {}}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.span>
        )}
      </motion.div>
    </motion.button>
  );
};

export default Reusable_Button;