import React, { useEffect, useState } from 'react';
import { Clock, Download, Search, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { WalletService } from '../../services/walletService';

interface TransactionHistoryProps {
  walletId: string;
  walletType: 'employer' | 'employee';
  className?: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  walletId, 
  walletType,
  className = '' 
}) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const loadTransactions = async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const newPage = reset ? 0 : page;
      const offset = newPage * limit;
      
      const data = await WalletService.getTransactionHistory(
        walletId,
        walletType,
        limit,
        offset
      );
      
      if (reset) {
        setTransactions(data);
      } else {
        setTransactions(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === limit);
      if (!reset) {
        setPage(newPage + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletId) {
      loadTransactions(true);
    }
  }, [walletId, walletType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const getTransactionIcon = (type: string, isIncoming: boolean) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft size={16} className="text-success" />;
      case 'withdrawal':
        return <ArrowUpRight size={16} className="text-error" />;
      case 'transfer':
        return isIncoming 
          ? <ArrowDownLeft size={16} className="text-success" />
          : <ArrowUpRight size={16} className="text-error" />;
      case 'payroll':
        return isIncoming 
          ? <ArrowDownLeft size={16} className="text-success" />
          : <ArrowUpRight size={16} className="text-primary" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
        
        <div className="flex space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="form-input pl-8 py-1 text-sm"
            />
          </div>
          
          <button className="p-1.5 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter size={14} />
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="overflow-x-auto -mx-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="table-header">Date</th>
              <th className="table-header">Description</th>
              <th className="table-header">Type</th>
              <th className="table-header">Reference</th>
              <th className="table-header text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-cell text-center text-gray-500 py-8">
                  {loading ? 'Loading transactions...' : 'No transactions found'}
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => {
                const isIncoming = walletType === 'employee' || transaction.transaction_type === 'deposit';
                
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="table-cell">
                      {transaction.description || 
                        (transaction.transaction_type === 'payroll' 
                          ? 'Payroll Payment' 
                          : transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)
                        )
                      }
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        {getTransactionIcon(transaction.transaction_type, isIncoming)}
                        <span className="ml-2 capitalize">{transaction.transaction_type}</span>
                      </div>
                    </td>
                    <td className="table-cell font-mono text-xs">
                      {transaction.reference_id || transaction.id.substring(0, 8)}
                    </td>
                    <td className={`table-cell text-right font-medium ${
                      isIncoming ? 'text-success' : 'text-error'
                    }`}>
                      {isIncoming ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={() => loadTransactions(false)}
            className="btn btn-outline"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;