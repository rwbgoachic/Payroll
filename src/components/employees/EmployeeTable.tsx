import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Download, 
  Edit, 
  MoreHorizontal, 
  SearchIcon, 
  Trash2, 
  UserPlus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: 'active' | 'inactive' | 'onboarding';
  startDate: string;
}

const employees: Employee[] = [
  {
    id: '1',
    name: 'Jessica Williams',
    email: 'jessica.williams@example.com',
    department: 'Engineering',
    position: 'Senior Developer',
    status: 'active',
    startDate: '2022-03-15'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    department: 'Marketing',
    position: 'Marketing Manager',
    status: 'active',
    startDate: '2021-06-01'
  },
  {
    id: '3',
    name: 'Sophia Rodriguez',
    email: 'sophia.rodriguez@example.com',
    department: 'HR',
    position: 'HR Specialist',
    status: 'active',
    startDate: '2022-09-10'
  },
  {
    id: '4',
    name: 'David Johnson',
    email: 'david.johnson@example.com',
    department: 'Finance',
    position: 'Financial Analyst',
    status: 'active',
    startDate: '2023-01-20'
  },
  {
    id: '5',
    name: 'Emily Zhang',
    email: 'emily.zhang@example.com',
    department: 'Engineering',
    position: 'Frontend Developer',
    status: 'onboarding',
    startDate: '2025-01-05'
  },
  {
    id: '6',
    name: 'Robert Wilson',
    email: 'robert.wilson@example.com',
    department: 'Sales',
    position: 'Sales Associate',
    status: 'inactive',
    startDate: '2022-04-12'
  },
  {
    id: '7',
    name: 'Amanda Lee',
    email: 'amanda.lee@example.com',
    department: 'Customer Support',
    position: 'Support Specialist',
    status: 'active',
    startDate: '2023-11-08'
  },
  {
    id: '8',
    name: 'Olivia Davis',
    email: 'olivia.davis@example.com',
    department: 'Product',
    position: 'Product Manager',
    status: 'active',
    startDate: '2022-08-15'
  }
];

const EmployeeTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-error/10 text-error rounded-full">
            Inactive
          </span>
        );
      case 'onboarding':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-warning/10 text-warning rounded-full">
            Onboarding
          </span>
        );
      default:
        return null;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="card animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">Employees</h2>
        
        <div className="flex w-full sm:w-auto space-x-2">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search employees..."
              className="form-input pl-9 py-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Link to="/app/employees/add" className="btn btn-primary text-sm whitespace-nowrap">
            <UserPlus size={16} className="mr-1" />
            Add Employee
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto -mx-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="table-header">Name</th>
              <th className="table-header">Department</th>
              <th className="table-header">Position</th>
              <th className="table-header">Start Date</th>
              <th className="table-header">Status</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="table-cell">
                  <div>
                    <div className="font-medium text-gray-900">{employee.name}</div>
                    <div className="text-gray-500">{employee.email}</div>
                  </div>
                </td>
                <td className="table-cell">{employee.department}</td>
                <td className="table-cell">{employee.position}</td>
                <td className="table-cell">{formatDate(employee.startDate)}</td>
                <td className="table-cell">{getStatusBadge(employee.status)}</td>
                <td className="table-cell">
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                      onClick={() => navigate(`/app/employees/${employee.id}`)}
                    >
                      <Edit size={16} />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                      <Download size={16} />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">1</span> to <span className="font-medium">8</span> of <span className="font-medium">8</span> results
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="btn btn-outline p-2">
            <ChevronLeft size={16} />
          </button>
          <button className="btn btn-outline p-2">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTable;