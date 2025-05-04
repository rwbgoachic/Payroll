import React, { useEffect, useState } from 'react';
import { Calendar, FileText, Download, Filter, BarChart, PieChart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ReportGenerator from '../components/reports/ReportGenerator';
import FileUploadButton from '../components/payroll/FileUploadButton';
import FileDownloadButton from '../components/payroll/FileDownloadButton';
import { FileType } from '../lib/file-service';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadCompanyId();
    }
  }, [user]);

  const loadCompanyId = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('employees')
        .select('company_id')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setCompanyId(data.company_id);
      
      // Load recent reports
      loadRecentReports(data.company_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load company information');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentReports = async (companyId: string) => {
    try {
      // In a real implementation, we would fetch recent reports from the database
      // For now, we'll use sample data
      setRecentReports([
        {
          id: '1',
          name: 'Payroll Summary - Q1 2025',
          type: 'payroll-summary',
          date: 'Apr 1, 2025',
          status: 'Completed'
        },
        {
          id: '2',
          name: 'Employee Benefits Report',
          type: 'benefits',
          date: 'Mar 15, 2025',
          status: 'Completed'
        },
        {
          id: '3',
          name: 'Tax Withholdings - March',
          type: 'tax',
          date: 'Apr 2, 2025',
          status: 'In Progress'
        },
        {
          id: '4',
          name: 'New Hire Report',
          type: 'employees',
          date: 'Mar 28, 2025',
          status: 'Completed'
        }
      ]);
    } catch (err) {
      console.error('Error loading recent reports:', err);
    }
  };

  const handleFileUpload = (data: any) => {
    console.log('File uploaded:', data);
    // In a real implementation, we would process the uploaded file
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">
            Generate and download reports for your payroll and employee data.
          </p>
        </div>
      </div>
      
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {companyId && <ReportGenerator companyId={companyId} />}
        </div>
        
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Import Data</h3>
            <FileUploadButton
              onFileProcessed={handleFileUpload}
              allowedTypes={[FileType.CSV, FileType.EXCEL]}
              buttonText="Import Data"
            />
          </div>
          
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reports</h3>
            
            <div className="space-y-3">
              {recentReports.map(report => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {report.type === 'payroll-summary' && <FileText size={16} />}
                      {report.type === 'tax' && <BarChart size={16} />}
                      {report.type === 'benefits' && <PieChart size={16} />}
                      {report.type === 'employees' && <Calendar size={16} />}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{report.name}</p>
                      <p className="text-xs text-gray-500">{report.date}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      report.status === 'Completed' ? 'bg-success/10 text-success' : 
                      report.status === 'In Progress' ? 'bg-warning/10 text-warning' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;