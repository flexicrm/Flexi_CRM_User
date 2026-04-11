import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type Plugin,
  type ScriptableContext,
} from "chart.js";
import { ChevronDown, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/Store";
import { fetchLeadAcquisition } from "../../store/homepage_slice/Dashboard_Slice";

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const LeadAcquisitionChart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { leadAcquisition, isLoading } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);

  const [timeframe, setTimeframe] = useState("Monthly");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extract data from API response
  const chartLabels = leadAcquisition?.data?.acquisition?.labels || [];
  const chartValues = leadAcquisition?.data?.acquisition?.data || [];

  // Determine maximum value for dynamic Y-axis scaling
  const maxValue = Math.max(...(chartValues.length ? chartValues : [16]));

  // Get theme colors
  const themeColor = primaryColor || '#3B82F6';
  const themeColorRgb = themeColor.replace('#', '');
  const themeColorRgba = (opacity: number) => {
    const r = parseInt(themeColorRgb.slice(0, 2), 16);
    const g = parseInt(themeColorRgb.slice(2, 4), 16);
    const b = parseInt(themeColorRgb.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Custom Plugin for a premium drop-shadow under the line with theme color
  const lineShadowPlugin: Plugin = {
    id: "lineShadow",
    beforeDatasetsDraw: (chart) => {
      const ctx = chart.ctx;
      ctx.save();
      ctx.shadowColor = themeColorRgba(0.4);
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 8;
    },
    afterDatasetsDraw: (chart) => {
      chart.ctx.restore();
    },
  };

  useEffect(() => {
    dispatch(fetchLeadAcquisition(timeframe.toLowerCase()));
  }, [dispatch, timeframe]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        fill: true,
        label: "Leads",
        data: chartValues,
        borderColor: themeColor,
        backgroundColor: (context: ScriptableContext<"line">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, themeColorRgba(0.5));
          gradient.addColorStop(1, themeColorRgba(0.0));
          return gradient;
        },
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: darkMode ? '#1f2937' : '#ffffff',
        pointHoverBorderColor: themeColor,
        pointHoverBorderWidth: 3,
        borderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeOutQuart" as const,
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: darkMode ? "rgba(31, 41, 55, 0.95)" : "rgba(255, 255, 255, 0.95)",
        titleColor: darkMode ? "#f3f4f6" : "#0f172a",
        bodyColor: darkMode ? "#9ca3af" : "#334155",
        borderColor: darkMode ? "#374151" : "#e2e8f0",
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
        titleFont: { size: 13, weight: "bold", family: "inherit" },
        bodyFont: { size: 13, family: "inherit" },
        displayColors: false,
        callbacks: {
          label: (context: any) => `🔥 Leads acquired: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: maxValue + Math.ceil(maxValue * 0.2),
        ticks: {
          color: darkMode ? "#6b7280" : "#94a3b8",
          font: { size: 11, family: "inherit" },
          padding: 10,
        },
        grid: {
          color: darkMode ? "#374151" : "#f1f5f9",
          borderDash: [5, 5],
          drawBorder: false,
        },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: darkMode ? "#6b7280" : "#94a3b8",
          font: { size: 11, family: "inherit" },
          padding: 10,
        },
        border: { display: false },
      },
    },
  };

  // Get card background based on dark mode
  const getCardBg = () => {
    return darkMode ? 'bg-gray-800' : 'bg-white';
  };

  // Get border color based on dark mode
  const getBorderColor = () => {
    return darkMode ? 'border-gray-700' : 'border-gray-100';
  };


  // Get icon color
  const getIconColor = () => {
    return darkMode ? themeColor : themeColor;
  };

  // Get title color
  const getTitleColor = () => {
    return darkMode ? 'text-white' : 'text-[#0f172a]';
  };

  // Get subtitle color
  const getSubtitleColor = () => {
    return darkMode ? 'text-gray-400' : 'text-gray-500';
  };

  // Get button background color
  const getButtonBg = () => {
    return darkMode ? 'bg-gray-700' : 'bg-gray-50';
  };

  const getButtonBorder = () => {
    return darkMode ? 'border-gray-600' : 'border-gray-200';
  };

  const getButtonHoverBg = () => {
    return darkMode ? 'hover:bg-gray-600' : 'hover:bg-blue-50';
  };

  const getButtonHoverBorder = () => {
    return darkMode ? 'hover:border-gray-500' : 'hover:border-blue-300';
  };

  const getButtonTextColor = () => {
    return darkMode ? 'text-gray-200' : 'text-[#0f172a]';
  };

  // Get dropdown menu background
  const getDropdownBg = () => {
    return darkMode ? 'bg-gray-800' : 'bg-white';
  };

  const getDropdownBorder = () => {
    return darkMode ? 'border-gray-700' : 'border-gray-100';
  };

  const getDropdownItemBg = (isActive: boolean) => {
    if (isActive) {
      return darkMode ? 'bg-gray-700' : 'bg-blue-50/50';
    }
    return darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  };

  const getDropdownItemTextColor = (isActive: boolean) => {
    if (isActive) {
      return darkMode ? 'text-blue-400' : 'text-blue-600';
    }
    return darkMode ? 'text-gray-400' : 'text-gray-600';
  };


  return (
    <div className={`w-full ${getCardBg()} rounded-2xl border ${getBorderColor()} shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 p-6 font-sans relative group`}>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div 
            className="p-2.5 rounded-lg"
            style={{ 
              backgroundColor: darkMode ? '#374151' : '#EFF6FF',
              color: getIconColor()
            }}
          >
            <TrendingUp size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${getTitleColor()}`}>Lead Acquisition</h2>
            <p className={`text-xs ${getSubtitleColor()} mt-0.5`}>Track your new leads over time</p>
          </div>
        </div>

        {/* Custom Timeframe Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center justify-between w-36 px-4 py-2.5 ${getButtonBg()} border ${getButtonBorder()} ${getButtonHoverBg()} ${getButtonHoverBorder()} rounded-xl ${getButtonTextColor()} font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            style={{
              '--tw-ring-color': `${themeColor}20`,
            } as React.CSSProperties}
          >
            {timeframe}
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              style={{ color: isDropdownOpen ? themeColor : undefined }}
            />
          </button>

          {/* Animated Dropdown Menu */}
          <div
            className={`absolute right-0 mt-2 w-36 ${getDropdownBg()} border ${getDropdownBorder()} rounded-xl shadow-xl z-20 overflow-hidden transition-all duration-200 origin-top ${
              isDropdownOpen
                ? "opacity-100 transform scale-y-100"
                : "opacity-0 transform scale-y-0 pointer-events-none"
            }`}
          >
            {["Yearly", "Monthly", "Custom"].map((option) => {
              const isActive = timeframe === option;
              return (
                <div
                  key={option}
                  onClick={() => {
                    setTimeframe(option);
                    setIsDropdownOpen(false);
                  }}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors duration-150 relative ${getDropdownItemBg(isActive)} ${getDropdownItemTextColor(isActive)}`}
                >
                  {isActive && (
                    <span 
                      className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full"
                      style={{ backgroundColor: themeColor }}
                    />
                  )}
                  {option}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart Area with Skeleton Loader */}
      <div className="h-[300px] w-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col justify-end gap-y-6 pb-6 z-10 animate-pulse">
            {/* Skeleton Grid Lines */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={`w-full border-t-2 border-dashed ${
                  darkMode ? 'border-gray-700' : 'border-gray-100'
                }`} 
              />
            ))}
            {/* Loading text overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
               <div className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm px-4 py-2 rounded-full border ${darkMode ? 'border-gray-700' : 'border-gray-100'} shadow-sm text-sm font-medium flex items-center gap-2`}
                 style={{ color: themeColor }}
               >
                 <div 
                   className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                   style={{ borderColor: `${themeColor}`, borderTopColor: 'transparent' }}
                 />
                 Loading Data...
               </div>
            </div>
          </div>
        ) : (
          <Line
            data={chartData}
            options={chartOptions as any}
            plugins={[lineShadowPlugin]}
          />
        )}
      </div>
    </div>
  );
};

export default LeadAcquisitionChart;