import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  DollarSign, 
  Download, 
  Eye, 
  FileText, 
  Filter, 
  Upload,
  CheckCircle,
  AlertCircle,
  Calculator
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PayrollForm from '../components/payroll/PayrollForm';
import PayrollCalculator from '../components/payroll/PayrollCalculator';
import { PayrollService } from '../services/payrollService';
import DisbursementStatus from '../components/payroll/DisbursementStatus';

const PayrollProcess: React.FC = () => {
  const [step, setStep] = useState(1);
  const [companyId, setCompanyId] = useState<string>('');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [calculations, setCalculations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [disbursementId, setDisbursementId] = useState<string | null>(null);
  const [disbursementMethod, setDisbursementMethod] = useState<'wallet' | 'ach' | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadCompanyId();
    }
  }, [user]);

  const loadCompanyId = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('company_id')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setCompanyId(data.company_id);
    } catch (err) {
      setError('Failed to load company information');
    }
  };

  const handleFormSubmit = (periodId: string, employeeIds: string[]) => {
    setSelectedPeriodId(periodId);
    setSelectedEmployees(employeeIds);
    setStep(2);
  };

  const handleCalculationComplete = (results: any[]) => {
    setCalculations(results);
  };

  const processPayroll = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await PayrollService.savePayrollResults(
        selectedPeriodId,
        companyId,
        calculations
      );
      
      // In a real implementation, we would get the disbursement ID from the result
      // For now, we'll simulate it
      setDisbursementId(`DISBURSEMENT-${Date.now()}`);
      
      // Randomly choose a disbursement method for demonstration
      setDisbursementMethod(Math.random() > 0.5 ? 'wallet' : 'ach');
      
      setSuccess('Payroll processed successfully!');
      setStep(3);
    } catch (err) {
      setError('Failed to process payroll');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <PayrollForm companyId={companyId} onSubmit={handleFormSubmit} />;
      case 2:
        return (
          <div className="space-y-6">
            <PayrollCalculator 
              periodId={selectedPeriodId} 
              employeeIds={selectedEmployees}
              onCalculationComplete={handleCalculationComplete}
            />
            
            {error && (
              <div className="mt-4 bg-error/10 border border-error/20 text-error px-4 py-3 rounded" data-testid="error-message">
                {error}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-6">
              <button 
                className="btn btn-outline"
                onClick={() => setStep(1)}
              >
                Back to Setup
              </button>
              
              <div>
                <button className="btn btn-outline mr-2">
                  <Download size={16} className="mr-2" />
                  Export Report
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={processPayroll}
                  disabled={loading || calculations.length === 0}
                >
                  {loading ? 'Processing...' : 'Submit Payroll'}
                </button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="card animate-fade-in">
            <div className="text-center py-8">
              <div className="h-16 w-16 bg-success/10 rounded-full text-success flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">Payroll Submitted Successfully!</h2>
              <p className="text-gray-500 max-w-lg mx-auto mb-6">
                Your payroll has been successfully submitted for processing. Direct deposits will be initiated according to the schedule.
              </p>
              
              {success && (
                <div className="mb-6 bg-success/10 border border-success/20 text-success px-4 py-3 rounded max-w-lg mx-auto" data-testid="success-message">
                  {success}
                </div>
              )}
              
              {disbursementMethod && (
                <div className="mb-6 bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded max-w-lg mx-auto">
                  Disbursement Method: {disbursementMethod === 'wallet' ? 'Wallet Transfer' : 'ACH Transfer'}
                </div>
              )}
              
              {disbursementId && (
                <div className="mb-6 max-w-lg mx-auto">
                  <DisbursementStatus transactionId={disbursementId} />
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
                <button className="btn btn-outline">
                  <Download size={16} className="mr-2" />
                  Download Report
                </button>
                <button className="btn btn-outline">
                  <FileText size={16} className="mr-2" />
                  View Pay Stubs
                </button>
                <button className="btn btn-primary">
                  <Eye size={16} className="mr-2" />
                  View Details
                </button>
              </div>
            </div>
            
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Payment Schedule</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="text-sm text-gray-500">Initiated</div>
                  <div className="font-medium">{new Date().toLocaleDateString()}</div>
                  <div className="text-xs text-gray-500 mt-1">Processing started</div>
                </div>
                
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="text-sm text-gray-500">Funds Transfer</div>
                  <div className="font-medium">
                    {new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Payment processing</div>
                </div>
                
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
                  <div className="text-sm text-primary">Employee Availability</div>
                  <div className="font-medium">
                    {new Date(new Date().setDate(new Date().getDate() + 2)).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Funds available to employees</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <button 
                className="btn btn-outline"
                onClick={() => setStep(2)}
              >
                Back to Review
              </button>
              
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/app/payroll/history')}
              >
                View Payroll History
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Process Payroll</h1>
          <p className="text-gray-500 mt-1">
            Set up and process payroll for your employees.
          </p>
        </div>
      </div>
      
      {/* Progress steps */}
      <div className="flex items-center">
        <div className="flex-1">
          <div className="flex items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className={`ml-2 ${step >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
              <div className="text-sm font-medium">Setup</div>
              <div className="text-xs">Configure period & employees</div>
            </div>
          </div>
        </div>
        
        <div className={`w-12 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
        
        <div className="flex-1">
          <div className="flex items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <div className={`ml-2 ${step >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
              <div className="text-sm font-medium">Review</div>
              <div className="text-xs">Verify calculations</div>
            </div>
          </div>
        </div>
        
        <div className={`w-12 h-1 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`} />
        
        <div className="flex-1">
          <div className="flex items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              3
            </div>
            <div className={`ml-2 ${step >= 3 ? 'text-gray-900' : 'text-gray-500'}`}>
              <div className="text-sm font-medium">Submit</div>
              <div className="text-xs">Process payroll</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Render content based on current step */}
      <div className="mt-8">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default PayrollProcess;