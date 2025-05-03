import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  DollarSign, 
  FileText, 
  Heart, 
  Calendar, 
  User, 
  Settings,
  Download,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import TimeTracking from './TimeTracking';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  hire_date: string;
  salary_type: string;
  salary_amount: number;
}

interface PayrollItem {
  id: string;
  payroll_period_id: string;
  pay_date: string;
  gross_pay: number;
  net_pay: number;
}

const EmployeePortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timesheet' | 'pay' | 'benefits'>('dashboard');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [recentPay, setRecentPay] = useState<PayrollItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadEmployeeData();
    }
  }, [user]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get employee data
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (employeeError) throw employeeError;
      setEmployee(employeeData);

      // Get recent pay data
      const { data: payData, error: payError } = await supabase
        .from('payroll_items')
        .select(`
          id,
          payroll_period_id,
          regular_pay,
          overtime_pay,
          federal_tax,
          state_tax,
          social_security,
          medicare,
          deductions,
          net_pay,
          payroll_period:payroll_periods(pay_date)
        `)
        .eq('employee_id', employeeData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (payData) {
        setRecentPay({
          id: payData.id,
          payroll_period_id: payData.payroll_period_id,
          pay_date: payData.payroll_period.pay_date,
          gross_pay: payData.regular_pay + payData.overtime_pay,
          net_pay: payData.net_pay
        });
      }
    } catch (err) {
      if (err instanceof Error && err.message !== 'No rows found') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="card" data-testid="personal-info">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
            {employee?.first_name.charAt(0)}{employee?.last_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900" data-testid="employee-name">
              {employee?.first_name} {employee?.last_name}
            </h2>
            <p className="text-gray-500" data-testid="employee-id">ID: {employee?.id.substring(0, 8)}</p>
            <p className="text-gray-500" data-testid="department">
              {employee?.department} • {employee?.position}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card hover:shadow-md transition-all cursor-pointer" onClick={() => setActiveTab('pay')}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Recent Pay</h3>
              <p className="text-gray-500 text-sm">
                {recentPay ? new Date(recentPay.pay_date).toLocaleDateString() : 'No recent payments'}
              </p>
            </div>
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <DollarSign size={20} />
            </div>
          </div>
          
          <div className="mt-4 space-y-2" data-testid="recent-pay">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Gross Pay</span>
              <span className="font-medium" data-testid="gross-pay">
                {recentPay ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(recentPay.gross_pay) : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Net Pay</span>
              <span className="font-medium" data-testid="net-pay">
                {recentPay ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(recentPay.net_pay) : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Pay Date</span>
              <span className="font-medium" data-testid="pay-date">
                {recentPay ? new Date(recentPay.pay_date).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
            <span className="text-primary">View Pay History</span>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </div>

        <div className="card hover:shadow-md transition-all cursor-pointer" onClick={() => setActiveTab('timesheet')}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Time Tracking</h3>
              <p className="text-gray-500 text-sm">Manage your work hours</p>
            </div>
            <div className="h-10 w-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
              <Clock size={20} />
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">This Week</span>
              <span className="font-medium">32.5 hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Pending Approval</span>
              <span className="px-2 py-1 text-xs font-medium bg-warning/10 text-warning rounded-full">
                2 entries
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
            <span className="text-primary">Log Time</span>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </div>

        <div className="card hover:shadow-md transition-all cursor-pointer" onClick={() => setActiveTab('benefits')}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Benefits</h3>
              <p className="text-gray-500 text-sm">View your enrolled benefits</p>
            </div>
            <div className="h-10 w-10 bg-accent/10 rounded-full flex items-center justify-center text-accent">
              <Heart size={20} />
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Health Insurance</span>
              <span className="px-2 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
                Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Dental Insurance</span>
              <span className="px-2 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
                Active
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
            <span className="text-primary">View Details</span>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </div>
      </div>

      <div className="card" data-testid="quick-actions">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center justify-center text-center">
            <FileText size={24} className="text-primary mb-2" />
            <span className="text-sm font-medium">Download W-2</span>
          </button>
          
          <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center justify-center text-center">
            <Calendar size={24} className="text-primary mb-2" />
            <span className="text-sm font-medium">Request Time Off</span>
          </button>
          
          <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center justify-center text-center">
            <User size={24} className="text-primary mb-2" />
            <span className="text-sm font-medium">Update Profile</span>
          </button>
          
          <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center justify-center text-center">
            <Settings size={24} className="text-primary mb-2" />
            <span className="text-sm font-medium">Account Settings</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'timesheet':
        return <TimeTracking />;
      case 'pay':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <DollarSign size={20} className="text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">Pay History</h2>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Paychecks</h3>
              
              <div className="overflow-x-auto -mx-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="table-header">Pay Date</th>
                      <th className="table-header">Period</th>
                      <th className="table-header text-right">Gross Pay</th>
                      <th className="table-header text-right">Net Pay</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentPay ? (
                      <tr>
                        <td className="table-cell">
                          {new Date(recentPay.pay_date).toLocaleDateString()}
                        </td>
                        <td className="table-cell">
                          {/* This would need to be fetched from the payroll period */}
                          Jan 1 - Jan 15, 2025
                        </td>
                        <td className="table-cell text-right">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }).format(recentPay.gross_pay)}
                        </td>
                        <td className="table-cell text-right">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }).format(recentPay.net_pay)}
                        </td>
                        <td className="table-cell">
                          <button className="p-1 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100" aria-label="Download pay stub">
                            <Download size={16} />
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={5} className="table-cell text-center text-gray-500">
                          No pay history found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Year-to-Date Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-500">Gross Earnings</div>
                  <div className="text-2xl font-semibold text-gray-900 mt-1">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(recentPay ? recentPay.gross_pay : 0)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Total Taxes</div>
                  <div className="text-2xl font-semibold text-gray-900 mt-1">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(recentPay ? (recentPay.gross_pay - recentPay.net_pay) : 0)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Net Pay</div>
                  <div className="text-2xl font-semibold text-gray-900 mt-1">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(recentPay ? recentPay.net_pay : 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'benefits':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Heart size={20} className="text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">Benefits</h2>
            </div>
            
            <div className="card" data-testid="health-benefits">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Health Insurance</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200" data-testid="coverage-details">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Plan</div>
                    <div className="font-medium">Premium Health Plan</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Coverage Level</div>
                    <div className="font-medium" data-testid="coverage-level">Individual</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Your Cost</div>
                    <div className="font-medium" data-testid="coverage-cost">$50.00 per paycheck</div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">Coverage Details</div>
                  <div className="mt-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span>Deductible</span>
                      <span className="font-medium">$500 individual</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Out-of-pocket Maximum</span>
                      <span className="font-medium">$3,000 individual</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Primary Care Visit</span>
                      <span className="font-medium">$20 copay</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Specialist Visit</span>
                      <span className="font-medium">$40 copay</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card" data-testid="dental-benefits">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dental Insurance</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Plan</div>
                    <div className="font-medium">Dental Plus</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Coverage Level</div>
                    <div className="font-medium">Individual</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Your Cost</div>
                    <div className="font-medium">$10.00 per paycheck</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card" data-testid="vision-benefits">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vision Insurance</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Plan</div>
                    <div className="font-medium">Vision Plus</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Coverage Level</div>
                    <div className="font-medium">Individual</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Your Cost</div>
                    <div className="font-medium">$5.00 per paycheck</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  if (loading && !employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading employee information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 sm:mb-0">Employee Portal</h1>
            
            <div className="flex space-x-2">
              <button className="btn btn-outline">
                <Settings size={16} className="mr-2" />
                Settings
              </button>
              <button className="btn btn-primary">
                <Download size={16} className="mr-2" />
                Download W-2
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'timesheet'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('timesheet')}
              >
                Time Tracking
              </button>
              <button
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pay'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('pay')}
              >
                Pay & Taxes
              </button>
              <button
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'benefits'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('benefits')}
              >
                Benefits
              </button>
            </nav>
          </div>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default EmployeePortal;