import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Save, X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { TimeTrackingService, TimeEntry } from '../../services/timeTrackingService';

const TimeTracking: React.FC = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [employeeId, setEmployeeId] = useState<string>('');
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    breakDuration: '00:30:00',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      loadEmployeeId();
    }
  }, [user]);

  useEffect(() => {
    if (employeeId) {
      loadTimeEntries();
    }
  }, [employeeId]);

  const loadEmployeeId = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setEmployeeId(data.id);
    } catch (err) {
      setError('Failed to load employee information');
    }
  };

  const loadTimeEntries = async () => {
    try {
      setLoading(true);
      
      // Get current month's date range
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const entries = await TimeTrackingService.getTimeEntries(
        employeeId,
        startOfMonth.toISOString().split('T')[0],
        endOfMonth.toISOString().split('T')[0]
      );
      
      setEntries(entries);
    } catch (err) {
      setError('Failed to load time entries');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await TimeTrackingService.createTimeEntry(
        employeeId,
        formData.date,
        formData.startTime,
        formData.endTime || null,
        formData.breakDuration,
        formData.notes
      );
      
      setSuccess('Time entry saved successfully');
      setShowForm(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        breakDuration: '00:30:00',
        notes: ''
      });
      
      await loadTimeEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save time entry');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium bg-success/10 text-success rounded-full">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-error/10 text-error rounded-full">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-warning/10 text-warning rounded-full">Pending</span>;
    }
  };

  const calculateHours = (entry: TimeEntry): number => {
    return TimeTrackingService.calculateHours(entry);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock size={20} className="text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <>
              <X size={16} className="mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus size={16} className="mr-2" />
              Add Time Entry
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded" data-testid="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded" data-testid="success-message">
          {success}
        </div>
      )}

      {showForm && (
        <div className="card bg-gray-50 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">New Time Entry</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="form-label">Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    className="form-input pl-10"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="startTime" className="form-label">Start Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    className="form-input pl-10"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="endTime" className="form-label">End Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    className="form-input pl-10"
                    value={formData.endTime}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="breakDuration" className="form-label">Break Duration (HH:MM:SS)</label>
                <input
                  type="text"
                  id="breakDuration"
                  name="breakDuration"
                  className="form-input"
                  value={formData.breakDuration}
                  onChange={handleChange}
                  pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                  placeholder="00:30:00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="form-label">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="form-input"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any notes about this time entry..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                <Save size={16} className="mr-2" />
                {loading ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Time Entries</h2>
        
        {loading && entries.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading time entries...</div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Start Time</th>
                  <th className="table-header">End Time</th>
                  <th className="table-header">Hours</th>
                  <th className="table-header">Break</th>
                  <th className="table-header">Notes</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-cell text-center text-gray-500">
                      No time entries found
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="table-cell">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="table-cell">{formatTime(entry.start_time)}</td>
                      <td className="table-cell">
                        {entry.end_time ? formatTime(entry.end_time) : '-'}
                      </td>
                      <td className="table-cell">
                        {entry.end_time ? calculateHours(entry).toFixed(2) : '-'}
                      </td>
                      <td className="table-cell">{entry.break_duration}</td>
                      <td className="table-cell">{entry.notes || '-'}</td>
                      <td className="table-cell">{getStatusBadge(entry.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTracking;