import React from 'react';
import { Save } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage your account and application preferences.
          </p>
        </div>
        <button className="btn btn-primary flex items-center">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Company Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    className="form-input w-full"
                    placeholder="Enter company name"
                    defaultValue="Acme Corporation"
                  />
                </div>
                <div>
                  <label htmlFor="ein" className="block text-sm font-medium text-gray-700 mb-1">
                    Employer Identification Number (EIN)
                  </label>
                  <input
                    type="text"
                    id="ein"
                    className="form-input w-full"
                    placeholder="XX-XXXXXXX"
                    defaultValue="12-3456789"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address
                </label>
                <input
                  type="text"
                  id="address"
                  className="form-input w-full"
                  placeholder="Enter address"
                  defaultValue="123 Business Ave, Suite 100"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    className="form-input w-full"
                    placeholder="Enter city"
                    defaultValue="San Francisco"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <select id="state" className="form-select w-full">
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                    <option value="WA">Washington</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zip"
                    className="form-input w-full"
                    placeholder="Enter ZIP code"
                    defaultValue="94103"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Tax Filing Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Filing Method
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="e-file"
                      name="filingMethod"
                      type="radio"
                      defaultChecked
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <label htmlFor="e-file" className="ml-3 block text-sm text-gray-700">
                      E-File (Electronic Filing)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="paper"
                      name="filingMethod"
                      type="radio"
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <label htmlFor="paper" className="ml-3 block text-sm text-gray-700">
                      Paper Filing
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reminders
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="reminder-30"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <label htmlFor="reminder-30" className="ml-3 block text-sm text-gray-700">
                      30 days before deadline
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="reminder-14"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <label htmlFor="reminder-14" className="ml-3 block text-sm text-gray-700">
                      14 days before deadline
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="reminder-7"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <label htmlFor="reminder-7" className="ml-3 block text-sm text-gray-700">
                      7 days before deadline
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Notifications
                </label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="tax-deadlines"
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                      <label htmlFor="tax-deadlines" className="ml-3 block text-sm text-gray-700">
                        Tax filing deadlines
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="payment-confirmations"
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                      <label htmlFor="payment-confirmations" className="ml-3 block text-sm text-gray-700">
                        Payment confirmations
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="filing-status"
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                      <label htmlFor="filing-status" className="ml-3 block text-sm text-gray-700">
                        Filing status updates
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Default Payment Method</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment System
                </label>
                <select className="form-select w-full">
                  <option>EFTPS (Electronic Federal Tax Payment System)</option>
                  <option>ACH Credit</option>
                  <option>Credit/Debit Card</option>
                </select>
              </div>
              
              <div>
                <div className="flex items-center">
                  <input
                    id="save-payment-info"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <label htmlFor="save-payment-info" className="ml-3 block text-sm text-gray-700">
                    Save payment information for future use
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;