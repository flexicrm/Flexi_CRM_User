// Enhanced Stats component with more customization options
import { ChartNoAxesCombined, Info, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

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

  return (
    <div className={`grid ${getColumnClass()} gap-5 ${className}`}>
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        const formattedValue = stat.formatValue 
          ? stat.formatValue(stat.value) 
          : formatNumber(stat.value);
        
        const changeColor = stat.change !== undefined ? getChangeColor(stat.change) : '';
        
        return (
          <div
            key={index}
            className={`bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-all duration-200 ${cardClassName}`}
          >
            <div className='flex items-center justify-between mb-3'>
               <div>
               <p className="text-md font-medium text-gray-500 mb-1">
                {stat.title}
              </p>
            </div>
              <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.iconBgColor || 'bg-gray-50'}`}>
                <IconComponent className={`w-5 h-5 ${stat.iconColor || 'text-gray-600'}`} />
              </div>
              
              {stat.tooltip && (
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute right-0 mt-1 w-48 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                    {stat.tooltip}
                  </div>
                </div>
              )}
            </div>
            </div>
            
            <div>
             
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {stat.prefix}{formattedValue}{stat.suffix}
                </h3>
              </div>
              
              {showTarget && stat.target && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Target: {stat.target}</span>
                    {stat.progress && <span>{stat.progress}%</span>}
                  </div>
                  {stat.progress && (
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 rounded-full h-1.5 transition-all duration-500"
                        style={{ width: `${Math.min(stat.progress, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
              
              {showChange && stat.change !== undefined && (
                <div className="flex items-center gap-2 mt-3">
                  <ChartNoAxesCombined className='w-4 h-4 text-red-500'/>
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