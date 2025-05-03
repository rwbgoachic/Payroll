import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ClipboardCheck, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface FormData {
  step: number;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  companyName: string;
  ein: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  acceptTerms: boolean;
  acceptDataCollection: boolean;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    step: 1,
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
    ein: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    acceptTerms: false,
    acceptDataCollection: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [einVerified, setEinVerified] = useState(false);
  const [einVerifying, setEinVerifying] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Reset EIN verification when EIN changes
    if (name === 'ein') {
      setEinVerified(false);
    }
  };

  const validateStep = () => {
    switch (formData.step) {
      case 1:
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          setError('All fields are required');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters long');
          return false;
        }
        if (!/[A-Z]/.test(formData.password)) {
          setError('Password must contain at least one uppercase letter');
          return false;
        }
        if (!/[0-9]/.test(formData.password)) {
          setError('Password must contain at least one number');
          return false;
        }
        if (!/[^A-Za-z0-9]/.test(formData.password)) {
          setError('Password must contain at least one special character');
          return false;
        }
        break;
      case 2:
        if (!formData.firstName || !formData.lastName) {
          setError('All fields are required');
          return false;
        }
        break;
      case 3:
        if (!formData.companyName || !formData.ein) {
          setError('Company name and EIN are required');
          return false;
        }
        if (!/^\d{2}-\d{7}$/.test(formData.ein)) {
          setError('EIN must be in format XX-XXXXXXX');
          return false;
        }
        if (!einVerified) {
          setError('Please verify your EIN before continuing');
          return false;
        }
        break;
      case 4:
        if (!formData.acceptTerms) {
          setError('You must accept the Terms of Service');
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setError('');
      setFormData(prev => ({ ...prev, step: prev.step + 1 }));
    }
  };

  const prevStep = () => {
    setError('');
    setFormData(prev => ({ ...prev, step: prev.step - 1 }));
  };

  const verifyEIN = async () => {
    if (!/^\d{2}-\d{7}$/.test(formData.ein)) {
      setError('EIN must be in format XX-XXXXXXX');
      return;
    }
    
    try {
      setEinVerifying(true);
      setError('');
      
      // Simulate EIN verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEinVerified(true);
    } catch (err) {
      setError('EIN verification service is currently unavailable. Please try again later.');
    } finally {
      setEinVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    try {
      setLoading(true);
      setError('');

      // Register user
      await signUp(formData.email, formData.password);

      // Get the user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Failed to get user data');

      // Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.companyName,
          ein: formData.ein,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Create employee record (admin)
      const { error: employeeError } = await supabase
        .from('employees')
        .insert({
          user_id: user.id,
          company_id: company.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          hire_date: new Date().toISOString(),
          salary_type: 'salary',
          salary_amount: 0,
          role: 'admin'
        });

      if (employeeError) throw employeeError;

      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (formData.step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="form-input pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="form-input pl-10 pr-10"
                  value={formData.password}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Password must be at least 8 characters and include uppercase, number, and special character.
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="form-input pl-10"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="form-label">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-400" />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="form-input pl-10"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-400" />
                </div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="form-input pl-10"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="companyName" className="form-label">Company Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 size={16} className="text-gray-400" />
                </div>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  className="form-input pl-10"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="ein" className="form-label">
                Employer Identification Number (EIN)
              </label>
              <div className="flex">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="ein"
                    name="ein"
                    type="text"
                    required
                    className={`form-input pl-10 ${einVerified ? 'border-success' : ''}`}
                    placeholder="XX-XXXXXXX"
                    value={formData.ein}
                    onChange={handleChange}
                  />
                </div>
                <button
                  type="button"
                  className="ml-2 btn btn-outline"
                  onClick={verifyEIN}
                  disabled={einVerifying || !formData.ein || !formData.companyName}
                >
                  {einVerifying ? 'Verifying...' : einVerified ? 'Verified' : 'Verify'}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Format: XX-XXXXXXX. Your EIN will be verified with government records.
              </p>
            </div>

            <div>
              <label htmlFor="address" className="form-label">Address</label>
              <input
                id="address"
                name="address"
                type="text"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="form-label">City</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="form-input"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="state" className="form-label">State</label>
                <select
                  id="state"
                  name="state"
                  className="form-input"
                  value={formData.state}
                  onChange={handleChange}
                >
                  <option value="">Select State</option>
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                  <option value="TX">Texas</option>
                  <option value="FL">Florida</option>
                  <option value="IL">Illinois</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="OH">Ohio</option>
                  <option value="GA">Georgia</option>
                  <option value="NC">North Carolina</option>
                  <option value="MI">Michigan</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="zipCode" className="form-label">ZIP Code</label>
              <input
                id="zipCode"
                name="zipCode"
                type="text"
                className="form-input"
                value={formData.zipCode}
                onChange={handleChange}
              />
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Terms of Service and Privacy Policy</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please review and accept our Terms of Service and Privacy Policy before creating your account.
              </p>
              
              <div className="max-h-60 overflow-y-auto p-4 bg-white rounded border border-gray-200 mb-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">Terms of Service</h4>
                <p className="text-sm text-gray-600 mb-2">
                  By using PaySurity, you agree to comply with all applicable laws and regulations. 
                  You are responsible for maintaining the confidentiality of your account credentials.
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  PaySurity provides payroll processing, tax filing, and related services to businesses.
                  We reserve the right to modify or terminate services at any time.
                </p>
                
                <h4 className="text-md font-medium text-gray-900 mt-4 mb-2">Privacy Policy</h4>
                <p className="text-sm text-gray-600 mb-2">
                  We collect personal information necessary to provide our services, including names, 
                  contact details, financial information, and employment data.
                </p>
                <p className="text-sm text-gray-600">
                  Your data is protected with industry-standard security measures. We do not sell your 
                  personal information to third parties.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="acceptTerms"
                      name="acceptTerms"
                      type="checkbox"
                      className="h-4 w-4 text-primary border-gray-300 rounded"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="acceptTerms" className="font-medium text-gray-700">
                      I accept the <Link to="/terms" className="text-primary hover:text-primary-dark">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:text-primary-dark">Privacy Policy</Link>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="acceptDataCollection"
                      name="acceptDataCollection"
                      type="checkbox"
                      className="h-4 w-4 text-primary border-gray-300 rounded"
                      checked={formData.acceptDataCollection}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="acceptDataCollection" className="font-medium text-gray-700">
                      I agree to allow PaySurity to collect and verify my information with authorized third-party sources for security and compliance purposes
                    </label>
                    <p className="text-gray-500">
                      This includes identity verification, EIN validation, and fraud prevention measures
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ClipboardCheck className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
            sign in to your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-error/10 border border-error/20 text-error px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex items-center ${
                    step < formData.step ? 'text-primary' : 
                    step === formData.step ? 'text-gray-900' : 
                    'text-gray-300'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                    step < formData.step ? 'border-primary bg-primary text-white' :
                    step === formData.step ? 'border-gray-900' :
                    'border-gray-300'
                  }`}>
                    {step}
                  </div>
                  <div className="ml-2 text-sm hidden sm:block">
                    {step === 1 ? 'Account' : step === 2 ? 'Personal' : step === 3 ? 'Company' : 'Terms'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={formData.step === 4 ? handleSubmit : nextStep}>
            {renderStep()}

            <div className="mt-6 flex items-center justify-between">
              {formData.step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn btn-outline"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className={`btn btn-primary ${formData.step === 1 ? 'w-full' : ''}`}
                disabled={loading}
              >
                {loading ? 'Processing...' : 
                  formData.step === 4 ? 'Create Account' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;