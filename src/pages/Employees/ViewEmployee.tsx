import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Building2, 
  Calendar,
  DollarSign, 
  Edit2, 
  Mail, 
  Save,
  Trash2, 
  User,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import DeductionsManager from '../../components/employees/DeductionsManager';
import TimeTracker from '../../components/timesheet/TimeTracker';
import BenefitsManager from '../../components/employees/BenefitsManager';

type Employee = Database['public']['Tables']['employees']['Row'];

const ViewEmployee: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editData, setEditData] = useState<Partial<Employee>>({});
  const [activeTab, setActiveTab] = useState<'details' | 'deductions' | 'timesheet' | 'benefits'>('details');

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      setEmployee(data);
      setEditData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employee');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      const { error: updateError } = await supabase
        .from('employees')
        .update({
          first_name: editData.first_name,
          last_name: editData.last_name,
          email: editData.email,
          department: editData.department,
          position: editData.position,
          salary_type: editData.salary_type,
          salary_amount: editData.salary_amount,
          status: editData.status
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setEmployee(prev => ({ ...prev!, ...editData }));
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminate = async () => {
    if (!window.confirm('Are you sure you want to terminate this employee?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { error: updateError } = await supabase
        .from('employees')
        .update({
          status: 'inactive',
          termination_date: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      navigate('/app/employees');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to terminate employee');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Employee not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/app/employees')}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {employee.first_name} {employee.last_name}
            </h1>
            <p className="text-gray-500">{employee.position}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditData(employee);
                }}
              >
                <X size={16} className="mr-2" />
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={loading}
              >
                <Save size={16} className="mr-2" />
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-outline text-error hover:bg-error/10 hover:border-error"
                onClick={handleTerminate}
                disabled={employee.status === 'inactive'}
              >
                <Trash2 size={16} className="mr-2" />
                Terminate
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={16} className="mr-2" />
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Employee Details
          </button>
          <button
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'benefits'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('benefits')}
          >
            Benefits
          </button>
          <button
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'deductions'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('deductions')}
          >
            Deductions
          </button>
          <button
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'timesheet'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('timesheet')}
          >
            Time Tracking
          </button>
        </nav>
      </div>

      {activeTab === 'details' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className="form-label">First Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      className="form-input pl-10"
                      value={isEditing ? editData.first_name : employee.first_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="last_name" className="form-label">Last Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      className="form-input pl-10"
                      value={isEditing ? editData.last_name : employee.last_name}
                      onChange={handleChange}
                      disabled={!isEditing}
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
                      value={isEditing ? editData.email : employee.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="hire_date" className="form-label">Hire Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="hire_date"
                      name="hire_date"
                      className="form-input pl-10"
                      value={employee.hire_date}
                      disabled
                    />
                  </div>
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
                      value={isEditing ? editData.department : employee.department || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
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
                      value={isEditing ? editData.position : employee.position || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="salary_type" className="form-label">Salary Type</label>
                  <select
                    id="salary_type"
                    name="salary_type"
                    className="form-input"
                    value={isEditing ? editData.salary_type : employee.salary_type}
                    onChange={handleChange}
                    disabled={!isEditing}
                  >
                    <option value="salary">Salary</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="salary_amount" className="form-label">
                    {employee.salary_type === 'salary' ? 'Annual Salary' : 'Hourly Rate'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="salary_amount"
                      name="salary_amount"
                      className="form-input pl-10"
                      value={isEditing ? editData.salary_amount : employee.salary_amount}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    id="status"
                    name="status"
                    className="form-input"
                    value={isEditing ? editData.status : employee.status}
                    onChange={handleChange}
                    disabled={!isEditing}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="onboarding">Onboarding</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Employee Summary</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Employment Status</div>
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      employee.status === 'active' ? 'bg-success/10 text-success' :
                      employee.status === 'inactive' ? 'bg-error/10 text-error' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Time with Company</div>
                  <div className="mt-1 font-medium">
                    {(() => {
                      const start = new Date(employee.hire_date);
                      const end = employee.termination_date ? new Date(employee.termination_date) : new Date();
                      const years = end.getFullYear() - start.getFullYear();
                      const months = end.getMonth() - start.getMonth();
                      if (years === 0) {
                        return `${months} months`;
                      }
                      return `${years} years, ${months} months`;
                    })()}
                  </div>
                </div>

                {employee.termination_date && (
                  <div>
                    <div className="text-sm text-gray-500">Termination Date</div>
                    <div className="mt-1 font-medium">
                      {new Date(employee.termination_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Last Pay Date</span>
                  <span className="font-medium">Apr 15, 2025</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Last Review</span>
                  <span className="font-medium">Mar 1, 2025</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Benefits Updated</span>
                  <span className="font-medium">Jan 15, 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'benefits' ? (
        <div className="card">
          <BenefitsManager employeeId={employee.id} />
        </div>
      ) : activeTab === 'deductions' ? (
        <div className="card">
          <DeductionsManager employeeId={employee.id} />
        </div>
      ) : (
        <div className="card">
          <TimeTracker 
            employeeId={employee.id} 
            isManager={employee.role === 'admin' || employee.role === 'manager'} 
          />
        </div>
      )}
    </div>
  );
};

export default ViewEmployee;