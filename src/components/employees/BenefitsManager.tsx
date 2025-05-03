import React, { useEffect, useState } from 'react';
import { Heart, Plus, Settings, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Benefit {
  id: string;
  type: string;
  plan_name: string;
  coverage_level: string;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'pending' | 'terminated';
  annual_cost: number;
  employee_contribution: number;
  employer_contribution: number;
}

interface BenefitsManagerProps {
  employeeId: string;
}

const BenefitsManager: React.FC<BenefitsManagerProps> = ({ employeeId }) => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBenefit, setNewBenefit] = useState({
    type: '',
    plan_name: '',
    coverage_level: 'individual',
    start_date: new Date().toISOString().split('T')[0],
    annual_cost: '',
    employee_contribution: '',
    employer_contribution: ''
  });

  useEffect(() => {
    loadBenefits();
  }, [employeeId]);

  const loadBenefits = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('benefits')
        .select('*')
        .eq('employee_id', employeeId)
        .order('start_date', { ascending: false });

      if (fetchError) throw fetchError;
      setBenefits(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load benefits');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBenefit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      const { error: createError } = await supabase
        .from('benefits')
        .insert({
          employee_id: employeeId,
          type: newBenefit.type,
          plan_name: newBenefit.plan_name,
          coverage_level: newBenefit.coverage_level,
          start_date: newBenefit.start_date,
          status: 'active',
          annual_cost: parseFloat(newBenefit.annual_cost),
          employee_contribution: parseFloat(newBenefit.employee_contribution),
          employer_contribution: parseFloat(newBenefit.employer_contribution)
        });

      if (createError) throw createError;

      setShowAddForm(false);
      setNewBenefit({
        type: '',
        plan_name: '',
        coverage_level: 'individual',
        start_date: new Date().toISOString().split('T')[0],
        annual_cost: '',
        employee_contribution: '',
        employer_contribution: ''
      });
      await loadBenefits();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add benefit');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateBenefit = async (benefitId: string) => {
    if (!window.confirm('Are you sure you want to terminate this benefit?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { error: updateError } = await supabase
        .from('benefits')
        .update({
          status: 'terminated',
          end_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', benefitId);

      if (updateError) throw updateError;
      await loadBenefits();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to terminate benefit');
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-success/10 text-success rounded-full">Active</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-warning/10 text-warning rounded-full">Pending</span>;
      case 'terminated':
        return <span className="px-2 py-1 text-xs font-medium bg-error/10 text-error rounded-full">Terminated</span>;
      default:
        return null;
    }
  };

  if (loading && benefits.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">Loading benefits...</div>
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
        <div className="flex items-center space-x-2">
          <Heart size={20} className="text-primary" />
          <h3 className="text-lg font-medium text-gray-900">Benefits</h3>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={16} className="mr-1" />
          Add Benefit
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddBenefit} className="card bg-gray-50 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="form-label">Benefit Type</label>
              <select
                id="type"
                className="form-input"
                value={newBenefit.type}
                onChange={(e) => setNewBenefit(prev => ({ ...prev, type: e.target.value }))}
                required
              >
                <option value="">Select Type</option>
                <option value="health">Health Insurance</option>
                <option value="dental">Dental Insurance</option>
                <option value="vision">Vision Insurance</option>
                <option value="life">Life Insurance</option>
                <option value="disability">Disability Insurance</option>
                <option value="retirement">Retirement Plan</option>
              </select>
            </div>

            <div>
              <label htmlFor="plan_name" className="form-label">Plan Name</label>
              <input
                type="text"
                id="plan_name"
                className="form-input"
                value={newBenefit.plan_name}
                onChange={(e) => setNewBenefit(prev => ({ ...prev, plan_name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label htmlFor="coverage_level" className="form-label">Coverage Level</label>
              <select
                id="coverage_level"
                className="form-input"
                value={newBenefit.coverage_level}
                onChange={(e) => setNewBenefit(prev => ({ ...prev, coverage_level: e.target.value }))}
                required
              >
                <option value="individual">Individual</option>
                <option value="individual-plus-spouse">Individual + Spouse</option>
                <option value="family">Family</option>
              </select>
            </div>

            <div>
              <label htmlFor="start_date" className="form-label">Start Date</label>
              <input
                type="date"
                id="start_date"
                className="form-input"
                value={newBenefit.start_date}
                onChange={(e) => setNewBenefit(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>

            <div>
              <label htmlFor="annual_cost" className="form-label">Annual Cost</label>
              <input
                type="number"
                id="annual_cost"
                className="form-input"
                value={newBenefit.annual_cost}
                onChange={(e) => setNewBenefit(prev => ({ ...prev, annual_cost: e.target.value }))}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="employee_contribution" className="form-label">Employee Contribution</label>
              <input
                type="number"
                id="employee_contribution"
                className="form-input"
                value={newBenefit.employee_contribution}
                onChange={(e) => setNewBenefit(prev => ({ ...prev, employee_contribution: e.target.value }))}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="employer_contribution" className="form-label">Employer Contribution</label>
              <input
                type="number"
                id="employer_contribution"
                className="form-input"
                value={newBenefit.employer_contribution}
                onChange={(e) => setNewBenefit(prev => ({ ...prev, employer_contribution: e.target.value }))}
                step="0.01"
                min="0"
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
              Add Benefit
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="table-header">Benefit</th>
              <th className="table-header">Plan</th>
              <th className="table-header">Coverage</th>
              <th className="table-header">Annual Cost</th>
              <th className="table-header">Employee Cost</th>
              <th className="table-header">Employer Cost</th>
              <th className="table-header">Status</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {benefits.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-cell text-center text-gray-500">
                  No benefits found
                </td>
              </tr>
            ) : (
              benefits.map((benefit) => (
                <tr key={benefit.id} className={benefit.status === 'terminated' ? 'bg-gray-50' : ''}>
                  <td className="table-cell font-medium">
                    {benefit.type.charAt(0).toUpperCase() + benefit.type.slice(1)}
                  </td>
                  <td className="table-cell">{benefit.plan_name}</td>
                  <td className="table-cell">
                    {benefit.coverage_level.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </td>
                  <td className="table-cell">{formatCurrency(benefit.annual_cost)}</td>
                  <td className="table-cell">{formatCurrency(benefit.employee_contribution)}</td>
                  <td className="table-cell">{formatCurrency(benefit.employer_contribution)}</td>
                  <td className="table-cell">{getStatusBadge(benefit.status)}</td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100"
                        onClick={() => {/* TODO: Implement edit benefit */}}
                      >
                        <Settings size={16} />
                      </button>
                      {benefit.status === 'active' && (
                        <button
                          className="p-1 text-gray-500 hover:text-error rounded-full hover:bg-gray-100"
                          onClick={() => handleTerminateBenefit(benefit.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
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

export default BenefitsManager;