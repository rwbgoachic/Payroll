import React from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface CircuitBreakerStatusProps {
  state: 'closed' | 'open' | 'half-open';
  serviceName: string;
  onReset?: () => void;
  className?: string;
}

const CircuitBreakerStatus: React.FC<CircuitBreakerStatusProps> = ({
  state,
  serviceName,
  onReset,
  className = ''
}) => {
  const getStatusIcon = () => {
    switch (state) {
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'open':
        return <AlertCircle className="h-4 w-4 text-error" />;
      case 'half-open':
        return <RefreshCw className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusText = () => {
    switch (state) {
      case 'closed':
        return 'Operational';
      case 'open':
        return 'Unavailable';
      case 'half-open':
        return 'Recovering';
    }
  };

  const getStatusClass = () => {
    switch (state) {
      case 'closed':
        return 'bg-success/10 text-success';
      case 'open':
        return 'bg-error/10 text-error';
      case 'half-open':
        return 'bg-warning/10 text-warning';
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusClass()}`}>
        {getStatusIcon()}
        <span className="ml-1">{serviceName} {getStatusText()}</span>
      </div>
      
      {onReset && state !== 'closed' && (
        <button
          onClick={onReset}
          className="ml-2 p-1 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100"
          title="Reset circuit breaker"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default CircuitBreakerStatus;