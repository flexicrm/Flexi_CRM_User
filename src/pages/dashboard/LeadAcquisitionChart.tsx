// import {
//   CategoryScale,
//   Chart as ChartJS,
//   Filler,
//   Legend,
//   LinearScale,
//   LineElement,
//   PointElement,
//   Title,
//   Tooltip,
//   type ScriptableContext,
// } from "chart.js";
// import { ChevronDown } from "lucide-react";
// import { useEffect, useRef, useState } from "react";
// import { Line } from "react-chartjs-2";
// import { useDispatch, useSelector } from "react-redux";
// import type { AppDispatch, RootState } from "../../store/Store";
// import { fetchLeadAcquisition } from "../../store/homepage_slice/Dashboard_Slice";

// // Register ChartJS modules
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Filler,
//   Legend
// );

// const LeadAcquisitionChart = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { leadAcquisition, isLoading } = useSelector(
//     (state: RootState) => state.dashboard
//   );

//   const [timeframe, setTimeframe] = useState("Monthly");
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   // Extract data from API response
//   const chartLabels = leadAcquisition?.data?.acquisition?.labels || [];
//   const chartValues = leadAcquisition?.data?.acquisition?.data || [];

//   useEffect(() => {
//     dispatch(fetchLeadAcquisition(timeframe.toLowerCase()));
//   }, [dispatch, timeframe]);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const chartData = {
//     labels: chartLabels,
//     datasets: [
//       {
//         fill: true,
//         label: "Leads",
//         data: chartValues,
//         borderColor: "#3b82f6", // Bright blue line
//         backgroundColor: (context: ScriptableContext<"line">) => {
//           const ctx = context.chart.ctx;
//           const gradient = ctx.createLinearGradient(0, 0, 0, 400);
//           gradient.addColorStop(0, "rgba(59, 130, 246, 0.3)"); // Blue at top
//           gradient.addColorStop(1, "rgba(59, 130, 246, 0)");   // Transparent at bottom
//           return gradient;
//         },
//         tension: 0.4, // This creates the "curved" look
//         pointRadius: 0, // Hides the dots on the line like in image
//         pointHoverRadius: 6,
//         borderWidth: 2,
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { display: false }, // Hide the legend box
//       tooltip: {
//         mode: "index" as const,
//         intersect: false,
//         backgroundColor: "#05264e",
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         min: 0,
//         max: 16,
//         ticks: {
//           stepSize: 4,
//           color: "#94a3b8",
//           font: { size: 11 },
//         },
//         grid: {
//           drawTicks: false,
//           color: "#e2e8f0",
//           borderDash: [5, 5], // Creates the DASHED lines
//         },
//         border: { display: false },
//       },
//       x: {
//         grid: { display: false }, // No vertical grid lines
//         ticks: {
//           color: "#94a3b8",
//           font: { size: 11 },
//         },
//       },
//     },
//   };

//   return (
//     <div className="w-full bg-white rounded-xl border border-gray-200 p-6 font-sans relative">
//       {/* Header Section */}
//       <div className="flex justify-between items-center mb-8">
//         <div className="flex items-center gap-3">
//           <h2 className="text-xl font-bold text-[#05264e]">Lead Acquisition</h2>
//         </div>

//         {/* Custom Timeframe Dropdown */}
//         <div className="relative" ref={dropdownRef}>
//           <div className="absolute -top-2.5 left-3 bg-white px-1 z-10">
//             <label className="text-[10px] text-blue-600 font-medium uppercase tracking-wider">Timeframe</label>
//           </div>
//           <button
//             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//             className="flex items-center justify-between w-32 px-4 py-2 border border-blue-600 rounded-md text-[#05264e] font-medium text-sm transition-all hover:bg-gray-50"
//           >
//             {timeframe}
//             <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
//           </button>

//           {isDropdownOpen && (
//             <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-100 rounded-md shadow-xl z-20 overflow-hidden">
//               {["Yearly", "Monthly", "Custom"].map((option) => (
//                 <div
//                   key={option}
//                   onClick={() => {
//                     setTimeframe(option);
//                     setIsDropdownOpen(false);
//                   }}
//                   className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
//                     timeframe === option ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-600 hover:bg-gray-50"
//                   }`}
//                 >
//                   {option}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Chart Area */}
//       <div className="h-[300px] w-full">
//         {isLoading ? (
//           <div className="h-full w-full flex items-center justify-center text-gray-400">Loading Chart...</div>
//         ) : (
//           <Line data={chartData} options={chartOptions as any} />
//         )}
//       </div>
//     </div>
//   );
// };

// export default LeadAcquisitionChart;




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

// Custom Plugin for a premium drop-shadow under the line
const lineShadowPlugin: Plugin = {
  id: "lineShadow",
  beforeDatasetsDraw: (chart) => {
    const ctx = chart.ctx;
    ctx.save();
    ctx.shadowColor = "rgba(59, 130, 246, 0.4)"; // Blue shadow
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;
  },
  afterDatasetsDraw: (chart) => {
    chart.ctx.restore();
  },
};

const LeadAcquisitionChart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { leadAcquisition, isLoading } = useSelector(
    (state: RootState) => state.dashboard
  );

  const [timeframe, setTimeframe] = useState("Monthly");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extract data from API response
  const chartLabels = leadAcquisition?.data?.acquisition?.labels || [];
  const chartValues = leadAcquisition?.data?.acquisition?.data || [];

  // Determine maximum value for dynamic Y-axis scaling
  const maxValue = Math.max(...(chartValues.length ? chartValues : [16]));

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
        borderColor: "#3b82f6", // Bright blue
        backgroundColor: (context: ScriptableContext<"line">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.5)"); // Richer blue at top
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)"); // Transparent at bottom
          return gradient;
        },
        tension: 0.4, // Smooth curves
        pointRadius: 0, // Hidden by default
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#ffffff",
        pointHoverBorderColor: "#3b82f6",
        pointHoverBorderWidth: 3,
        borderWidth: 3, // Slightly thicker line
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeOutQuart" as const, // Smooth, slow-end animation
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#0f172a",
        bodyColor: "#334155",
        borderColor: "#e2e8f0",
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
        suggestedMax: maxValue + Math.ceil(maxValue * 0.2), // Adds 20% headroom dynamically
        ticks: {
          color: "#94a3b8",
          font: { size: 11, family: "inherit" },
          padding: 10,
        },
        grid: {
          color: "#f1f5f9",
          borderDash: [5, 5],
          drawBorder: false,
        },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: "#94a3b8",
          font: { size: 11, family: "inherit" },
          padding: 10,
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 p-6 font-sans relative group">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
            <TrendingUp size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">Lead Acquisition</h2>
            <p className="text-xs text-gray-500 mt-0.5">Track your new leads over time</p>
          </div>
        </div>

        {/* Custom Timeframe Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-36 px-4 py-2.5 bg-gray-50 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl text-[#0f172a] font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {timeframe}
            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform duration-300 ${
                isDropdownOpen ? "rotate-180 text-blue-500" : ""
              }`}
            />
          </button>

          {/* Animated Dropdown Menu */}
          <div
            className={`absolute right-0 mt-2 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden transition-all duration-200 origin-top ${
              isDropdownOpen
                ? "opacity-100 transform scale-y-100"
                : "opacity-0 transform scale-y-0 pointer-events-none"
            }`}
          >
            {["Yearly", "Monthly", "Custom"].map((option) => (
              <div
                key={option}
                onClick={() => {
                  setTimeframe(option);
                  setIsDropdownOpen(false);
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors duration-150 relative ${
                  timeframe === option
                    ? "text-blue-600 font-semibold bg-blue-50/50"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {timeframe === option && (
                  <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600 rounded-r-full" />
                )}
                {option}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Area with Skeleton Loader */}
      <div className="h-[300px] w-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col justify-end gap-y-6 pb-6 z-10 animate-pulse">
            {/* Skeleton Grid Lines */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-full border-t-2 border-dashed border-gray-100" />
            ))}
            {/* Loading text overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 shadow-sm text-blue-600 text-sm font-medium flex items-center gap-2">
                 <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/>
                 Loading Data...
               </div>
            </div>
          </div>
        ) : (
          <Line
            data={chartData}
            options={chartOptions as any}
            plugins={[lineShadowPlugin]} // Adds the custom shadow
          />
        )}
      </div>
    </div>
  );
};

export default LeadAcquisitionChart;