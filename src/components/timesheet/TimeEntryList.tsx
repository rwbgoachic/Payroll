import React, { useEffect, useState } from 'react';
import { Check, Clock, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface TimeEntry {
  id: string;
  date: string;
  start_time: string;
  end_time: string | null;
  break_duration: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
}

interface TimeEntryListProps {
  employeeId: string;
  isManager?: boolean;
}

const TimeEntryList: React.FC<TimeEntryListProps> = ({ employeeId, isManager = false }) => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadEntries();
  }, [employeeId]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('employee_id', employeeId)
        .order('date', { ascending: false })
        .order('start_time', { ascending: false });

      if (fetchError) throw fetchError;
      setEntries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load time entries');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (entryId: string) => {
    try {
      setLoading(true);
      setError('');

      const { error: updateError } = await supabase
        .from('time_entries')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (updateError) throw updateError;
      await loadEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve time entry');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (entryId: string) => {
    try {
      setLoading(true);
      setError('');

      const { error: updateError } = await supabase
        .from('time_entries')
        .update({
          status: 'rejected',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (updateError) throw updateError;
      await loadEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject time entry');
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

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">Loading time entries...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="table-header">Date</th>
              <th className="table-header">Start Time</th>
              <th className="table-header">End Time</th>
              <th className="table-header">Break</th>
              <th className="table-header">Notes</th>
              <th className="table-header">Status</th>
              {isManager && <th className="table-header">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={isManager ? 7 : 6} className="table-cell text-center text-gray-500">
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
                  <td className="table-cell">{entry.break_duration}</td>
                  <td className="table-cell">{entry.notes || '-'}</td>
                  <td className="table-cell">{getStatusBadge(entry.status)}</td>
                  {isManager && (
                    <td className="table-cell">
                      {entry.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-1 text-gray-500 hover:text-success rounded-full hover:bg-gray-100"
                            onClick={() => handleApprove(entry.id)}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            className="p-1 text-gray-500 hover:text-error rounded-full hover:bg-gray-100"
                            onClick={() => handleReject(entry.id)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimeEntryList;