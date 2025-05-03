import React from 'react';

const Reports = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Available Reports</h2>
          <p className="text-gray-600 mb-4">
            Generate and download reports for your payroll and employee data.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium text-lg">{report.title}</h3>
                <p className="text-gray-500 text-sm mt-1">{report.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentReports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        report.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        report.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.status === 'Completed' && (
                        <button className="text-indigo-600 hover:text-indigo-900">Download</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sample data for the reports page
const reportTypes = [
  { id: 1, title: 'Payroll Summary', description: 'Overview of all payroll transactions for a selected period' },
  { id: 2, title: 'Employee Details', description: 'Comprehensive report of employee information and status' },
  { id: 3, title: 'Tax Withholdings', description: 'Summary of all tax withholdings for reporting periods' },
  { id: 4, title: 'Benefit Deductions', description: 'Report of all benefit-related deductions by employee' },
  { id: 5, title: 'Annual W-2', description: 'Generate W-2 forms for all employees' },
  { id: 6, title: 'Custom Report', description: 'Create a report with your selected parameters' },
];

const recentReports = [
  { id: 1, name: 'Payroll Summary - Q1 2023', date: 'Apr 1, 2023', status: 'Completed' },
  { id: 2, name: 'Employee Benefits Report', date: 'Mar 15, 2023', status: 'Completed' },
  { id: 3, name: 'Tax Withholdings - March', date: 'Apr 2, 2023', status: 'In Progress' },
  { id: 4, name: 'New Hire Report', date: 'Mar 28, 2023', status: 'Completed' },
];

export default Reports;