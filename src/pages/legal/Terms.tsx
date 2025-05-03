import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-8">
          <FileText className="h-12 w-12 text-primary" />
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Terms of Service</h1>
          
          <div className="prose max-w-none">
            <h2>1. Service Description</h2>
            <p>PaySurity provides payroll processing, tax filing, and related services to businesses. By using our services, you agree to these terms.</p>

            <h2>2. User Accounts</h2>
            <p>You must:</p>
            <ul>
              <li>Provide accurate account information</li>
              <li>Maintain the security of your account</li>
              <li>Notify us of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>

            <h2>3. Fees and Payment</h2>
            <p>Our fee structure includes:</p>
            <ul>
              <li>Monthly subscription fees</li>
              <li>Per-employee charges</li>
              <li>Additional service fees</li>
            </ul>

            <h2>4. Service Level Agreement</h2>
            <p>We commit to:</p>
            <ul>
              <li>99.9% platform uptime</li>
              <li>24-hour support response time</li>
              <li>Same-day processing for payroll submitted before cutoff</li>
            </ul>

            <h2>5. Termination</h2>
            <p>Either party may terminate this agreement:</p>
            <ul>
              <li>With 30 days written notice</li>
              <li>Immediately for material breach</li>
              <li>Upon business dissolution</li>
            </ul>

            <h2>6. Limitation of Liability</h2>
            <p>Our liability is limited to the fees paid for services in the previous 12 months. We are not liable for:</p>
            <ul>
              <li>Indirect or consequential damages</li>
              <li>Lost profits or revenue</li>
              <li>Data loss or corruption</li>
            </ul>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Last updated: April 19, 2025
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-primary hover:text-primary-dark">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;