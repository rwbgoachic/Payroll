import React, { useEffect, useState } from 'react';
import { DollarSign, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Deduction {
  id: string;
  type: string;
  amount: number;
  frequency: string;
  start_date: string;
  end_date: string | null;
}

interface DeductionsManagerProps {
  employeeId: string;
}

const DeductionsManager: React.FC<DeductionsManagerProps> = ({ employeeId }) => {
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDeduction, setNewDeduction] = useState({
    type: '',
    amount: '',
    frequency: 'per-paycheck',
    start_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadDeductions();
  }, [employeeId]);

  const loadDeductions = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('deductions')
        .select('*')
        .eq('employee_id', employeeId)
        .order('start_date', { ascending: false });

      if (fetchError) throw fetchError;
      setDeductions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deductions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeduction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      const { error: createError } = await supabase
        .from('deductions')
        .insert({
          employee_id: employeeId,
          type: newDeduction.type,
          amount: parseFloat(newDeduction.amount),
          frequency: newDeduction.frequency,
          start_date: newDeduction.start_date
        });

      if (createError) throw createError;

      setShowAddForm(false);
      setNewDeduction({
        type: '',
        amount: '',
        frequency: 'per-paycheck',
        start_date: new Date().toISOString().split('T')[0]
      });
      await loadDeductions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add deduction');
    } finally {
      setLoading(false);
    }
  };

  const handleEndDeduction = async (deductionId: string) => {
    if (!window.confirm('Are you sure you want to end this deduction?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { error: updateError } = await supabase
        .from('deductions')
        .update({
          end_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', deductionId);

      if (updateError) throw updateError;
      await loadDeductions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end deduction');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading && deductions.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">Loading deductions...</div>
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

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Deductions</h3>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={16} className="mr-1" />
          Add Deduction
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddDeduction} className="card bg-gray-50 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="form-label">Type</label>
              <select
                id="type"
                className="form-input"
                value={newDeduction.type}
                onChange={(e) => setNewDeduction(prev => ({ ...prev, type: e.target.value }))}
                required
              >
                <option value="">Select Type</option>
                <option value="401k">401(k)</option>
                <option value="health-insurance">Health Insurance</option>
                <option value="dental-insurance">Dental Insurance</option>
                <option value="vision-insurance">Vision Insurance</option>
                <option value="life-insurance">Life Insurance</option>
                <option value="hsa">HSA Contribution</option>
                <option value="fsa">FSA Contribution</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="form-label">Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={16} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  id="amount"
                  className="form-input pl-10"
                  value={newDeduction.amount}
                  onChange={(e) => setNewDeduction(prev => ({ ...prev, amount: e.target.value }))}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="frequency" className="form-label">Frequency</label>
              <select
                id="frequency"
                className="form-input"
                value={newDeduction.frequency}
                onChange={(e) => setNewDeduction(prev => ({ ...prev, frequency: e.target.value }))}
                required
              >
                <option value="per-paycheck">Per Paycheck</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            <div>
              <label htmlFor="start_date" className="form-label">Start Date</label>
              <input
                type="date"
                id="start_date"
                className="form-input"
                value={newDeduction.start_date}
                onChange={(e) => setNewDeduction(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading}
            >
              Add Deduction
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="table-header">Type</th>
              <th className="table-header">Amount</th>
              <th className="table-header">Frequency</th>
              <th className="table-header">Start Date</th>
              <th className="table-header">End Date</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deductions.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-cell text-center text-gray-500">
                  No deductions found
                </td>
              </tr>
            ) : (
              deductions.map((deduction) => (
                <tr key={deduction.id} className={deduction.end_date ? 'bg-gray-50' : ''}>
                  <td className="table-cell font-medium">
                    {deduction.type.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </td>
                  <td className="table-cell">{formatCurrency(deduction.amount)}</td>
                  <td className="table-cell">
                    {deduction.frequency.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </td>
                  <td className="table-cell">
                    {new Date(deduction.start_date).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    {deduction.end_date ? 
                      new Date(deduction.end_date).toLocaleDateString() : 
                      <span className="text-success">Active</span>
                    }
                  </td>
                  <td className="table-cell">
                    {!deduction.end_date && (
                      <button
                        className="p-1 text-gray-500 hover:text-error rounded-full hover:bg-gray-100"
                        onClick={() => handleEndDeduction(deduction.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeductionsManager;