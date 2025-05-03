import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Users, Filter } from 'lucide-react';
import { PayrollService } from '../../services/payrollService';
import { supabase } from '../../lib/supabase';

interface PayrollFormProps {
  companyId: string;
  onSubmit: (periodId: string, employeeIds: string[]) => void;
}

const PayrollForm: React.FC<PayrollFormProps> = ({ companyId, onSubmit }) => {
  const [periods, setPeriods] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load payroll periods
      const periods = await PayrollService.getPendingPayrollPeriods(companyId);
      setPeriods(periods);
      if (periods.length > 0) {
        setSelectedPeriodId(periods[0].id);
      }

      // Load employees
      const employees = await PayrollService.getActiveEmployees(companyId);
      setEmployees(employees);
      setSelectedEmployees(employees.map(emp => emp.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredEmployees = filterEmployees().map(emp => emp.id);
      setSelectedEmployees(filteredEmployees);
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees(prev => [...prev, employeeId]);
    } else {
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPeriodId) {
      setError('Please select a payroll period');
      return;
    }

    if (selectedEmployees.length === 0) {
      setError('Please select at least one employee');
      return;
    }

    onSubmit(selectedPeriodId, selectedEmployees);
  };

  const filterEmployees = () => {
    return employees.filter(employee => {
      const matchesSearch = 
        employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
      
      return matchesSearch && matchesDepartment;
    });
  };

  const getDepartments = () => {
    const departments = new Set<string>();
    employees.forEach(emp => {
      if (emp.department) {
        departments.add(emp.department);
      }
    });
    return Array.from(departments);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Payroll Setup</h2>
      
      {error && (
        <div className="mb-4 bg-error/10 border border-error/20 text-error px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Payroll Period</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="period-select" className="form-label">Select Pay Period</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <select 
                    id="period-select" 
                    className="form-input pl-10"
                    value={selectedPeriodId}
                    onChange={(e) => setSelectedPeriodId(e.target.value)}
                    data-testid="payroll-period"
                  >
                    <option value="">Select a period</option>
                    {periods.map(period => (
                      <option key={period.id} value={period.id}>
                        {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()} (Pay: {new Date(period.pay_date).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {periods.length === 0 && (
                <div className="bg-warning/10 border border-warning/20 text-warning px-4 py-3 rounded">
                  No pending payroll periods found. Please create a new period.
                </div>
              )}
              
              <div className="flex justify-end">
                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {/* TODO: Implement create new period */}}
                >
                  Create New Period
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Employee Selection</h3>
            
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="form-input pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="ml-2">
                <select
                  className="form-input py-2 text-sm"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {getDepartments().map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-md">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center">
                <input
                  type="checkbox"
                  id="select-all"
                  className="h-4 w-4 text-primary rounded border-gray-300"
                  checked={selectedEmployees.length === filterEmployees().length && filterEmployees().length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <label htmlFor="select-all" className="ml-2 text-sm text-gray-700">
                  Select All ({filterEmployees().length} employees)
                </label>
              </div>
              
              <div className="max-h-64 overflow-y-auto p-2">
                {filterEmployees().length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No employees found
                  </div>
                ) : (
                  filterEmployees().map((employee) => (
                    <div key={employee.id} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                      <input
                        type="checkbox"
                        id={`employee-${employee.id}`}
                        className="h-4 w-4 text-primary rounded border-gray-300"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={(e) => handleSelectEmployee(employee.id, e.target.checked)}
                      />
                      <label htmlFor={`employee-${employee.id}`} className="ml-2 flex-grow">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.first_name} {employee.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {employee.department ? `${employee.department} • ` : ''}{employee.position || 'Employee'}
                        </div>
                      </label>
                      <div className="text-xs text-gray-500">
                        {employee.salary_type === 'salary' 
                          ? `$${employee.salary_amount.toLocaleString()}/year` 
                          : `$${employee.salary_amount.toFixed(2)}/hour`
                        }
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            type="submit"
            className="btn btn-primary"
            disabled={!selectedPeriodId || selectedEmployees.length === 0}
          >
            <Calculator size={16} className="mr-2" />
            Calculate Payroll
          </button>
        </div>
      </form>
    </div>
  );
};

export default PayrollForm;