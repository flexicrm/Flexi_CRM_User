import { unwrapResult } from "@reduxjs/toolkit";
import { Check, Palette, RotateCcw, Save, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { errorAlert, successAlert } from "../../component/Notification/statusHandler";
import type { AppDispatch } from "../../store/Store";
import { updateThemeSettings } from "../../store/Theems_Slic";

// A curated list of beautiful default theme colors
const PRESET_COLORS = [
  "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#D946EF",
  "#EC4899", "#F43F5E", "#EF4444", "#F97316", "#F59E0B",
  "#EAB308", "#84CC16", "#22C55E", "#10B981", "#14B8A6",
  "#06B6D4", "#0EA5E9", "#0F172A", "#1E293B", "#475569",
];

// Extended color palette for custom color wheel
const EXTENDED_COLORS = [
  "#FF0000", "#FF2B00", "#FF5500", "#FF8000", "#FFAA00", "#FFD400",
  "#FFFF00", "#D4FF00", "#AAFF00", "#80FF00", "#55FF00", "#2BFF00",
  "#00FF00", "#00FF2B", "#00FF55", "#00FF80", "#00FFAA", "#00FFD4",
  "#00FFFF", "#00D4FF", "#00AAFF", "#0080FF", "#0055FF", "#002BFF",
  "#0000FF", "#2B00FF", "#5500FF", "#8000FF", "#AA00FF", "#D400FF",
  "#FF00FF", "#FF00D4", "#FF00AA", "#FF0080", "#FF0055", "#FF002B",
];

const Color_Theems: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Get existing settings from Redux
  const { primaryColor, darkMode, isLoading } = useSelector((state: any) => state.theme);

  // Local state for the color picker
  const [selectedColor, setSelectedColor] = useState<string>("#FFFFFF");
  localStorage.setItem("appPrimaryColor",selectedColor)
  const [showCustomColorPicker, setShowCustomColorPicker] = useState<boolean>(false);
  const [customColor, setCustomColor] = useState<string>("#3B82F6");


  // Theme-based styles
  const getPageBg = () => darkMode ? 'bg-gray-900' : 'bg-[#F8FAFC]';
  const getCardBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getCardBorder = () => darkMode ? 'border-gray-700' : 'border-slate-200';
  const getHeaderBorder = () => darkMode ? 'border-gray-700' : 'border-slate-100';
  const getTitleColor = () => darkMode ? 'text-white' : 'text-slate-800';
  const getSubtitleColor = () => darkMode ? 'text-gray-400' : 'text-slate-500';
  const getSectionTitleColor = () => darkMode ? 'text-gray-300' : 'text-slate-700';
  const getUnselectButtonColor = () => darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100';
  const getResetButtonColor = () => darkMode ? 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50';
  const getCustomPickerBg = () => darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-slate-50 border-slate-200';
  const getCustomPickerTextColor = () => darkMode ? 'text-gray-300' : 'text-slate-700';
  const getCustomPickerValueColor = () => darkMode ? 'text-gray-400' : 'text-slate-600';
  const getPreviewBg = () => darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-slate-50 border-slate-100';
  const getPreviewLabelColor = () => darkMode ? 'text-gray-400' : 'text-slate-700';
  const getPreviewHexColor = () => darkMode ? 'text-gray-200' : 'text-slate-800';
  const getPreviewRgbColor = () => darkMode ? 'text-gray-500' : 'text-slate-500';
  const getHexInputBg = () => darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-slate-200 text-slate-800';

  // Sync local state with Redux state on load
  useEffect(() => {
    if (primaryColor) {
      setSelectedColor(primaryColor);
      setCustomColor(primaryColor);
    }
  }, [primaryColor]);

  // Handle color selection from presets
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setCustomColor(color);
  };

  // Handle custom color change
  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    setSelectedColor(color);
  };

  // Handle reset to default white color
  const handleResetToDefault = () => {
    setSelectedColor("#FFFFFF");
    setCustomColor("#FFFFFF");
    successAlert("Color reset to default white", "Reset", "Info");
  };

  // Handle unselect all colors (reset to white)
  const handleUnselectAll = () => {
    setSelectedColor("#FFFFFF");
    setCustomColor("#FFFFFF");
    successAlert("All colors unselected. Default white applied.", "Reset", "Info");
  };

  // Real API Call to POST the settings via Redux Thunk
  const handleSaveTheme = async () => {
    try {
      console.log("Dispatching to API:", { primaryColor: selectedColor, darkMode });

      const actionResult = await dispatch(updateThemeSettings({
        primaryColor: selectedColor,
        darkMode: darkMode
      }));
      unwrapResult(actionResult);

      successAlert(`Theme color updated successfully!`, "Done", "Success");
      document.documentElement.style.setProperty('--primary-color', selectedColor);

    } catch (error: any) {
      console.error("Failed to save theme:", error);
      const errorMsg = typeof error === 'string' ? error : "Failed to update theme settings. Please try again.";
      errorAlert(errorMsg, "Try Again");
    }
  };

  // Convert hex to rgb
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgb = hexToRgb(selectedColor);

  return (
    <div className={`min-h-[80vh] p-6 w-full ${getPageBg()}`}>
      <div className={`max-w-4xl mx-auto rounded-2xl shadow-sm border overflow-hidden ${getCardBg()} ${getCardBorder()}`}>
        
        {/* Header */}
        <div className={`p-6 border-b ${getHeaderBorder()}`}>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-colors duration-300"
              style={{ backgroundColor: selectedColor }}
            >
              <Palette size={20} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${getTitleColor()}`}>
                Theme Color Settings
              </h2>
              <p className={`text-sm ${getSubtitleColor()}`}>
                Choose a primary color for your workspace
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          
          {/* Primary Color Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-semibold uppercase tracking-wider ${getSectionTitleColor()}`}>
                Preset Colors
              </h3>
              
              {/* Unselect All Button */}
              <button
                onClick={handleUnselectAll}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${getUnselectButtonColor()}`}
              >
                <X size={14} />
                Unselect All
              </button>
            </div>
            
            {/* Color Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-4 mb-8">
              {PRESET_COLORS.map((color) => {
                const isSelected = selectedColor.toUpperCase() === color.toUpperCase();
                
                return (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
                      isSelected ? "scale-110 ring-4 ring-offset-2" : "hover:scale-105 hover:shadow-md"
                    }`}
                    style={{ 
                      backgroundColor: color,
                      ...(isSelected ? { '--tw-ring-color': color } as React.CSSProperties : {})
                    }}
                    title={color}
                  >
                    {isSelected && (
                      <Check size={20} className="text-white drop-shadow-md" strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Color Picker Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-semibold uppercase tracking-wider ${getSectionTitleColor()}`}>
                  Custom Color
                </h3>
                
                {/* Reset to Default Button */}
                <button
                  onClick={handleResetToDefault}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${getResetButtonColor()}`}
                >
                  <RotateCcw size={14} />
                  Reset to White
                </button>
              </div>

              {/* Color Picker Toggle Button */}
              <button
                onClick={() => setShowCustomColorPicker(!showCustomColorPicker)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 mb-4 ${
                  darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg shadow-sm"
                    style={{ backgroundColor: customColor }}
                  />
                  <span className={`text-sm font-medium ${getCustomPickerTextColor()}`}>
                    {showCustomColorPicker ? "Hide Color Picker" : "Show Color Picker"}
                  </span>
                </div>
                <div className={`text-sm font-mono ${getCustomPickerValueColor()}`}>
                  {customColor}
                </div>
              </button>

              {/* Extended Color Palette */}
              {showCustomColorPicker && (
                <div className="animate-slideDown">
                  {/* RGB Sliders */}
                  <div className={`mb-6 p-4 rounded-xl border ${getCustomPickerBg()}`}>
                    <h4 className={`text-sm font-semibold mb-3 ${getSectionTitleColor()}`}>RGB Customization</h4>
                    <div className="space-y-3">
                      {/* Red Slider */}
                      <div>
                        <label className={`flex items-center justify-between text-xs font-medium mb-1 ${getCustomPickerTextColor()}`}>
                          <span>Red</span>
                          <span className="font-mono">{rgb?.r || 255}</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={rgb?.r || 255}
                          onChange={(e) => {
                            const newR = parseInt(e.target.value);
                            const newColor = `#${newR.toString(16).padStart(2, '0')}${(rgb?.g || 255).toString(16).padStart(2, '0')}${(rgb?.b || 255).toString(16).padStart(2, '0')}`;
                            handleCustomColorChange(newColor.toUpperCase());
                          }}
                          className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
                          style={{ accentColor: '#ef4444' }}
                        />
                      </div>
                      
                      {/* Green Slider */}
                      <div>
                        <label className={`flex items-center justify-between text-xs font-medium mb-1 ${getCustomPickerTextColor()}`}>
                          <span>Green</span>
                          <span className="font-mono">{rgb?.g || 255}</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={rgb?.g || 255}
                          onChange={(e) => {
                            const newG = parseInt(e.target.value);
                            const newColor = `#${(rgb?.r || 255).toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${(rgb?.b || 255).toString(16).padStart(2, '0')}`;
                            handleCustomColorChange(newColor.toUpperCase());
                          }}
                          className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                          style={{ accentColor: '#22c55e' }}
                        />
                      </div>
                      
                      {/* Blue Slider */}
                      <div>
                        <label className={`flex items-center justify-between text-xs font-medium mb-1 ${getCustomPickerTextColor()}`}>
                          <span>Blue</span>
                          <span className="font-mono">{rgb?.b || 255}</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={rgb?.b || 255}
                          onChange={(e) => {
                            const newB = parseInt(e.target.value);
                            const newColor = `#${(rgb?.r || 255).toString(16).padStart(2, '0')}${(rgb?.g || 255).toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
                            handleCustomColorChange(newColor.toUpperCase());
                          }}
                          className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                          style={{ accentColor: '#3b82f6' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Extended Color Grid */}
                  <div className="mb-4">
                    <h4 className={`text-sm font-semibold mb-3 ${getSectionTitleColor()}`}>Color Wheel</h4>
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
                      {EXTENDED_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleCustomColorChange(color)}
                          className={`w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md ${
                            customColor.toUpperCase() === color.toUpperCase() ? "ring-2 ring-offset-2 scale-110" : ""
                          }`}
                          style={{ 
                            backgroundColor: color,
                            ...(customColor.toUpperCase() === color.toUpperCase() && { '--tw-ring-color': darkMode ? '#6b7280' : '#94a3b8' } as React.CSSProperties)
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Native Color Input */}
                  <div className="mt-4">
                    <label className={`block text-sm font-medium mb-2 ${getSectionTitleColor()}`}>
                      Hex Color Code
                    </label>
                    <div className="flex items-center gap-3">
                      <div className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 shadow-sm cursor-pointer transition-colors ${
                        darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-slate-200 hover:border-slate-300'
                      }`}>
                        <input
                          type="color"
                          value={customColor}
                          onChange={(e) => handleCustomColorChange(e.target.value.toUpperCase())}
                          className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => {
                          let value = e.target.value;
                          if (value.startsWith('#')) {
                            if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                              handleCustomColorChange(value.toUpperCase());
                            }
                          } else if (/^[0-9A-Fa-f]{6}$/.test(value)) {
                            handleCustomColorChange('#' + value.toUpperCase());
                          }
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 font-mono text-sm ${getHexInputBg()}`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Color Preview Section */}
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-xl border ${getPreviewBg()}`}>
              
              <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
                <h3 className={`text-sm font-semibold mb-2 ${getPreviewLabelColor()}`}>
                  Selected Color
                </h3>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-16 h-16 rounded-xl shadow-lg transition-all duration-300"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <div className="flex flex-col">
                    <span className={`text-xs font-medium ${getPreviewLabelColor()}`}>
                      HEX Code
                    </span>
                    <span className={`text-lg font-mono font-bold tracking-wider uppercase ${getPreviewHexColor()}`}>
                      {selectedColor}
                    </span>
                    {rgb && (
                      <span className={`text-xs font-mono mt-1 ${getPreviewRgbColor()}`}>
                        RGB({rgb.r}, {rgb.g}, {rgb.b})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview Boxes */}
              <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
                <h3 className={`text-sm font-semibold mb-2 ${getPreviewLabelColor()}`}>
                  Preview
                </h3>
                <div className="flex gap-3">
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 rounded-lg shadow-sm mb-1"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <span className={`text-xs ${getPreviewLabelColor()}`}>Solid</span>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 rounded-lg shadow-sm"
                      style={{ backgroundColor: selectedColor + '80' }}
                    />
                    <span className={`text-xs ${getPreviewLabelColor()}`}>50%</span>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 rounded-lg shadow-sm"
                      style={{ backgroundColor: selectedColor + '40' }}
                    />
                    <span className={`text-xs ${getPreviewLabelColor()}`}>25%</span>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 rounded-lg shadow-sm"
                      style={{ backgroundColor: selectedColor + '20' }}
                    />
                    <span className={`text-xs ${getPreviewLabelColor()}`}>12%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveTheme}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold shadow-sm transition-all duration-200 ${
              isLoading ? "opacity-70 cursor-not-allowed" : "hover:shadow-md hover:-translate-y-0.5"
            }`}
            style={{ backgroundColor: selectedColor }}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving Color...
              </>
            ) : (
              <>
                <Save size={18} />
                Apply Theme Color
              </>
            )}
          </button>

        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Color_Theems;