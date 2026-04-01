// import { AnimatePresence, motion } from "framer-motion";
// import { Loader2 } from "lucide-react";
// import React from "react";

// // Variants type
// type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

// // Size type (optional strict control)
// type ButtonSize = "sm" | "md" | "lg" | string;

// // Props interface
// interface ReusableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   text: string;
//   variant?: ButtonVariant;
//   size?: ButtonSize;
//   isLoading?: boolean;
//   icon?: React.ReactNode;
//   iconPosition?: "left" | "right";
//   fullWidth?: boolean;
// }

// const Reusable_Button: React.FC<ReusableButtonProps> = ({
//   text,
//   variant = "primary",
//   size = "md",
//   isLoading = false,
//   icon,
//   iconPosition = "left",
//   fullWidth = false,
//   className = "",
//   disabled,
//   ...props
// }) => {
//   // Variant styles
//   const variants: Record<ButtonVariant, string> = {
//     primary:
//       "bg-gradient-to-r from-[#0d1954] to-[#1a2a6c] text-white shadow-md shadow-indigo-900/20",
//     secondary:
//       "bg-slate-100 text-slate-700 hover:bg-slate-200",
//     outline:
//       "bg-transparent text-slate-700 border border-slate-200 hover:border-[#1a2a6c] hover:text-[#1a2a6c]",
//     ghost:
//       "bg-transparent text-slate-500 hover:bg-slate-50",
//     danger:
//       "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-100",
//   };

//   // Size styles
//   const sizeStyles: Record<string, string> = {
//     sm: "px-2 py-1 text-xs",
//     md: "px-3 py-1.5 text-sm",
//     lg: "px-5 py-2 text-base",
//   };

//   const appliedSize = sizeStyles[size as keyof typeof sizeStyles] || size; // allow custom tailwind too

//   // Base styles
//   const baseClasses = `
//     relative inline-flex items-center justify-center
//     rounded-xl font-bold tracking-wide
//     transition-all duration-300
//     focus:outline-none focus:ring-4 focus:ring-indigo-500/10
//     disabled:opacity-50 disabled:cursor-not-allowed
//     overflow-hidden select-none
//   `;

//   // Check if button is interactive
//   const isInteractive = !disabled && !isLoading;

//   return (
//     <motion.button
//       whileHover={isInteractive ? { y: -1.5, filter: "brightness(1.1)" } : {}}
//       whileTap={isInteractive ? { scale: 0.94 } : {}}
//       initial={{ opacity: 0, y: 5 }}
//       animate={{ opacity: 1, y: 0 }}
//       disabled={isLoading || disabled}
//       className={`
//         ${baseClasses}
//         ${variants[variant]}
//         ${appliedSize}
//         ${fullWidth ? "w-full" : "w-auto"}
//         ${className}
//       `.replace(/\s+/g, ' ').trim()}
//       {...props}
//     >
//       {/* Shine Effect */}
//       {variant === "primary" && isInteractive && (
//         <motion.div
//           initial={{ x: "-100%" }}
//           whileHover={{ x: "100%" }}
//           transition={{ duration: 0.6, ease: "easeInOut" }}
//           className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
//         />
//       )}

//       {/* Loader */}
//       <AnimatePresence mode="wait">
//         {isLoading && (
//           <motion.div
//             key="loader"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="absolute inset-0 flex items-center justify-center bg-inherit z-10"
//           >
//             <Loader2 className="w-4 h-4 animate-spin text-current" />
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Content */}
//       <div
//         className={`
//           relative z-10 flex items-center gap-2
//           ${isLoading ? "opacity-0" : "opacity-100"}
//         `.replace(/\s+/g, ' ').trim()}
//       >
//         {icon && iconPosition === "left" && (
//           <span className="flex-shrink-0">{icon}</span>
//         )}

//         <span className="whitespace-nowrap">{text}</span>

//         {icon && iconPosition === "right" && (
//           <span className="flex-shrink-0">{icon}</span>
//         )}
//       </div>
//     </motion.button>
//   );
// };

// export default Reusable_Button;

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import React from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | string;

interface ReusableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string; // <-- Made optional to clear TypeScript errors for icon-only buttons
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
      whileHover={isInteractive ? { y: -1 } : {}}
      whileTap={isInteractive ? { scale: 0.96 } : {}}
      disabled={isLoading || disabled}
      className={`
        relative inline-flex items-center justify-center
        rounded-md font-semibold tracking-wide
        transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-indigo-500/20
        disabled:opacity-50 disabled:cursor-not-allowed
        overflow-hidden select-none
        ${variants[variant]}
        ${appliedSize}
        ${fullWidth ? "w-full" : "w-auto"}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      {...props}
    >
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-inherit z-10"
          >
            <Loader2 className="w-4 h-4 animate-spin text-current" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`relative z-10 flex items-center gap-2 ${isLoading ? "opacity-0" : "opacity-100"}`}>
        {icon && iconPosition === "left" && <span className="flex-shrink-0">{icon}</span>}
        {text && <span className="whitespace-nowrap">{text}</span>}
        {icon && iconPosition === "right" && <span className="flex-shrink-0">{icon}</span>}
      </div>
    </motion.button>
  );
};

export default Reusable_Button;