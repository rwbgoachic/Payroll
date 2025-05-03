import React, { useEffect, useState } from 'react';
import { Wallet as WalletIcon, DollarSign, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { WalletService } from '../services/walletService';
import WalletBalanceCard from '../components/payroll/WalletBalanceCard';
import TransactionHistory from '../components/payroll/TransactionHistory';

const Wallet: React.FC = () => {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [employerWallet, setEmployerWallet] = useState<any | null>(null);
  const [employeeWallet, setEmployeeWallet] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get employee data for the current user
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('id, company_id, role')
        .eq('user_id', user?.id)
        .single();

      if (employeeError) throw employeeError;

      setCompanyId(employee.company_id);
      setEmployeeId(employee.id);
      setIsAdmin(employee.role === 'admin');

      // Load wallets
      if (employee.role === 'admin') {
        const employerWallet = await WalletService.getEmployerWallet(employee.company_id);
        setEmployerWallet(employerWallet);
      }

      const employeeWallet = await WalletService.getEmployeeWallet(employee.id);
      setEmployeeWallet(employeeWallet);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading wallet information...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-500 mt-1">
            Manage your wallet and view transaction history
          </p>
        </div>
        <button 
          onClick={loadUserData}
          className="btn btn-outline flex items-center"
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isAdmin && companyId && (
          <WalletBalanceCard companyId={companyId} />
        )}
        
        <div className="card hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Your Wallet Balance</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {employeeWallet ? formatCurrency(employeeWallet.balance) : '$0.00'}
              </p>
            </div>
            
            <div className="h-12 w-12 bg-success/10 rounded-full flex items-center justify-center text-success">
              <WalletIcon size={24} />
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
            <button className="btn btn-outline flex items-center justify-center">
              <ArrowUpRight size={16} className="mr-2" />
              Withdraw
            </button>
            <button className="btn btn-outline flex items-center justify-center">
              <ArrowDownLeft size={16} className="mr-2" />
              Deposit
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isAdmin && employerWallet && (
          <TransactionHistory 
            walletId={employerWallet.id} 
            walletType="employer" 
          />
        )}
        
        {employeeWallet && (
          <TransactionHistory 
            walletId={employeeWallet.id} 
            walletType="employee" 
          />
        )}
      </div>
    </div>
  );
};

export default Wallet