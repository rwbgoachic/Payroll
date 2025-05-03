import React from 'react';
import EmployeeTable from '../components/employees/EmployeeTable';

const Employees: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-500 mt-1">
            Manage your workforce, view employee information, and process onboarding/offboarding.
          </p>
        </div>
      </div>
      
      <EmployeeTable />
    </div>
  );
};

export default Employees;