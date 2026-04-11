// Enhanced Stats component with more customization options and theme support
import { ChartNoAxesCombined, Info, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';
import { useSelector } from 'react-redux';

export interface StatItem {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  iconColor?: string;
  iconBgColor?: string;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  target?: string;
  progress?: number;
  formatValue?: (value: string | number) => string;
}

interface StatsProps {
  stats: StatItem[];
  className?: string;
  columns?: 2 | 3 | 4;
  showChange?: boolean;
  showTarget?: boolean;
  cardClassName?: string;
}

const Stats: React.FC<StatsProps> = ({ 
  stats, 
  className = "", 
  columns = 4,
  showChange = true,
  showTarget = false,
  cardClassName = ""
}) => {
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
  
  const getColumnClass = () => {
    switch(columns) {
      case 2: return "grid-cols-1 md:grid-cols-2";
      case 3: return "grid-cols-1 md:grid-cols-3";
      case 4: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
      default: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    }
  };

  const formatNumber = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return String(value);
    
    // Format with commas for thousands
    return num.toLocaleString('en-US');
  };

  const getChangeColor = (change: number): string => {
    if (darkMode) {
      if (change > 0) return "text-green-400 bg-green-900/30";
      if (change < 0) return "text-red-400 bg-red-900/30";
      return "text-gray-400 bg-gray-800";
    }
    if (change > 0) return "text-green-600 bg-green-50";
    if (change < 0) return "text-red-600 bg-red-50";
    return "text-gray-500 bg-gray-50";
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3.5 h-3.5" />;
    if (change < 0) return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const formatChange = (change: number): string => {
    const absChange = Math.abs(change);
    return `${change > 0 ? '+' : ''}${absChange.toFixed(1)}%`;
  };

  // Get card background based on dark mode
  const getCardBg = () => {
    return darkMode ? 'bg-gray-800' : 'bg-white';
  };

  // Get border color based on dark mode
  const getBorderColor = () => {
    return darkMode ? 'border-gray-700' : 'border-gray-100';
  };

  // Get title color based on dark mode
  const getTitleColor = () => {
    return darkMode ? 'text-gray-400' : 'text-gray-500';
  };

  // Get value color based on dark mode
  const getValueColor = () => {
    return darkMode ? 'text-white' : 'text-gray-900';
  };

  // Get progress bar background
  const getProgressBarBg = () => {
    return darkMode ? 'bg-gray-700' : 'bg-gray-100';
  };

  return (
    <div className={`grid ${getColumnClass()} gap-5 ${className}`}>
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        const formattedValue = stat.formatValue 
          ? stat.formatValue(stat.value) 
          : formatNumber(stat.value);
        
        const changeColor = stat.change !== undefined ? getChangeColor(stat.change) : '';
        
        // Determine icon background color
        const iconBgColor = stat.iconBgColor || (darkMode ? 'bg-gray-700' : 'bg-gray-50');
        const iconColor = stat.iconColor || (darkMode ? primaryColor || '#60A5FA' : primaryColor || '#6366f1');
        
        return (
          <div
            key={index}
            className={`${getCardBg()} rounded-2xl border ${getBorderColor()} p-4 hover:shadow-lg transition-all duration-200 ${
              darkMode ? 'hover:shadow-gray-800/50' : 'hover:shadow-gray-200'
            } ${cardClassName}`}
          >
            <div className='flex items-center justify-between mb-3'>
              <div>
                <p className={`text-md font-medium ${getTitleColor()} mb-1`}>
                  {stat.title}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className={`p-2.5 rounded-xl ${iconBgColor}`}>
                  <IconComponent 
                    className="w-5 h-5" 
                    style={{ color: iconColor }}
                  />
                </div>
                
                {stat.tooltip && (
                  <div className="group relative">
                    <Info className={`w-4 h-4 cursor-help ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <div className={`absolute right-0 mt-1 w-48 px-3 py-2 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 ${
                      darkMode ? 'bg-gray-900' : 'bg-gray-900'
                    }`}>
                      {stat.tooltip}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className={`text-2xl font-bold tracking-tight ${getValueColor()}`}>
                  {stat.prefix}{formattedValue}{stat.suffix}
                </h3>
              </div>
              
              {showTarget && stat.target && (
                <div className="mt-3">
                  <div className={`flex justify-between text-xs mb-1 ${
                    darkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    <span>Target: {stat.target}</span>
                    {stat.progress && <span>{stat.progress}%</span>}
                  </div>
                  {stat.progress && (
                    <div className={`w-full ${getProgressBarBg()} rounded-full h-1.5`}>
                      <div 
                        className="rounded-full h-1.5 transition-all duration-500"
                        style={{ 
                          width: `${Math.min(stat.progress, 100)}%`,
                          backgroundColor: primaryColor || '#3B82F6'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
              
              {showChange && stat.change !== undefined && (
                <div className="flex items-center gap-2 mt-3">
                  <ChartNoAxesCombined className={`w-4 h-4 ${
                    darkMode ? 'text-gray-500' : 'text-red-500'
                  }`} />
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${changeColor}`}>
                    {getChangeIcon(stat.change)}
                    {formatChange(stat.change)}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Stats;