import React, { useState, useEffect } from 'react';
import { Heart, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BenefitsService, Benefit, BenefitPlan } from '../../services/benefitsService';

const Benefits: React.FC = () => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [availablePlans, setAvailablePlans] = useState<BenefitPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [employeeId, setEmployeeId] = useState<string>('');
  const [companyId, setCompanyId] = useState<string>('');
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    planId: '',
    coverageLevel: 'individual',
    startDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user) {
      loadEmployeeData();
    }
  }, [user]);

  useEffect(() => {
    if (employeeId && companyId) {
      loadBenefits();
      loadAvailablePlans();
    }
  }, [employeeId, companyId]);

  const loadEmployeeData = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, company_id')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setEmployeeId(data.id);
      setCompanyId(data.company_id);
    } catch (err) {
      setError('Failed to load employee information');
    }
  };

  const loadBenefits = async () => {
    try {
      setLoading(true);
      const benefits = await BenefitsService.getEmployeeBenefits(employeeId);
      setBenefits(benefits);
    } catch (err) {
      setError('Failed to load benefits');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailablePlans = async () => {
    try {
      const plans = await BenefitsService.getBenefitPlans(companyId);
      setAvailablePlans(plans);
    } catch (err) {
      setError('Failed to load benefit plans');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const selectedPlan = availablePlans.find(plan => plan.id === formData.planId);
      if (!selectedPlan) {
        throw new Error('Selected plan not found');
      }
      
      // Calculate costs based on coverage level
      let annualCost = 6000; // Default annual cost
      let employeeContribution = 1200; // Default employee contribution
      let employerContribution = 4800; // Default employer contribution
      
      // Adjust costs based on coverage level
      if (formData.coverageLevel === 'individual-plus-spouse') {
        annualCost = 9000;
        employeeContribution = 1800;
        employerContribution = 7200;
      } else if (formData.coverageLevel === 'family') {
        annualCost = 12000;
        employeeContribution = 2400;
        employerContribution = 9600;
      }
      
      await BenefitsService.enrollInBenefit(
        employeeId,
        selectedPlan.type,
        selectedPlan.name,
        formData.coverageLevel as any,
        formData.startDate,
        annualCost,
        employeeContribution,
        employerContribution
      );
      
      setSuccess('Enrollment successful');
      setShowEnrollForm(false);
      setFormData({
        planId: '',
        coverageLevel: 'individual',
        startDate: new Date().toISOString().split('T')[0]
      });
      
      await loadBenefits();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll in benefit');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminate = async (benefitId: string) => {
    if (!window.confirm('Are you sure you want to terminate this benefit?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await BenefitsService.terminateBenefit(
        benefitId,
        new Date().toISOString().split('T')[0]
      );

      setSuccess('Benefit terminated successfully');
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
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading benefits...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart size={20} className="text-primary" />
          <h2 className="text-2xl font-bold text-gray-900">Benefits</h2>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowEnrollForm(!showEnrollForm)}
        >
          {showEnrollForm ? 'Cancel' : 'Enroll in Benefits'}
        </button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded" data-testid="success-message">
          {success}
        </div>
      )}

      {showEnrollForm && (
        <div className="card bg-gray-50 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Enroll in Benefits</h3>
          
          <form onSubmit={handleEnroll} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="planId" className="form-label">Select Plan</label>
                <select
                  id="planId"
                  name="planId"
                  className="form-input"
                  value={formData.planId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a plan</option>
                  {availablePlans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} ({plan.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="coverageLevel" className="form-label">Coverage Level</label>
                <select
                  id="coverageLevel"
                  name="coverageLevel"
                  className="form-input"
                  value={formData.coverageLevel}
                  onChange={handleChange}
                  required
                >
                  <option value="individual">Individual</option>
                  <option value="individual-plus-spouse">Individual + Spouse</option>
                  <option value="family">Family</option>
                </select>
              </div>

              <div>
                <label htmlFor="startDate" className="form-label">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="form-input"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowEnrollForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Enrolling...' : 'Confirm Enrollment'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Benefits</h3>
        
        <div className="overflow-x-auto -mx-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="table-header">Benefit</th>
                <th className="table-header">Plan</th>
                <th className="table-header">Coverage</th>
                <th className="table-header">Annual Cost</th>
                <th className="table-header">Your Cost</th>
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
                      {benefit.status === 'active' && (
                        <button
                          className="p-1 text-gray-500 hover:text-error rounded-full hover:bg-gray-100"
                          onClick={() => handleTerminate(benefit.id)}
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
    </div>
  );
};

export default Benefits;