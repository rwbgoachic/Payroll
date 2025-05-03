import React, { useState } from 'react';
import { Clock, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TimeEntryFormProps {
  employeeId: string;
  onSuccess: () => void;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ employeeId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    breakDuration: '0',
    notes: ''
  });

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

      const { error: createError } = await supabase
        .from('time_entries')
        .insert({
          employee_id: employeeId,
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime || null,
          break_duration: `${formData.breakDuration} minutes`,
          notes: formData.notes
        });

      if (createError) throw createError;

      setFormData({
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        breakDuration: '0',
        notes: ''
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save time entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="form-label">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            className="form-input"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="startTime" className="form-label">Start Time</label>
          <input
            type="time"
            id="startTime"
            name="startTime"
            className="form-input"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="endTime" className="form-label">End Time</label>
          <input
            type="time"
            id="endTime"
            name="endTime"
            className="form-input"
            value={formData.endTime}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="breakDuration" className="form-label">Break Duration (minutes)</label>
          <input
            type="number"
            id="breakDuration"
            name="breakDuration"
            className="form-input"
            value={formData.breakDuration}
            onChange={handleChange}
            min="0"
            step="1"
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

      <div className="flex justify-end">
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
  );
};

export default TimeEntryForm;