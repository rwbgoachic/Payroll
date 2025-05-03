import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { month: 'Jan', payroll: 142000 },
  { month: 'Feb', payroll: 138000 },
  { month: 'Mar', payroll: 146000 },
  { month: 'Apr', payroll: 152000 },
  { month: 'May', payroll: 149000 },
  { month: 'Jun', payroll: 158000 },
  { month: 'Jul', payroll: 165000 },
  { month: 'Aug', payroll: 163000 },
  { month: 'Sep', payroll: 171000 },
  { month: 'Oct', payroll: 175000 },
  { month: 'Nov', payroll: 172000 },
  { month: 'Dec', payroll: 182000 },
];

const PayrollChart: React.FC = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="card h-80">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Payroll Trends</h2>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(var(--color-primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="rgb(var(--color-primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            formatter={(value) => [formatCurrency(value as number), 'Payroll']}
            contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
          />
          <Area 
            type="monotone" 
            dataKey="payroll" 
            stroke="rgb(var(--color-primary))" 
            fillOpacity={1} 
            fill="url(#colorPayroll)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PayrollChart;