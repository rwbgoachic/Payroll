import React from 'react';
import { Activity, Shield } from 'lucide-react';
import ServiceHealthMonitor from '../../components/settings/ServiceHealthMonitor';
import { TaxService } from '../../services/taxService';
import { PaymentService } from '../../services/paymentService';

const ServiceHealth: React.FC = () => {
  const handleResetTaxCircuitBreaker = () => {
    TaxService.resetTaxCircuitBreaker();
  };

  const handleResetPaymentCircuitBreaker = () => {
    PaymentService.resetPaymentCircuitBreaker();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Health</h1>
          <p className="text-gray-500 mt-1">
            Monitor the health of critical services and manage circuit breakers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ServiceHealthMonitor />
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center mb-4">
              <Shield className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Circuit Breaker Controls</h2>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Tax Service</h3>
                    <p className="text-xs text-gray-500">
                      Controls access to tax calculation services
                    </p>
                  </div>
                  <button
                    onClick={handleResetTaxCircuitBreaker}
                    className="btn btn-sm btn-outline"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Payment Service</h3>
                    <p className="text-xs text-gray-500">
                      Controls access to payment processing services
                    </p>
                  </div>
                  <button
                    onClick={handleResetPaymentCircuitBreaker}
                    className="btn btn-sm btn-outline"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">About Circuit Breakers</h2>
            <p className="text-sm text-gray-600 mb-4">
              Circuit breakers protect the system from cascading failures by temporarily disabling
              services that are experiencing problems.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-xs font-medium mr-2 mt-0.5">Closed</span>
                <span>Service is operating normally</span>
              </li>
              <li className="flex items-start">
                <span className="bg-warning/10 text-warning rounded-full px-2 py-0.5 text-xs font-medium mr-2 mt-0.5">Half-Open</span>
                <span>Service is recovering and testing connections</span>
              </li>
              <li className="flex items-start">
                <span className="bg-error/10 text-error rounded-full px-2 py-0.5 text-xs font-medium mr-2 mt-0.5">Open</span>
                <span>Service is unavailable due to repeated failures</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceHealth;