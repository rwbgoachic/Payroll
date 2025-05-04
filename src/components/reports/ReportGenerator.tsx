import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, Loader } from 'lucide-react';
import { PayrollService } from '../../services/payrollService';
import { FileService } from '../../services/fileService';
import { FileType } from '../../lib/file-service';
import FileDownloadButton from '../payroll/FileDownloadButton';

interface ReportGeneratorProps {
  companyId: string;
  className?: string;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  companyId,
  className = ''
}) => {
  const [reportType, setReportType] = useState<string>('payroll-summary');
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [quarter, setQuarter] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      setReportData(null);

      let data;
      
      switch (reportType) {
        case 'payroll-summary':
          data = await PayrollService.generatePayrollSummaryReport(
            companyId,
            startDate,
            endDate
          );
          break;
        
        case 'tax-liability':
          data = await PayrollService.generateTaxLiabilityReport(
            companyId,
            year,
            quarter ? Number(quarter) : undefined
          );
          break;
        
        case 'deduction-summary':
          data = await PayrollService.generateDeductionSummaryReport(
            companyId,
            startDate,
            endDate
          );
          break;
        
        default:
          throw new Error(`Unsupported report type: ${reportType}`);
      }
      
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  const getReportFileName = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    
    switch (reportType) {
      case 'payroll-summary':
        return `payroll-summary-${startDate}-to-${endDate}.csv`;
      
      case 'tax-liability':
        return quarter 
          ? `tax-liability-${year}-q${quarter}.csv` 
          : `tax-liability-${year}.csv`;
      
      case 'deduction-summary':
        return `deduction-summary-${startDate}-to-${endDate}.csv`;
      
      default:
        return `report-${dateStr}.csv`;
    }
  };

  return (
    <div className={`card ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Reports</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="reportType" className="form-label">Report Type</label>
          <select
            id="reportType"
            className="form-input"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="payroll-summary">Payroll Summary</option>
            <option value="tax-liability">Tax Liability</option>
            <option value="deduction-summary">Deduction Summary</option>
          </select>
        </div>
        
        {reportType === 'tax-liability' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="year" className="form-label">Year</label>
              <input
                type="number"
                id="year"
                className="form-input"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2000}
                max={2100}
              />
            </div>
            
            <div>
              <label htmlFor="quarter" className="form-label">Quarter (Optional)</label>
              <select
                id="quarter"
                className="form-input"
                value={quarter}
                onChange={(e) => setQuarter(e.target.value as any)}
              >
                <option value="">Full Year</option>
                <option value="1">Q1 (Jan-Mar)</option>
                <option value="2">Q2 (Apr-Jun)</option>
                <option value="3">Q3 (Jul-Sep)</option>
                <option value="4">Q4 (Oct-Dec)</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="form-label">Start Date</label>
              <input
                type="date"
                id="startDate"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="form-label">End Date</label>
              <input
                type="date"
                id="endDate"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="button"
            className="btn btn-primary"
            onClick={generateReport}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText size={16} className="mr-2" />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 bg-error/10 border border-error/20 text-error px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {reportData && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Report Generated</h4>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {reportType === 'payroll-summary' && 'Payroll Summary Report'}
                  {reportType === 'tax-liability' && 'Tax Liability Report'}
                  {reportType === 'deduction-summary' && 'Deduction Summary Report'}
                </p>
                <p className="text-xs text-gray-500">
                  {reportType !== 'tax-liability' 
                    ? `${startDate} to ${endDate}` 
                    : quarter 
                      ? `Q${quarter} ${year}` 
                      : `Year ${year}`
                  }
                </p>
              </div>
              
              <div className="flex space-x-2">
                <FileDownloadButton
                  data={reportData}
                  fileName={getReportFileName()}
                  fileType={FileType.CSV}
                  buttonText="CSV"
                />
                
                <FileDownloadButton
                  data={reportData}
                  fileName={getReportFileName().replace('.csv', '.xlsx')}
                  fileType={FileType.EXCEL}
                  buttonText="Excel"
                />
                
                <FileDownloadButton
                  data={reportData}
                  fileName={getReportFileName().replace('.csv', '.json')}
                  fileType={FileType.JSON}
                  buttonText="JSON"
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {reportType === 'payroll-summary' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-500">Total Gross Pay</p>
                      <p className="text-lg font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(reportData.totalGrossPay)}
                      </p>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-500">Total Net Pay</p>
                      <p className="text-lg font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(reportData.totalNetPay)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Department Summary</p>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(reportData.departmentSummary).map(([dept, data]: [string, any]) => (
                          <tr key={dept}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{dept}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{data.employeeCount}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                              }).format(data.totalGrossPay)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                              }).format(data.totalNetPay)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {reportType === 'tax-liability' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-500">Federal Income Tax</p>
                      <p className="text-lg font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(reportData.federalIncomeTax)}
                      </p>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-500">Total Tax Liability</p>
                      <p className="text-lg font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(reportData.totalTaxLiability)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Monthly Breakdown</p>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Federal</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">FICA</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(reportData.monthlyBreakdown).map(([month, data]: [string, any]) => {
                          const stateTaxTotal = Object.values(data.stateTaxes).reduce((sum: number, tax: any) => sum + tax, 0);
                          
                          return (
                            <tr key={month}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {new Date(month.split('-')[0], parseInt(month.split('-')[1]) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD'
                                }).format(data.federalIncomeTax)}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD'
                                }).format(data.socialSecurityTax + data.medicareTax)}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD'
                                }).format(stateTaxTotal)}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD'
                                }).format(data.totalTaxLiability)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {reportType === 'deduction-summary' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-500">Total Deductions</p>
                      <p className="text-lg font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(reportData.totalDeductions)}
                      </p>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-500">Pre-Tax Deductions</p>
                      <p className="text-lg font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(reportData.preTaxDeductions)}
                      </p>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-500">Post-Tax Deductions</p>
                      <p className="text-lg font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(reportData.postTaxDeductions)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Deductions by Type</p>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(reportData.deductionsByType).map(([type, data]: [string, any]) => (
                          <tr key={type}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{type}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{data.count}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                              }).format(data.total)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                              {data.isTaxable ? 'Yes' : 'No'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;