import React, { useEffect, useState } from 'react';
import Select, { type StylesConfig } from 'react-select';

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
  dataKey?: string;
  error?: string;
  isActive?: boolean;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  passwordValidation?: boolean;
  searchable?: boolean;
  icon?: React.ReactNode;
  rows?: number;
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
  dataKey = null,
  isActive = false,
  required = false,
  className = "",
  disabled = false,
  searchable = true,
  icon,
  rows = 3,
  error,
}) => {
  const [dynamicOptions, setDynamicOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  // Fetch dynamic options from API
  useEffect(() => {
    if (apiEndpoint && type === "select") {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await fetch(apiEndpoint);
          const json = await response.json();
          
          let rawData = json.data;
          if (dataKey && json.data && json.data[dataKey]) {
            rawData = json.data[dataKey];
          } else if (!Array.isArray(rawData) && json.data) {
            rawData = json.data;
          }

          const formatted = (Array.isArray(rawData) ? rawData : []).map((item: any) => ({
            label: item[labelKey],
            value: item[valueKey],
            ...item
          }));
          setDynamicOptions(formatted);
        } catch (err) {
          console.log("Input API Error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [apiEndpoint, type, labelKey, valueKey, dataKey]);

  // Handle generic input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e);
  };

  // Custom styles for React Select with gray borders
  const customSelectStyles: StylesConfig<SelectOption, false> = {
    menuPortal: (base) => ({ 
      ...base, 
      zIndex: 999999 
    }),
    control: (base, state) => ({
      ...base,
      minHeight: '48px',
      borderRadius: '12px',
      paddingLeft: icon ? '35px' : '0px',
      // Default light gray border, dark gray on hover, focus stays gray (not blue)
      borderColor: error 
        ? '#ef4444' 
        : state.isFocused 
          ? '#9ca3af' 
          : '#e2e8f0',
      backgroundColor: disabled ? '#f8fafc' : 'white',
      '&:hover': { 
        borderColor: error ? '#ef4444' : '#9ca3af' 
      },
      boxShadow: state.isFocused ? '0 0 0 2px rgba(156, 163, 175, 0.1)' : 'none',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    }),
    option: (base, state) => ({
      ...base,
      padding: '10px 15px',
      fontSize: '14px',
      cursor: 'pointer',
      backgroundColor: state.isSelected 
        ? '#6366f1' 
        : state.isFocused 
        ? '#f1f5f9' 
        : 'white',
      color: state.isSelected ? 'white' : '#1e293b',
      '&:active': { backgroundColor: '#e2e8f0' }
    }),
    placeholder: (base) => ({ ...base, color: '#94a3b8', fontSize: '14px' }),
    singleValue: (base) => ({ ...base, color: '#1e293b', fontSize: '14px' }),
    indicatorSeparator: () => ({ display: 'none' }),
  };

  const hasValue = value !== undefined && value !== null && value.toString().length > 0;
  const isFloating = isFocused || hasValue || type === "date" || menuIsOpen || isActive;

  // Get border color based on state
  const getBorderColor = () => {
    if (error) return 'border-red-500';
    if (isFocused) return 'border-gray-400';
    return 'border-slate-200';
  };

  // Get focus ring color
  const getFocusRing = () => {
    if (error) return 'focus:ring-red-500/20 focus:border-red-500';
    return 'focus:ring-gray-400/20 focus:border-gray-400';
  };

  return (
    <div 
      className={`relative w-full ${className}`} 
      style={{ zIndex: menuIsOpen ? 100 : 1 }}
    >
      {label && (
        <label
          className={`
            absolute transition-all duration-200 pointer-events-none z-[10] px-1 rounded-md
            ${icon && !isFloating ? "left-11" : "left-3"}
            ${isFloating 
              ? "-top-2 text-[11px] font-bold bg-white text-gray-600 translate-y-0" 
              : "top-1/2 -translate-y-1/2 text-sm text-slate-500 bg-transparent"
            }
          `}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center">
        {icon && (
          <div className={`absolute left-4 z-[5] transition-colors ${isFocused ? 'text-gray-500' : 'text-slate-400'}`}>
            {icon}
          </div>
        )}
        
        {type === "select" ? (
          <div className="w-full">
            <Select
              name={name}
              options={apiEndpoint ? dynamicOptions : options}
              isDisabled={disabled || loading}
              isLoading={loading}
              isSearchable={searchable}
              placeholder={isFocused ? placeholder : ""}
              onFocus={() => setIsFocused(true)}
              onBlur={() => { setIsFocused(false); setMenuIsOpen(false); }}
              onMenuOpen={() => setMenuIsOpen(true)}
              onMenuClose={() => setMenuIsOpen(false)}
              styles={customSelectStyles}
              menuPortalTarget={document.body} 
              menuPosition="fixed" 
              value={(apiEndpoint ? dynamicOptions : options).find(opt => opt.value === value) || null}
              onChange={(selected) => {
                onChange({ target: { name, value: selected ? (selected as SelectOption).value : "" } });
              }}
            />
          </div>
        ) : type === "textarea" ? (
          <textarea
            name={name}
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={isFocused ? placeholder : ""}
            rows={rows}
            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none bg-white ${
              error ? 'border-red-500' : getBorderColor()
            } ${getFocusRing()} ${icon ? 'pl-11' : 'pl-4'}`}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={isFocused ? placeholder : ""}
            className={`w-full px-4 h-[48px] rounded-xl border text-sm transition-all outline-none bg-white ${
              error ? 'border-red-500' : getBorderColor()
            } ${getFocusRing()} ${icon ? 'pl-11' : 'pl-4'}`}
          />
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Reusable_Fields;