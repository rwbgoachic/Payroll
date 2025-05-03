import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { getDisbursementStatus } from '../../services/disbursement';

interface DisbursementStatusProps {
  transactionId: string;
  onStatusChange?: (status: 'pending' | 'completed' | 'failed') => void;
}

const DisbursementStatus: React.FC<DisbursementStatusProps> = ({ 
  transactionId,
  onStatusChange
}) => {
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transactionId) {
      checkStatus();
    }
  }, [transactionId]);

  const checkStatus = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await getDisbursementStatus(transactionId);
      
      setStatus(result.status);
      setDetails(result.details);
      
      if (onStatusChange) {
        onStatusChange(result.status);
      }
      
      // If still pending, check again in 5 seconds
      if (result.status === 'pending') {
        setTimeout(checkStatus, 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-success" />;
      case 'pending':
        return <Clock className="h-6 w-6 text-warning" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-error" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Disbursement completed successfully';
      case 'pending':
        return 'Disbursement is being processed';
      case 'failed':
        return 'Disbursement failed';
      default:
        return 'Unknown status';
    }
  };

  if (loading && !details) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Checking disbursement status...</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center mb-2">
        {getStatusIcon()}
        <h3 className="text-lg font-medium ml-2">{getStatusText()}</h3>
      </div>
      
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      
      {details && (
        <div className="mt-4 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-500">Transaction ID:</div>
            <div className="font-medium">{details.transaction_id}</div>
            
            {details.amount && (
              <>
                <div className="text-gray-500">Amount:</div>
                <div className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: details.currency || 'USD'
                  }).format(details.amount)}
                </div>
              </>
            )}
            
            {details.status && (
              <>
                <div className="text-gray-500">Status:</div>
                <div className="font-medium">{details.status}</div>
              </>
            )}
            
            {details.created_at && (
              <>
                <div className="text-gray-500">Date:</div>
                <div className="font-medium">
                  {new Date(details.created_at).toLocaleString()}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {(status === 'pending' || status === 'failed') && (
        <button
          onClick={checkStatus}
          className="mt-4 flex items-center text-primary hover:text-primary-dark text-sm"
        >
          <RefreshCw size={14} className="mr-1" />
          Refresh Status
        </button>
      )}
    </div>
  );
};

export default DisbursementStatus;