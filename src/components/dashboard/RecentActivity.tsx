import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, FilePlus, UserPlus, AlertCircle, DollarSign } from 'lucide-react';

interface Activity {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  user: {
    name: string;
    role: string;
  };
  icon: 'user' | 'file' | 'alert' | 'payment' | 'check';
}

const activities: Activity[] = [
  {
    id: '1',
    action: 'Added new employee',
    description: 'Jessica Williams was added to the system',
    timestamp: new Date(2025, 0, 5, 14, 32),
    user: {
      name: 'Sarah Connor',
      role: 'HR Manager'
    },
    icon: 'user'
  },
  {
    id: '2',
    action: 'Filed quarterly taxes',
    description: 'Q4 2024 Federal 941 form submitted',
    timestamp: new Date(2025, 0, 4, 11, 15),
    user: {
      name: 'John Smith',
      role: 'Administrator'
    },
    icon: 'file'
  },
  {
    id: '3',
    action: 'Payroll processed',
    description: 'Bi-weekly payroll for 42 employees ($158,234.56)',
    timestamp: new Date(2025, 0, 3, 16, 45),
    user: {
      name: 'John Smith',
      role: 'Administrator'
    },
    icon: 'payment'
  },
  {
    id: '4',
    action: 'Tax notice received',
    description: 'IRS CP2100 notice: Tax ID Number mismatch',
    timestamp: new Date(2025, 0, 2, 9, 22),
    user: {
      name: 'System',
      role: 'Automated'
    },
    icon: 'alert'
  },
  {
    id: '5',
    action: 'Verified employee data',
    description: 'Annual verification of employee information completed',
    timestamp: new Date(2025, 0, 1, 10, 11),
    user: {
      name: 'Sarah Connor',
      role: 'HR Manager'
    },
    icon: 'check'
  }
];

const RecentActivity: React.FC = () => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <UserPlus size={16} className="text-primary" />;
      case 'file':
        return <FilePlus size={16} className="text-secondary" />;
      case 'alert':
        return <AlertCircle size={16} className="text-error" />;
      case 'payment':
        return <DollarSign size={16} className="text-accent" />;
      case 'check':
        return <CheckCircle size={16} className="text-success" />;
      default:
        return null;
    }
  };

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex">
            <div className="flex-shrink-0 mt-1">
              <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center">
                {getIcon(activity.icon)}
              </div>
            </div>
            
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">
                  {format(activity.timestamp, 'MMM dd, h:mm a')}
                </p>
              </div>
              <p className="mt-1 text-xs text-gray-500">{activity.description}</p>
              <p className="mt-1 text-xs font-medium text-gray-400">
                by {activity.user.name} • {activity.user.role}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="btn btn-outline w-full mt-4 text-sm">
        View All Activity
      </button>
    </div>
  );
};

export default RecentActivity;