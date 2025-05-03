import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, FileText, Download } from 'lucide-react';
import { PayrollService } from '../../services/payrollService';
import { format } from 'date-fns';
import DisbursementStatus from './DisbursementStatus';

interface PayrollCalculatorProps {
  periodId: string;
  employeeIds: string[];
  onCalculationComplete: (calculations: any[]) => void;
}

const PayrollCalculator: React.FC<PayrollCalculatorProps> = ({
  periodId,
  employeeIds,
  onCalculationComplete
}) => {
  const [calculations, setCalculations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [disbursementId, setDisbursementId] = useState<string | null>(null);

  useEffect(() => {
    if (periodId && employeeIds.length > 0) {
      calculatePayroll();
    }
  }, [periodId, employeeIds]);

  const calculatePayroll = async () => {
    if (!periodId || employeeIds.length === 0) {
      setError('Please select a payroll period and at least one employee');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const results = await PayrollService.calculatePayroll(periodId, employeeIds);
      setCalculations(results);
      onCalculationComplete(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate payroll');
      console.error(err);
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

  const handleEmployeeClick = (employeeId: string) => {
    setSelectedEmployee(selectedEmployee === employeeId ? null : employeeId);
  };

  const renderEmployeeDetails = () => {
    if (!selectedEmployee) return null;

    const employee = calculations.find(calc => calc.employeeId === selectedEmployee);
    if (!employee) return null;

    return (
      <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200" data-testid="employee-details">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Details: {employee.name}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Earnings</h4>
            <div className="space-y-2" data-testid="earnings">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Regular Pay</span>
                <span className="font-medium" data-testid="regular-pay">{formatCurrency(employee.regularPay)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Overtime Pay</span>
                <span className="font-medium" data-testid="overtime-pay">{formatCurrency(employee.overtimePay)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-sm font-medium">Gross Pay</span>
                <span className="font-medium">{formatCurrency(employee.grossPay)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Taxes</h4>
            <div className="space-y-2" data-testid="taxes">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Federal Tax</span>
                <span className="font-medium" data-testid="federal-tax">{formatCurrency(employee.federalTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">State Tax</span>
                <span className="font-medium" data-testid="state-tax">{formatCurrency(employee.stateTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Social Security</span>
                <span className="font-medium" data-testid="social-security">{formatCurrency(employee.socialSecurity)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Medicare</span>
                <span className="font-medium" data-testid="medicare">{formatCurrency(employee.medicare)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-sm font-medium">Total Taxes</span>
                <span className="font-medium">{formatCurrency(
                  employee.federalTax + employee.stateTax + employee.socialSecurity + employee.medicare
                )}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Deductions</h4>
          <div className="space-y-2" data-testid="deductions">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pre-Tax Deductions</span>
              <span className="font-medium">{formatCurrency(employee.preTaxDeductions)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Post-Tax Deductions</span>
              <span className="font-medium">{formatCurrency(employee.postTaxDeductions)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-sm font-medium">Total Deductions</span>
              <span className="font-medium">{formatCurrency(
                employee.preTaxDeductions + employee.postTaxDeductions
              )}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t-2 border-gray-200">
          <div className="flex justify-between">
            <span className="text-base font-semibold">Net Pay</span>
            <span className="text-base font-semibold" data-testid="net-pay">{formatCurrency(employee.netPay)}</span>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="btn btn-outline">
            <Download size={16} className="mr-2" />
            Download Pay Stub
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payroll Summary</h3>
            
            <div className="overflow-x-auto -mx-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="table-header">Category</th>
                    <th className="table-header text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="table-cell font-medium">Gross Pay</td>
                    <td className="table-cell text-right" data-testid="total-gross-pay">
                      {formatCurrency(calculations.reduce((sum, calc) => sum + calc.grossPay, 0))}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-cell">Federal Tax</td>
                    <td className="table-cell text-right">
                      {formatCurrency(calculations.reduce((sum, calc) => sum + calc.federalTax, 0))}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-cell">State Tax</td>
                    <td className="table-cell text-right">
                      {formatCurrency(calculations.reduce((sum, calc) => sum + calc.stateTax, 0))}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-cell">Social Security</td>
                    <td className="table-cell text-right">
                      {formatCurrency(calculations.reduce((sum, calc) => sum + calc.socialSecurity, 0))}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-cell">Medicare</td>
                    <td className="table-cell text-right">
                      {formatCurrency(calculations.reduce((sum, calc) => sum + calc.medicare, 0))}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-cell">Pre-Tax Deductions</td>
                    <td className="table-cell text-right">
                      {formatCurrency(calculations.reduce((sum, calc) => sum + calc.preTaxDeductions, 0))}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-cell">Post-Tax Deductions</td>
                    <td className="table-cell text-right">
                      {formatCurrency(calculations.reduce((sum, calc) => sum + calc.postTaxDeductions, 0))}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="table-cell font-medium">Net Pay</td>
                    <td className="table-cell text-right font-medium" data-testid="total-net-pay">
                      {formatCurrency(calculations.reduce((sum, calc) => sum + calc.netPay, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Details</h3>
            
            <div className="overflow-x-auto -mx-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="table-header">Employee</th>
                    <th className="table-header">Department</th>
                    <th className="table-header text-right">Gross Pay</th>
                    <th className="table-header text-right">Taxes</th>
                    <th className="table-header text-right">Deductions</th>
                    <th className="table-header text-right">Net Pay</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {calculations.map((calc) => (
                    <tr 
                      key={calc.employeeId} 
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedEmployee === calc.employeeId ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => handleEmployeeClick(calc.employeeId)}
                    >
                      <td className="table-cell font-medium">{calc.name}</td>
                      <td className="table-cell">{calc.department}</td>
                      <td className="table-cell text-right">
                        {formatCurrency(calc.grossPay)}
                      </td>
                      <td className="table-cell text-right">
                        {formatCurrency(
                          calc.federalTax + calc.stateTax + calc.socialSecurity + calc.medicare
                        )}
                      </td>
                      <td className="table-cell text-right">
                        {formatCurrency(calc.preTaxDeductions + calc.postTaxDeductions)}
                      </td>
                      <td className="table-cell text-right font-medium">
                        {formatCurrency(calc.netPay)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {renderEmployeeDetails()}

          {disbursementId && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Disbursement Status</h3>
              <DisbursementStatus transactionId={disbursementId} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PayrollCalculator;