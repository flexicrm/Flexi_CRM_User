import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Select from "react-select";
import type { StylesConfig } from "react-select";

// --- Types ---
export interface SelectOption {
  label: string;
  value: string | number;
  [key: string]: any;
}

interface ReusableFieldsProps {
  type?: "text" | "password" | "email" | "number" | "date" | "select" | "textarea";
  label?: string;
  name: string;
  value: any;
  onChange: (e: any) => void;
  placeholder?: string;
  options?: SelectOption[];
  labelKey?: string;
  valueKey?: string;
  apiEndpoint?: string | null;
  error?: string;
  isActive?: boolean;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  passwordValidation?: boolean;
  searchable?: boolean;
}

const Reusable_Fields: React.FC<ReusableFieldsProps> = ({
  type = "text",
  label,
  name,
  value,
  onChange,
  placeholder,
  options = [],
  labelKey = "label",
  valueKey = "value",
  apiEndpoint = null,
  error: externalError,
  isActive = false,
  required = false,
  className = "",
  disabled = false,
  passwordValidation = false,
  searchable = true,
}) => {
  // States
  const [dynamicOptions, setDynamicOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [internalError, setInternalError] = useState('');

  const error = externalError || internalError;

  // API Fetching for Select
  useEffect(() => {
    if (apiEndpoint && type === "select") {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await fetch(apiEndpoint);
          const data = await response.json();
          // Map dynamic data to standard Option format
          const formatted = data.map((item: any) => ({
            label: item[labelKey],
            value: item[valueKey]
          }));
          setDynamicOptions(formatted);
        } catch (err) {
          console.error("Input API Error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [apiEndpoint, type, labelKey, valueKey]);

  // Password Validation Logic
  useEffect(() => {
    if (type === "password" && passwordValidation && value) {
      const minLength = 8;
      const hasLower = /[a-z]/.test(value);
      const hasUpper = /[A-Z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecial = /[!@#$%^&*]/.test(value);

      if (value.length < minLength) {
        setInternalError(`Min ${minLength} characters required`);
      } else if (!hasLower || !hasUpper || !hasNumber || !hasSpecial) {
        setInternalError('Need Uppercase, Lowercase, Number & Special Char');
      } else {
        setInternalError('');
      }
    } else {
      setInternalError('');
    }
  }, [value, type, passwordValidation]);

  const finalOptions = apiEndpoint ? dynamicOptions : options;

  // Floating Label Calculation
  const hasValue = value !== undefined && value !== null && value.toString().length > 0;
  const isFloating = isFocused || hasValue || type === "date" || type === "select" || isActive;

  // --- React Select Custom Styles ---
  const customSelectStyles: StylesConfig<SelectOption, false> = {
    control: (base, state) => ({
      ...base,
      minHeight: '45px',
      borderRadius: '12px',
      borderWidth: '1px',
      backgroundColor: 'transparent',
      borderColor: error ? '#ef4444' : state.isFocused ? '#1a2a6c' : '#e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 4px rgba(26, 42, 108, 0.05)' : 'none',
      '&:hover': {
        borderColor: error ? '#ef4444' : '#1a2a6c'
      },
      transition: 'all 0.3s ease'
    }),
    placeholder: (base) => ({ ...base, fontSize: '14px', color: '#94a3b8' }),
    menu: (base) => ({
      ...base,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f1f5f9',
      zIndex: 100
    }),
    option: (base, state) => ({
      ...base,
      fontSize: '14px',
      padding: '10px 15px',
      backgroundColor: state.isSelected ? '#1a2a6c' : state.isFocused ? '#f8fafc' : 'white',
      color: state.isSelected ? 'white' : '#475569',
      cursor: 'pointer'
    })
  };

  const inputBaseStyles = `
    w-full px-4 py-3 rounded-xl border text-sm transition-all duration-300 outline-none bg-white/50
    ${error 
      ? "border-red-500 focus:ring-red-50" 
      : "border-slate-200 focus:border-[#1a2a6c] focus:ring-4 focus:ring-indigo-500/5 hover:border-slate-300"
    }
    ${disabled ? "bg-slate-50 cursor-not-allowed opacity-60" : ""}
  `;

  return (
    <div className={`relative w-full group ${className}`}>
      {/* Label */}
      {label && (
        <label 
          className={`absolute left-3 transition-all duration-200 pointer-events-none z-10 px-2
          ${isFloating 
            ? "-top-2.5 text-[11px] font-bold bg-white translate-y-0" 
            : "top-1/2 -translate-y-1/2 text-sm bg-transparent"}
          ${error ? "text-red-500" : isFocused ? "text-[#1a2a6c]" : "text-slate-400"}
          ${disabled ? "bg-transparent" : ""}
        `}>
          {label.toUpperCase()} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      <div className="relative">
        {type === "select" ? (
          <Select
            name={name}
            options={finalOptions}
            isDisabled={disabled || loading}
            isLoading={loading}
            isSearchable={searchable}
            placeholder={isFocused ? placeholder : ""}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            styles={customSelectStyles}
            value={finalOptions.find(opt => opt.value === value) || null}
            onChange={(selected) => {
              onChange({ target: { name, value: selected ? selected.value : "" } });
            }}
          />
        ) : type === "textarea" ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={isFocused ? placeholder : ""}
            className={`${inputBaseStyles} min-h-[100px] resize-none`}
          />
        ) : (
          <div className="relative">
            <input
              type={type === "password" ? (showPassword ? "text" : "password") : type}
              name={name}
              value={value}
              onChange={onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
              placeholder={isFocused ? placeholder : ""}
              className={inputBaseStyles}
            />
            
            {/* Password Toggle Icon */}
            {type === "password" && (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1a2a6c] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}

            {/* Loading Spinner for async actions */}
            {loading && type !== "select" && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 size={16} className="animate-spin text-slate-400" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message with Animation */}
      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-[10px] text-red-500 font-bold mt-1.5 ml-2 uppercase tracking-wider"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reusable_Fields;