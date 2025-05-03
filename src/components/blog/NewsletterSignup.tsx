import React, { useState } from 'react';
import { Mail } from 'lucide-react';

const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setStatus('loading');
      
      // TODO: Implement newsletter signup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('success');
      setMessage('Thanks for subscribing! Please check your email to confirm.');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="bg-primary-light/10 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Mail className="h-6 w-6 text-primary mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Subscribe to our newsletter</h3>
      </div>
      
      <p className="text-gray-600 mb-4">
        Get the latest payroll insights and updates delivered to your inbox.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="form-input flex-grow"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
        
        {message && (
          <p className={`mt-2 text-sm ${
            status === 'success' ? 'text-success' : 'text-error'
          }`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default NewsletterSignup;