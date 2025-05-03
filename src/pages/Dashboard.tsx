import React from 'react';
import { Users, DollarSign, FileText, BarChart3 } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import PayrollChart from '../components/dashboard/PayrollChart';
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines';
import RecentActivity from '../components/dashboard/RecentActivity';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, here's what's happening with your payroll.
          </p>
        </div>
        <button className="btn btn-primary">Run Payroll</button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value="42"
          icon={<Users size={24} />}
          trend={{ value: 4.5, isPositive: true }}
        />
        <StatCard
          title="Payroll Amount"
          value="$158,234"
          icon={<DollarSign size={24} />}
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatCard
          title="Tax Liabilities"
          value="$47,470"
          icon={<FileText size={24} />}
          trend={{ value: 1.8, isPositive: false }}
        />
        <StatCard
          title="YTD Expenses"
          value="$1,845,609"
          icon={<BarChart3 size={24} />}
          trend={{ value: 12.3, isPositive: true }}
        />
      </div>
      
      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PayrollChart />
        </div>
        <div>
          <UpcomingDeadlines />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div>
          {/* Compliance card or other widget could go here */}
          <div className="card h-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Tax Compliance Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Federal Filings</span>
                <span className="px-2 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
                  Up to date
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">State Filings (CA)</span>
                <span className="px-2 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
                  Up to date
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">State Filings (NY)</span>
                <span className="px-2 py-1 text-xs font-medium bg-warning/10 text-warning rounded-full">
                  Due in 5 days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">W-2 Preparation</span>
                <span className="px-2 py-1 text-xs font-medium bg-error/10 text-error rounded-full">
                  Not started
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">ACA Compliance</span>
                <span className="px-2 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
                  Completed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;