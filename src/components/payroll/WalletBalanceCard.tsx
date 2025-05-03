import React, { useEffect, useState } from 'react';
import { Wallet, RefreshCw, DollarSign, AlertCircle } from 'lucide-react';
import { WalletService } from '../../services/walletService';

interface WalletBalanceCardProps {
  companyId: string;
  className?: string;
}

const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({ companyId, className = '' }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      const balance = await WalletService.getEmployerBalance(companyId);
      setBalance(balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet balance');
      console.error('Error loading wallet balance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadBalance();
    }
  }, [companyId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className={`card hover:shadow transition-all ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Employer Wallet Balance</h3>
          {loading ? (
            <div className="mt-1 h-8 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="ml-2 text-gray-500">Loading...</span>
            </div>
          ) : error ? (
            <div className="mt-1 flex items-center text-error">
              <AlertCircle size={16} className="mr-1" />
              <span className="text-sm">Error loading balance</span>
            </div>
          ) : (
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {balance !== null ? formatCurrency(balance) : 'N/A'}
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-end">
          <div className="h-12 w-12 bg-primary-light/10 rounded-full flex items-center justify-center text-primary">
            <Wallet size={24} />
          </div>
          <button 
            onClick={loadBalance} 
            className="mt-2 text-xs text-gray-500 hover:text-primary flex items-center"
            disabled={loading}
          >
            <RefreshCw size={12} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="btn btn-outline w-full flex items-center justify-center">
          <DollarSign size={16} className="mr-2" />
          Add Funds
        </button>
      </div>
    </div>
  );
};

export default WalletBalanceCard;