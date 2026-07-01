import React from 'react';
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trendText?: string;
  trend?: 'up' | 'down' | 'none';
  status?: 'brand' | 'success' | 'warning' | 'danger';
  sparklineData?: number[]; // Simple array of numbers to plot a micro svg line
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trendText,
  trend = 'none',
  status = 'brand',
  sparklineData = [30, 40, 35, 50, 45, 60, 55]
}) => {
  
  // Dynamic color mappings based on status parameter
  const statusColors = {
    brand: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/50'
    },
    success: {
      bg: 'bg-success-50 dark:bg-emerald-950/20',
      text: 'text-success-500 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/50'
    },
    warning: {
      bg: 'bg-warning-50 dark:bg-amber-950/20',
      text: 'text-warning-500 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/50'
    },
    danger: {
      bg: 'bg-danger-50 dark:bg-red-950/20',
      text: 'text-danger-500 dark:text-red-400',
      border: 'border-red-100 dark:border-red-900/50'
    }
  };

  const activeColors = statusColors[status];

  // SVG Sparkline coordinate calculation
  const getSparklineSvg = (data: number[]) => {
    const width = 120;
    const height = 30;
    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = maxVal - minVal || 1;
    
    const points = data.map((val, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 4) - 2;
      return `${x},${y}`;
    }).join(' ');
    
    return { points, width, height };
  };

  const sparkline = getSparklineSvg(sparklineData);

  return (
    <div className="glass-card p-5 flex flex-col justify-between h-40">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
            {title}
          </span>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {value}
          </h3>
        </div>
        <div className={`p-2.5 rounded-xl border ${activeColors.bg} ${activeColors.text} ${activeColors.border}`}>
          <Icon size={20} />
        </div>
      </div>

      {/* Sparkline & Trend */}
      <div className="flex items-end justify-between mt-4">
        {/* Micro sparkline */}
        <div className="w-[120px] h-[30px] opacity-75">
          <svg width={sparkline.width} height={sparkline.height}>
            <polyline
              fill="none"
              stroke={status === 'brand' ? '#3B82F6' : status === 'success' ? '#10B981' : status === 'warning' ? '#F59E0B' : '#EF4444'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparkline.points}
            />
          </svg>
        </div>

        {/* Trend Percentage badge */}
        {trendText && (
          <div className="flex flex-col items-end">
            <span className={`flex items-center text-xs font-bold ${
              trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-green-500' : 'text-slate-400'
            }`}>
              {trend === 'up' && <ArrowUpRight size={14} className="mr-0.5" />}
              {trend === 'down' && <ArrowDownRight size={14} className="mr-0.5" />}
              {trendText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
