import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, DollarSign, Mail, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  hireDate: string;
  salaryType: 'hourly' | 'salary';
  salaryAmount: string;
}

const AddEmployee: React.FC = () => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    position: '',
    hireDate: new Date().toISOString().split('T')[0],
    salaryType: 'salary',
    salaryAmount: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

      // Get the company ID for the current user
      const { data: adminEmployee, error: employeeError } = await supabase
        .from('employees')
        .select('company_id')
        .eq('user_id', user?.id)
        .single();

      if (employeeError) throw employeeError;

      // Create employee record
      const { error: createError } = await supabase
        .from('employees')
        .insert({
          company_id: adminEmployee.company_id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          department: formData.department,
          position: formData.position,
          hire_date: formData.hireDate,
          salary_type: formData.salaryType,
          salary_amount: parseFloat(formData.salaryAmount),
          status: 'onboarding'
        });

      if (createError) throw createError;

      navigate('/app/employees');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
          <p className="text-gray-500 mt-1">
            Enter the employee's information to start the onboarding process.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="form-label">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="form-input pl-10"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="form-input pl-10"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input pl-10"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="hireDate" className="form-label">Hire Date</label>
              <input
                type="date"
                id="hireDate"
                name="hireDate"
                className="form-input"
                value={formData.hireDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Position Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="department" className="form-label">Department</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="department"
                  name="department"
                  className="form-input pl-10"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="position" className="form-label">Position</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="position"
                  name="position"
                  className="form-input pl-10"
                  value={formData.position}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="salaryType" className="form-label">Salary Type</label>
              <select
                id="salaryType"
                name="salaryType"
                className="form-input"
                value={formData.salaryType}
                onChange={handleChange}
                required
              >
                <option value="salary">Salary</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>

            <div>
              <label htmlFor="salaryAmount" className="form-label">
                {formData.salaryType === 'salary' ? 'Annual Salary' : 'Hourly Rate'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={16} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  id="salaryAmount"
                  name="salaryAmount"
                  className="form-input pl-10"
                  value={formData.salaryAmount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/app/employees')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Adding Employee...' : 'Add Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;