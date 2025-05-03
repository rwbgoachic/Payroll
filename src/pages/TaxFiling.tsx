import React, { useState } from 'react';
import { 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Download, 
  FileText, 
  Filter, 
  Search, 
  Upload 
} from 'lucide-react';

const TaxFiling: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tax Filing</h1>
          <p className="text-gray-500 mt-1">
            Manage your tax forms, deadlines, and payments.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn btn-outline flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            Import Tax Data
          </button>
          <button className="btn btn-primary flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            New Filing
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Due This Month" 
          value="3" 
          icon={<Calendar className="h-5 w-5" />} 
          status="warning"
        />
        <StatCard 
          title="Pending Review" 
          value="2" 
          icon={<Clock className="h-5 w-5" />} 
          status="info"
        />
        <StatCard 
          title="Completed" 
          value="12" 
          icon={<CheckCircle2 className="h-5 w-5" />} 
          status="success"
        />
        <StatCard 
          title="Issues" 
          value="1" 
          icon={<AlertCircle className="h-5 w-5" />} 
          status="error"
        />
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <TabButton 
            label="Upcoming Filings" 
            isActive={activeTab === 'upcoming'} 
            onClick={() => setActiveTab('upcoming')} 
          />
          <TabButton 
            label="Tax Forms" 
            isActive={activeTab === 'forms'} 
            onClick={() => setActiveTab('forms')} 
          />
          <TabButton 
            label="Payment History" 
            isActive={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
          />
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'upcoming' && <UpcomingFilings />}
        {activeTab === 'forms' && <TaxForms />}
        {activeTab === 'history' && <PaymentHistory />}
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  status: 'success' | 'warning' | 'error' | 'info';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'bg-success/10 text-success';
      case 'warning': return 'bg-warning/10 text-warning';
      case 'error': return 'bg-error/10 text-error';
      case 'info': return 'bg-primary/10 text-primary';
      default: return 'bg-gray-100 text-gray-500';
    }
  };
  
  return (
    <div className="card hover:shadow transition-all">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getStatusColor()}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
};

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
        isActive
          ? 'border-primary text-primary'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

const UpcomingFilings: React.FC = () => {
  const filings = [
    {
      id: '1',
      formNumber: '941',
      description: "Employer's Quarterly Federal Tax Return",
      dueDate: 'April 30, 2025',
      status: 'upcoming',
      agency: 'IRS',
      priority: 'high'
    },
    {
      id: '2',
      formNumber: 'DE 9',
      description: 'Quarterly Contribution Return and Report of Wages',
      dueDate: 'April 30, 2025',
      status: 'upcoming',
      agency: 'CA EDD',
      priority: 'high'
    },
    {
      id: '3',
      formNumber: 'NYS-45',
      description: 'Quarterly Combined Withholding, Wage Reporting & Unemployment Insurance Return',
      dueDate: 'April 30, 2025',
      status: 'upcoming',
      agency: 'NY DOL',
      priority: 'high'
    },
    {
      id: '4',
      formNumber: '940',
      description: "Employer's Annual Federal Unemployment Tax Return",
      dueDate: 'January 31, 2026',
      status: 'future',
      agency: 'IRS',
      priority: 'medium'
    },
    {
      id: '5',
      formNumber: 'W-2',
      description: 'Wage and Tax Statement',
      dueDate: 'January 31, 2026',
      status: 'future',
      agency: 'SSA',
      priority: 'medium'
    }
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 text-xs font-medium bg-error/10 text-error rounded-full">High</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs font-medium bg-warning/10 text-warning rounded-full">Medium</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs font-medium bg-success/10 text-success rounded-full">Low</span>;
      default:
        return null;
    }
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">Upcoming Tax Filings</h2>
        
        <div className="flex w-full sm:w-auto space-x-2">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search filings..."
              className="form-input pl-9 py-2 text-sm"
            />
          </div>
          
          <button className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter size={16} />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto -mx-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="table-header">Form</th>
              <th className="table-header">Description</th>
              <th className="table-header">Due Date</th>
              <th className="table-header">Agency</th>
              <th className="table-header">Priority</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filings.map((filing) => (
              <tr key={filing.id} className="hover:bg-gray-50">
                <td className="table-cell font-medium">{filing.formNumber}</td>
                <td className="table-cell">{filing.description}</td>
                <td className="table-cell">{filing.dueDate}</td>
                <td className="table-cell">{filing.agency}</td>
                <td className="table-cell">{getPriorityBadge(filing.priority)}</td>
                <td className="table-cell">
                  <div className="flex items-center space-x-2">
                    <button className="btn btn-sm btn-outline">Prepare</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TaxForms: React.FC = () => {
  const forms = [
    {
      id: '1',
      formNumber: '941',
      description: "Employer's Quarterly Federal Tax Return",
      year: '2024',
      quarter: 'Q4',
      status: 'Filed',
      filingDate: 'January 15, 2025'
    },
    {
      id: '2',
      formNumber: 'W-2',
      description: 'Wage and Tax Statement',
      year: '2024',
      quarter: 'Annual',
      status: 'Filed',
      filingDate: 'January 28, 2025'
    },
    {
      id: '3',
      formNumber: '1099-NEC',
      description: 'Nonemployee Compensation',
      year: '2024',
      quarter: 'Annual',
      status: 'Filed',
      filingDate: 'January 29, 2025'
    },
    {
      id: '4',
      formNumber: '940',
      description: "Employer's Annual Federal Unemployment Tax Return",
      year: '2024',
      quarter: 'Annual',
      status: 'Filed',
      filingDate: 'January 30, 2025'
    },
    {
      id: '5',
      formNumber: 'DE 9',
      description: 'Quarterly Contribution Return and Report of Wages',
      year: '2024',
      quarter: 'Q4',
      status: 'Filed',
      filingDate: 'January 31, 2025'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Filed':
        return <span className="px-2 py-1 text-xs font-medium bg-success/10 text-success rounded-full">Filed</span>;
      case 'Draft':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">Draft</span>;
      case 'Pending':
        return <span className="px-2 py-1 text-xs font-medium bg-warning/10 text-warning rounded-full">Pending</span>;
      case 'Error':
        return <span className="px-2 py-1 text-xs font-medium bg-error/10 text-error rounded-full">Error</span>;
      default:
        return null;
    }
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">Tax Forms</h2>
        
        <div className="flex w-full sm:w-auto space-x-2">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search forms..."
              className="form-input pl-9 py-2 text-sm"
            />
          </div>
          
          <select className="form-input py-2 text-sm">
            <option>All Years</option>
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto -mx-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="table-header">Form</th>
              <th className="table-header">Description</th>
              <th className="table-header">Year</th>
              <th className="table-header">Period</th>
              <th className="table-header">Status</th>
              <th className="table-header">Filing Date</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {forms.map((form) => (
              <tr key={form.id} className="hover:bg-gray-50">
                <td className="table-cell font-medium">{form.formNumber}</td>
                <td className="table-cell">{form.description}</td>
                <td className="table-cell">{form.year}</td>
                <td className="table-cell">{form.quarter}</td>
                <td className="table-cell">{getStatusBadge(form.status)}</td>
                <td className="table-cell">{form.filingDate}</td>
                <td className="table-cell">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100">
                      <Download size={16} />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100">
                      <FileText size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PaymentHistory: React.FC = () => {
  const payments = [
    {
      id: '1',
      taxType: 'Federal Income Tax',
      amount: '$31,646.91',
      paymentDate: 'January 15, 2025',
      method: 'EFTPS',
      confirmation: 'EF123456789',
      status: 'Completed'
    },
    {
      id: '2',
      taxType: 'Social Security',
      amount: '$19,621.08',
      paymentDate: 'January 15, 2025',
      method: 'EFTPS',
      confirmation: 'EF123456790',
      status: 'Completed'
    },
    {
      id: '3',
      taxType: 'Medicare',
      amount: '$4,588.80',
      paymentDate: 'January 15, 2025',
      method: 'EFTPS',
      confirmation: 'EF123456791',
      status: 'Completed'
    },
    {
      id: '4',
      taxType: 'CA State Income Tax',
      amount: '$7,911.73',
      paymentDate: 'January 15, 2025',
      method: 'EFT',
      confirmation: 'CA987654321',
      status: 'Completed'
    },
    {
      id: '5',
      taxType: 'NY State Income Tax',
      amount: '$5,538.21',
      paymentDate: 'January 15, 2025',
      method: 'EFT',
      confirmation: 'NY876543210',
      status: 'Completed'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <span className="px-2 py-1 text-xs font-medium bg-success/10 text-success rounded-full">Completed</span>;
      case 'Pending':
        return <span className="px-2 py-1 text-xs font-medium bg-warning/10 text-warning rounded-full">Pending</span>;
      case 'Failed':
        return <span className="px-2 py-1 text-xs font-medium bg-error/10 text-error rounded-full">Failed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">Payment History</h2>
        
        <div className="flex w-full sm:w-auto space-x-2">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search payments..."
              className="form-input pl-9 py-2 text-sm"
            />
          </div>
          
          <button className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter size={16} />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto -mx-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="table-header">Tax Type</th>
              <th className="table-header">Amount</th>
              <th className="table-header">Payment Date</th>
              <th className="table-header">Method</th>
              <th className="table-header">Confirmation</th>
              <th className="table-header">Status</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="table-cell font-medium">{payment.taxType}</td>
                <td className="table-cell">{payment.amount}</td>
                <td className="table-cell">{payment.paymentDate}</td>
                <td className="table-cell">{payment.method}</td>
                <td className="table-cell">{payment.confirmation}</td>
                <td className="table-cell">{getStatusBadge(payment.status)}</td>
                <td className="table-cell">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100">
                      <Download size={16} />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100">
                      <FileText size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaxFiling;