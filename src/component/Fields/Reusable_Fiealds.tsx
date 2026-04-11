import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Select, { type StylesConfig } from 'react-select';

export interface SelectOption {
  label: string;
  value: string | number;
  [key: string]: any;
}

interface ReusableFieldsProps {
  type?:
    | "text"
    | "password"
    | "email"
    | "number"
    | "phone"
    | "date"
    | "datetime-local"
    | "select"
    | "textarea"
    | "time";
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
  maxLength?: number;
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
  maxLength,
}) => {
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
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

  // Handle generic input changes with validation for phone type
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let newValue = e.target.value;
    
    // Phone number validation: only allow digits and limit to 10 characters
    if (type === "phone") {
      // Remove any non-digit characters
      newValue = newValue.replace(/\D/g, '');
      // Limit to 10 digits
      if (newValue.length <= 10) {
        onChange({ target: { name, value: newValue } });
      }
      return;
    }
    
    // For number type, allow only numeric input
    if (type === "number") {
      // Allow empty string, negative sign, and numbers
      if (newValue === '' || /^-?\d*\.?\d*$/.test(newValue)) {
        onChange({ target: { name, value: newValue } });
      }
      return;
    }
    
    onChange({ target: { name, value: newValue } });
  };

  // Handle paste event for phone numbers
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (type === "phone") {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text');
      const cleanedText = pastedText.replace(/\D/g, '');
      const limitedText = cleanedText.slice(0, 10);
      onChange({ target: { name, value: limitedText } });
    }
  };

  // Custom styles for React Select with theme support
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
      borderColor: error
        ? '#ef4444'
        : state.isFocused
        ? primaryColor || '#9ca3af'
        : darkMode ? '#374151' : '#e2e8f0',
      backgroundColor: darkMode 
        ? (disabled ? '#1f2937' : '#374151')
        : (disabled ? '#f8fafc' : 'white'),
      color: darkMode ? '#f3f4f6' : '#1e293b',
      '&:hover': {
        borderColor: error ? '#ef4444' : (primaryColor || '#9ca3af')
      },
      boxShadow: state.isFocused ? `0 0 0 2px ${primaryColor}20` : 'none',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '12px',
      boxShadow: darkMode 
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
        : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: darkMode ? '1px solid #374151' : '1px solid #e2e8f0',
      backgroundColor: darkMode ? '#1f2937' : 'white',
      overflow: 'hidden'
    }),
    option: (base, state) => ({
      ...base,
      padding: '10px 15px',
      fontSize: '14px',
      cursor: 'pointer',
      backgroundColor: state.isSelected
        ? primaryColor || '#6366f1'
        : state.isFocused
        ? darkMode ? '#374151' : '#f1f5f9'
        : darkMode ? '#1f2937' : 'white',
      color: state.isSelected 
        ? 'white' 
        : darkMode ? '#e5e7eb' : '#1e293b',
      '&:active': { 
        backgroundColor: darkMode ? '#4b5563' : '#e2e8f0' 
      }
    }),
    placeholder: (base) => ({ 
      ...base, 
      color: darkMode ? '#6b7280' : '#94a3b8', 
      fontSize: '14px' 
    }),
    singleValue: (base) => ({ 
      ...base, 
      color: darkMode ? '#f3f4f6' : '#1e293b', 
      fontSize: '14px' 
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base) => ({
      ...base,
      color: darkMode ? '#6b7280' : '#94a3b8',
      '&:hover': {
        color: primaryColor || '#6366f1'
      }
    }),
    input: (base) => ({
      ...base,
      color: darkMode ? '#f3f4f6' : '#1e293b'
    })
  };

  const hasValue = value !== undefined && value !== null && value.toString().length > 0;

  const isFloating =
    isFocused ||
    hasValue ||
    type === "date" ||
    type === "datetime-local" ||
    type === "time" ||
    menuIsOpen ||
    isActive;

  // Get border color based on state and theme
  const getBorderColor = () => {
    if (error) return 'border-red-500';
    if (isFocused) return `border-${primaryColor}-500`;
    return darkMode ? 'border-gray-700' : 'border-slate-200';
  };

  // Get focus ring color
  const getFocusRing = () => {
    if (error) return 'focus:ring-red-500/20 focus:border-red-500';
    return `focus:ring-${primaryColor}/20 focus:border-${primaryColor}`;
  };

  // Get background color based on theme
  const getBgColor = () => {
    if (disabled) return darkMode ? 'bg-gray-800' : 'bg-slate-50';
    return darkMode ? 'bg-gray-800' : 'bg-white';
  };

  // Get text color based on theme
  const getTextColor = () => {
    return darkMode ? 'text-gray-200' : 'text-slate-900';
  };

  // Get label color based on theme and state
  const getLabelColor = () => {
    if (isFloating) return darkMode ? 'text-gray-400' : 'text-gray-600';
    return darkMode ? 'text-gray-500' : 'text-slate-500';
  };

  // Get label background based on theme
  const getLabelBg = () => {
    if (darkMode) {
      return isFloating ? 'bg-gray-900' : 'bg-transparent';
    }
    return isFloating ? 'bg-white' : 'bg-transparent';
  };

  // Determine input mode for mobile devices
  const getInputMode = () => {
    if (type === "phone" || type === "number") {
      return "numeric";
    }
    return "text";
  };

  // Get max length based on type
  const getMaxLength = () => {
    if (type === "phone") return 10;
    return maxLength;
  };

  return (
    <div
      className={`relative w-full ${className}`}
      style={{ zIndex: menuIsOpen ? 100 : 1 }}
    >
      {label && (
        <label
          className={`absolute transition-all duration-200 pointer-events-none z-[10] px-1 rounded-md ${
            icon && !isFloating ? "left-11" : "left-3"
          } ${
            isFloating
              ? `-top-2 text-[11px] font-bold ${getLabelBg()} ${getLabelColor()} translate-y-0`
              : `top-1/2 -translate-y-1/2 text-sm ${getLabelColor()} bg-transparent`
          }`}
          style={{
            backgroundColor: isFloating ? (darkMode ? '#111827' : 'white') : 'transparent'
          }}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <div className={`absolute left-4 z-[5] transition-colors ${
            isFocused 
              ? darkMode ? 'text-gray-400' : 'text-gray-500'
              : darkMode ? 'text-gray-600' : 'text-slate-400'
          }`}>
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
              theme={(selectTheme) => ({
                ...selectTheme,
                colors: {
                  ...selectTheme.colors,
                  primary: primaryColor || '#6366f1',
                  primary75: `${primaryColor}cc`,
                  primary50: `${primaryColor}80`,
                  primary25: `${primaryColor}40`,
                }
              })}
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
            maxLength={maxLength}
            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${getBgColor()} ${getTextColor()} ${
              error ? 'border-red-500' : getBorderColor()
            } ${getFocusRing()} ${icon ? 'pl-11' : 'pl-4'}`}
            style={{
              borderColor: isFocused && !error ? primaryColor : undefined
            }}
          />
        ) : (
          <input
            type={type === "phone" ? "tel" : type === "number" ? "text" : type}
            name={name}
            value={value}
            onChange={handleInputChange}
            onPaste={type === "phone" ? handlePaste : undefined}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={isFocused ? placeholder : ""}
            inputMode={getInputMode()}
            maxLength={getMaxLength()}
            className={`w-full h-[48px] rounded-xl border text-sm transition-all outline-none ${getBgColor()} ${getTextColor()} ${
              error ? 'border-red-500' : getBorderColor()
            } ${getFocusRing()} ${icon ? 'pl-11' : 'pl-4'}
            ${type === "number" ? 'remove-number-spinner' : ''}`}
            style={{
              borderColor: isFocused && !error ? primaryColor : undefined
            }}
          />
        )}
      </div>
      {error && (
        <p className={`text-xs mt-1 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
          {error}
        </p>
      )}

      {/* Add global styles to remove number input spinners */}
      <style>{`
        /* Remove number input spinners for all browsers */
        input.remove-number-spinner::-webkit-outer-spin-button,
        input.remove-number-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input.remove-number-spinner {
          -moz-appearance: textfield;
          appearance: textfield;
        }
        
        /* For phone type, ensure numeric keyboard on mobile */
        input[type="tel"] {
          -webkit-appearance: none;
        }
      `}</style>
    </div>
  );
};

export default Reusable_Fields;