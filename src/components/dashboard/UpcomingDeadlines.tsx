import React from 'react';
import { format } from 'date-fns';
import { CalendarClock, CheckCircle2 } from 'lucide-react';

interface Deadline {
  id: string;
  title: string;
  description: string;
  date: Date;
  completed: boolean;
  type: 'tax' | 'payroll' | 'report';
}

const deadlines: Deadline[] = [
  {
    id: '1',
    title: 'Federal Tax Deposit',
    description: 'Monthly deposit for withheld income and FICA taxes',
    date: new Date(2025, 0, 15),
    completed: false,
    type: 'tax'
  },
  {
    id: '2',
    title: 'CA State Tax Filing',
    description: 'Quarterly Filing for CA employment taxes (DE 9)',
    date: new Date(2025, 0, 31),
    completed: false,
    type: 'tax'
  },
  {
    id: '3',
    title: 'Bi-weekly Payroll',
    description: 'Process payroll for 42 employees',
    date: new Date(2025, 0, 10),
    completed: true,
    type: 'payroll'
  },
  {
    id: '4',
    title: 'NY State Wage Filing',
    description: 'NYS-45 Quarterly Filing',
    date: new Date(2025, 0, 31),
    completed: false,
    type: 'tax'
  },
  {
    id: '5',
    title: 'Monthly Financial Report',
    description: 'Generate payroll expense report for finance department',
    date: new Date(2025, 0, 5),
    completed: true,
    type: 'report'
  }
];

const UpcomingDeadlines: React.FC = () => {
  // Sort deadlines: incomplete first, then by date
  const sortedDeadlines = [...deadlines].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return a.date.getTime() - b.date.getTime();
  });

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'tax':
        return 'text-error';
      case 'payroll':
        return 'text-primary';
      case 'report':
        return 'text-secondary';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Upcoming Deadlines</h2>
        <CalendarClock size={20} className="text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {sortedDeadlines.map((deadline) => (
          <div
            key={deadline.id}
            className={`flex items-start p-3 rounded-md transition-colors ${
              deadline.completed 
                ? 'bg-gray-50' 
                : 'bg-white hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              {deadline.completed ? (
                <CheckCircle2 size={18} className="text-success" />
              ) : (
                <div className={`h-4 w-4 rounded-full ${getTypeColor(deadline.type)} bg-current`} />
              )}
            </div>
            
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${deadline.completed ? 'text-gray-500' : 'text-gray-900'}`}>
                  {deadline.title}
                </p>
                <p className={`text-xs ${deadline.completed ? 'text-gray-400' : getTypeColor(deadline.type)}`}>
                  {format(deadline.date, 'MMM dd')}
                </p>
              </div>
              <p className="mt-1 text-xs text-gray-500">{deadline.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="btn btn-outline w-full mt-4 text-sm">
        View All Deadlines
      </button>
    </div>
  );
};

export default UpcomingDeadlines;