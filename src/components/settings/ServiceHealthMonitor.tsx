import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { useCircuitBreaker } from '../../hooks/useCircuitBreaker';
import CircuitBreakerStatus from '../common/CircuitBreakerStatus';
import { TaxService } from '../../services/taxService';

interface ServiceStatus {
  name: string;
  state: 'closed' | 'open' | 'half-open';
  lastChecked: Date | null;
}

const ServiceHealthMonitor: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get circuit breaker instances from services
  useEffect(() => {
    const fetchServiceStatus = async () => {
      try {
        setLoading(true);
        setError('');

        // In a real implementation, we would get this from a central registry
        // For now, we'll just create a static list
        const serviceStatuses: ServiceStatus[] = [
          {
            name: 'Tax Calculation',
            state: TaxService.getTaxCircuitBreakerState(),
            lastChecked: new Date()
          },
          {
            name: 'Payment Processing',
            state: 'closed', // This would come from the payment service
            lastChecked: new Date()
          },
          {
            name: 'Employee Benefits',
            state: 'closed', // This would come from the benefits service
            lastChecked: new Date()
          }
        ];

        setServices(serviceStatuses);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch service status');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceStatus();
    
    // Set up interval to refresh status
    const interval = setInterval(fetchServiceStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    // Manually trigger a refresh
    setLoading(true);
    
    // In a real implementation, we would call an API to get the latest status
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleReset = (serviceName: string) => {
    // In a real implementation, we would call an API to reset the circuit breaker
    console.log(`Resetting circuit breaker for ${serviceName}`);
    
    // For now, just update the UI
    setServices(prev => 
      prev.map(service => 
        service.name === serviceName 
          ? { ...service, state: 'closed', lastChecked: new Date() } 
          : service
      )
    );
  };

  if (loading && services.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading service status...</span>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Activity className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Service Health</h2>
        </div>
        
        <button
          onClick={handleRefresh}
          className="p-1 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        {services.map(service => (
          <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium">{service.name}</h3>
              <p className="text-xs text-gray-500">
                Last checked: {service.lastChecked?.toLocaleTimeString() || 'Never'}
              </p>
            </div>
            
            <CircuitBreakerStatus
              state={service.state}
              serviceName=""
              onReset={() => handleReset(service.name)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceHealthMonitor;