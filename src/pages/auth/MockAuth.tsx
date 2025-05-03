import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ClipboardCheck, Key, LogIn } from 'lucide-react';

const MockAuth: React.FC = () => {
  const { bypassAuth } = useAuth();
  const navigate = useNavigate();

  const handleBypassAuth = () => {
    bypassAuth();
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ClipboardCheck className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Test Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Use this page to bypass authentication for testing purposes
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="bg-warning/10 border border-warning/20 text-warning px-4 py-3 rounded mb-6">
            <div className="flex items-start">
              <Key className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Testing Mode</p>
                <p className="text-sm">
                  This bypasses real authentication and creates a mock user session for testing purposes.
                  Do not use in production.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Mock User Details</h3>
              <div className="mt-1 bg-gray-50 rounded-md p-3 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">Email:</div>
                  <div className="col-span-2">admin@paysurity.com</div>
                  
                  <div className="font-medium">Role:</div>
                  <div className="col-span-2">Admin</div>
                  
                  <div className="font-medium">User ID:</div>
                  <div className="col-span-2 text-gray-500 text-xs">(Valid UUID generated at runtime)</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleBypassAuth}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Login as Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockAuth;