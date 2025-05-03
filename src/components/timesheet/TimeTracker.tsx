import React, { useState } from 'react';
import { Clock, Plus } from 'lucide-react';
import TimeEntryForm from './TimeEntryForm';
import TimeEntryList from './TimeEntryList';

interface TimeTrackerProps {
  employeeId: string;
  isManager?: boolean;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ employeeId, isManager = false }) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock size={20} className="text-primary" />
          <h3 className="text-lg font-medium text-gray-900">Time Tracking</h3>
        </div>
        {!isManager && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={16} className="mr-1" />
            Add Time Entry
          </button>
        )}
      </div>

      {showForm && (
        <div className="card bg-gray-50 border border-gray-200">
          <TimeEntryForm
            employeeId={employeeId}
            onSuccess={() => {
              setShowForm(false);
            }}
          />
        </div>
      )}

      <TimeEntryList employeeId={employeeId} isManager={isManager} />
    </div>
  );
};

export default TimeTracker;