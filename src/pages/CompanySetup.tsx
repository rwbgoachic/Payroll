import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, DollarSign, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface PayrollSettings {
  payFrequency: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly';
  payrollStartDate: string;
  defaultPayDay: number;
}

const CompanySetup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [payrollSettings, setPayrollSettings] = useState<PayrollSettings>({
    payFrequency: 'bi-weekly',
    payrollStartDate: '',
    defaultPayDay: 15,
  });

  const handlePayrollSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPayrollSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      // Get the company ID for the current user
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('company_id')
        .eq('user_id', user?.id)
        .single();

      if (employeeError) throw employeeError;

      // Update company settings
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          pay_frequency: payrollSettings.payFrequency,
          pay_period_start: payrollSettings.payrollStartDate,
          default_pay_day: payrollSettings.defaultPayDay
        })
        .eq('id', employee.company_id);

      if (updateError) throw updateError;

      // Redirect to dashboard
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                <Building2 size={24} />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Welcome to PaySurity!</h2>
              <p className="mt-2 text-gray-600">
                Let's get your company set up with everything you need to manage payroll effectively.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card text-center">
                <div className="h-12 w-12 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto">
                  <Users size={24} />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Employee Management</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Add and manage your employees, their roles, and compensation.
                </p>
              </div>

              <div className="card text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                  <DollarSign size={24} />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Payroll Processing</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Set up your payroll schedule and process payments efficiently.
                </p>
              </div>

              <div className="card text-center">
                <div className="h-12 w-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Tax Compliance</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Stay compliant with automatic tax calculations and filings.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep(2)}
              >
                Get Started
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                <DollarSign size={24} />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Payroll Settings</h2>
              <p className="mt-2 text-gray-600">
                Configure your payroll schedule and payment preferences.
              </p>
            </div>

            <div className="card">
              <div className="space-y-4">
                <div>
                  <label htmlFor="payFrequency" className="form-label">Pay Frequency</label>
                  <select
                    id="payFrequency"
                    name="payFrequency"
                    className="form-input"
                    value={payrollSettings.payFrequency}
                    onChange={handlePayrollSettingsChange}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="semi-monthly">Semi-monthly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="payrollStartDate" className="form-label">First Pay Period Start Date</label>
                  <input
                    type="date"
                    id="payrollStartDate"
                    name="payrollStartDate"
                    className="form-input"
                    value={payrollSettings.payrollStartDate}
                    onChange={handlePayrollSettingsChange}
                  />
                </div>

                <div>
                  <label htmlFor="defaultPayDay" className="form-label">Default Pay Day</label>
                  <select
                    id="defaultPayDay"
                    name="defaultPayDay"
                    className="form-input"
                    value={payrollSettings.defaultPayDay}
                    onChange={handlePayrollSettingsChange}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    For bi-weekly/weekly pay periods, this will be adjusted to the nearest business day.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderStep()}
      </div>
    </div>
  );
};

export default CompanySetup;