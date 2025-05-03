import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  className = '',
}) => {
  return (
    <div className={`card hover:shadow transition-all ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          
          {trend && (
            <div className="mt-1 flex items-center">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-success' : 'text-error'
                }`}
              >
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
              <span className="ml-1 text-xs text-gray-500">from last period</span>
            </div>
          )}
        </div>
        
        <div className="h-12 w-12 bg-primary-light/10 rounded-full flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;