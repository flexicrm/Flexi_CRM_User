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
  dataKey?: string; // NEW: To handle nested API data like "users" or "leadSources"
  error?: string;
  isActive?: boolean;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  passwordValidation?: boolean;
  searchable?: boolean;
  icon?: React.ReactNode;
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
}) => {
  const [dynamicOptions, setDynamicOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (apiEndpoint && type === "select") {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await fetch(apiEndpoint);
          const json = await response.json();
          
          // Logic to find the array based on dataKey
          let rawData = json.data;
          if (dataKey && json.data && json.data[dataKey]) {
            rawData = json.data[dataKey];
          } else if (!Array.isArray(rawData) && json.data) {
             rawData = json.data; // fallback
          }

          const formatted = (Array.isArray(rawData) ? rawData : []).map((item: any) => ({
            label: item[labelKey],
            value: item[valueKey]
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

  // ... (Rest of your style logic remains same)
  const customSelectStyles: StylesConfig<SelectOption, false> = {
    control: (base) => ({
      ...base,
      minHeight: '48px',
      borderRadius: '12px',
      paddingLeft: icon ? '35px' : '5px',
      borderWidth: '1px',
      backgroundColor: 'transparent',
      transition: 'all 0.3s ease'
    }),
  };

  const inputBaseStyles = `w-full px-4 py-3 rounded-xl border text-sm transition-all duration-300 outline-none bg-white ${icon ? 'pl-11' : 'pl-4'}  ${disabled ? "bg-slate-50 cursor-not-allowed opacity-60" : ""}`;

  const hasValue = value !== undefined && value !== null && value.toString().length > 0;
  const isFloating = isFocused || hasValue || type === "date" || type === "select" || isActive;

  return (
    <div className={`relative w-full group ${className}`}>
      {label && (
        <label className={`absolute transition-all duration-200 pointer-events-none z-10 px-2 ${icon ? "left-10" : "left-3"} ${isFloating ? "-top-2.5 !left-3 text-[11px] font-bold bg-white translate-y-0" : "top-1/2 -translate-y-1/2 text-sm bg-transparent"} `}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <div className={`absolute left-4 z-10 ${isFocused ? 'text-[#1a2a6c]' : 'text-slate-400'}`}>{icon}</div>}
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
              onBlur={() => setIsFocused(false)}
              styles={customSelectStyles}
              value={(apiEndpoint ? dynamicOptions : options).find(opt => opt.value === value) || null}
              onChange={(selected) => onChange({ target: { name, value: selected ? selected.value : "" } })}
            />
          </div>
        ) : (
          /* ... (input and textarea logic remains same) */
          <input 
            type={type} name={name} value={value} onChange={onChange} 
            className={inputBaseStyles} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Reusable_Fields;