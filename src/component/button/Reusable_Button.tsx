import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import React from 'react';

// --- Types ---
interface ReusableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: string; // Custom tailwind classes like "px-5 py-2"
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Reusable_Button: React.FC<ReusableButtonProps> = ({
  text,
  variant = 'primary',
  size = 'px-3 py-1.5', // Default requested size
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) => {
  
  // 1. Variant Styles Mapping
  const variants = {
    primary: "bg-gradient-to-r from-[#0d1954] to-[#1a2a6c] text-white shadow-md shadow-indigo-900/20 border-none",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-none",
    outline: "bg-transparent text-slate-700 border border-slate-200 hover:border-[#1a2a6c] hover:text-[#1a2a6c]",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50 border-none",
    danger: "bg-rose-500 text-white hover:bg-rose-600 border-none shadow-rose-100"
  };

  // 2. Base Classes
  const baseClasses = `
    relative inline-flex items-center justify-center 
    rounded-xl font-bold text-[13px] tracking-wide 
    transition-colors duration-300 focus:outline-none 
    focus:ring-4 focus:ring-indigo-500/10 
    disabled:opacity-50 disabled:cursor-not-allowed 
    overflow-hidden select-none
  `;

  return (
    <motion.button
      // --- Best Animations ---
      whileHover={{ y: -1.5, filter: "brightness(1.1)" }}
      whileTap={{ scale: 0.94 }}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      
      disabled={isLoading || disabled}
      className={`
        ${baseClasses} 
        ${variants[variant]} 
        ${size} 
        ${fullWidth ? 'w-full' : 'w-auto'} 
        ${className}
      `}
      {...props}
    >
      {/* Shiny Glare Effect (Only for Primary) */}
      {variant === 'primary' && !disabled && !isLoading && (
        <motion.div
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        />
      )}

      {/* Loading State Overlay */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-inherit z-10"
          >
            <Loader2 className="w-4 h-4 animate-spin text-current" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button Content */}
      <div className={`relative z-10 flex items-center gap-2 cursor-pointer ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
        
        <span className="whitespace-nowrap">{text}</span>
        
        {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
      </div>
    </motion.button>
  );
};

export default Reusable_Button;