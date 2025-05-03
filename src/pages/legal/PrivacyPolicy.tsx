import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-8">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Privacy Policy</h1>
          
          <div className="prose max-w-none">
            <h2>1. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li>Name and contact information</li>
              <li>Company details and EIN</li>
              <li>Employee data for payroll processing</li>
              <li>Banking and financial information</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Process payroll and tax filings</li>
              <li>Provide customer support</li>
              <li>Send important updates and notifications</li>
              <li>Improve our services</li>
            </ul>

            <h2>3. Data Security</h2>
            <p>We implement appropriate technical and organizational security measures to protect your data, including:</p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
              <li>Employee training on data protection</li>
            </ul>

            <h2>4. GDPR & CCPA Compliance</h2>
            <p>We comply with both the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Request deletion of your data</li>
              <li>Object to data processing</li>
              <li>Data portability</li>
            </ul>

            <h2>5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p>Email: privacy@paysurity.com<br />
            Address: 123 Business Ave, Suite 100<br />
            San Francisco, CA 94103</p>
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

export default PrivacyPolicy;