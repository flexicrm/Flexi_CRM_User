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
  type ScriptableContext,
} from "chart.js";
import { ChevronDown } from "lucide-react";
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

  const [timeframe, setTimeframe] = useState("Monthly");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extract data from API response
  const chartLabels = leadAcquisition?.data?.acquisition?.labels || [];
  const chartValues = leadAcquisition?.data?.acquisition?.data || [];

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
        borderColor: "#3b82f6", // Bright blue line
        backgroundColor: (context: ScriptableContext<"line">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.3)"); // Blue at top
          gradient.addColorStop(1, "rgba(59, 130, 246, 0)");   // Transparent at bottom
          return gradient;
        },
        tension: 0.4, // This creates the "curved" look
        pointRadius: 0, // Hides the dots on the line like in image
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Hide the legend box
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "#05264e",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 16,
        ticks: {
          stepSize: 4,
          color: "#94a3b8",
          font: { size: 11 },
        },
        grid: {
          drawTicks: false,
          color: "#e2e8f0",
          borderDash: [5, 5], // Creates the DASHED lines
        },
        border: { display: false },
      },
      x: {
        grid: { display: false }, // No vertical grid lines
        ticks: {
          color: "#94a3b8",
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 p-6 font-sans relative">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-[#05264e]">Lead Acquisition</h2>
        </div>

        {/* Custom Timeframe Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div className="absolute -top-2.5 left-3 bg-white px-1 z-10">
            <label className="text-[10px] text-blue-600 font-medium uppercase tracking-wider">Timeframe</label>
          </div>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-32 px-4 py-2 border border-blue-600 rounded-md text-[#05264e] font-medium text-sm transition-all hover:bg-gray-50"
          >
            {timeframe}
            <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-100 rounded-md shadow-xl z-20 overflow-hidden">
              {["Yearly", "Monthly", "Custom"].map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    setTimeframe(option);
                    setIsDropdownOpen(false);
                  }}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    timeframe === option ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-[300px] w-full">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center text-gray-400">Loading Chart...</div>
        ) : (
          <Line data={chartData} options={chartOptions as any} />
        )}
      </div>
    </div>
  );
};

export default LeadAcquisitionChart;