import React from 'react';
import { 
  CheckCircle2, 
  DollarSign, 
  FileText, 
  Users, 
  Clock, 
  Heart, 
  BarChart,
  ArrowRight,
  Shield,
  Lock,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/layout/SEO';
import { siteConfig } from '../config/siteConfig';
import { useTranslation } from 'react-i18next';

const Features: React.FC = () => {
  const { t } = useTranslation();
  const { features } = siteConfig;
  
  return (
    <>
      <SEO 
        title="Features" 
        description="Explore the comprehensive features of PaySurity's payroll software including automated tax compliance, employee management, and time tracking."
      />

      {/* Hero Section */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-6">Powerful Payroll Features</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Everything you need to manage payroll, tax compliance, and employee benefits in one secure platform.
          </p>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-2 border-primary/30 rounded-lg p-6 hover:border-primary transition-all hover:shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Seamless Payroll & Payments</h3>
              <p className="text-gray-600 mb-4">
                Streamline payroll and merchant services with integrated solutions that save time, reduce errors, and keep you compliant.
              </p>
              <a href="#payroll-processing" className="text-primary hover:text-primary-dark font-medium">
                Learn more
              </a>
            </div>

            <div className="border-2 border-primary/30 rounded-lg p-6 hover:border-primary transition-all hover:shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure, Fast Payments</h3>
              <p className="text-gray-600 mb-4">
                Ensure payroll accuracy and safeguard transactions with PCI-compliant merchant services. Speed up payments while keeping data secure.
              </p>
              <a href="#tax-compliance" className="text-primary hover:text-primary-dark font-medium">
                Learn more
              </a>
            </div>

            <div className="border-2 border-primary/30 rounded-lg p-6 hover:border-primary transition-all hover:shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Automate Payroll, Boost Productivity</h3>
              <p className="text-gray-600 mb-4">
                Cut manual tasks with automated payroll and merchant tools. Reclaim hours to focus on customer relationships and strategic growth.
              </p>
              <a href="#employee-management" className="text-primary hover:text-primary-dark font-medium">
                Learn more
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Payroll Processing */}
      <section id="payroll-processing" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <DollarSign className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payroll Processing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Process payroll quickly and accurately with our comprehensive solution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <ul className="space-y-4">
                <li className="flex">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Multiple Pay Schedules</h4>
                    <p className="text-gray-600">
                      Support for weekly, bi-weekly, semi-monthly, and monthly pay periods.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Direct Deposit</h4>
                    <p className="text-gray-600">
                      Fast and secure direct deposits to employee bank accounts.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Automatic Deductions</h4>
                    <p className="text-gray-600">
                      Configure recurring deductions for benefits, retirement plans, and more.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Payroll Reports</h4>
                    <p className="text-gray-600">
                      Comprehensive reporting for payroll expenses, taxes, and employee earnings.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-primary/30 hover:border-primary transition-all">
              <img 
                src="https://images.pexels.com/photos/7821485/pexels-photo-7821485.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Payroll processing dashboard" 
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tax Filing */}
      <section id="tax-compliance" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mx-auto mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tax Compliance</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay compliant with automatic tax calculations and filings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-white p-6 rounded-lg border-2 border-primary/30 hover:border-primary transition-all order-2 md:order-1">
              <img 
                src="https://images.pexels.com/photos/6693661/pexels-photo-6693661.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Tax filing dashboard" 
                className="rounded-lg"
              />
            </div>
            <div className="order-1 md:order-2">
              <ul className="space-y-4">
                <li className="flex">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Automatic Tax Calculations</h4>
                    <p className="text-gray-600">
                      Accurate tax calculations for federal, state, and local taxes.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Tax Form Preparation</h4>
                    <p className="text-gray-600">
                      Automated preparation of W-2s, 1099s, 940s, 941s, and state forms.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Tax Filing Calendar</h4>
                    <p className="text-gray-600">
                      Never miss a deadline with our tax filing calendar and reminders.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Year-End Processing</h4>
                    <p className="text-gray-600">
                      Streamlined year-end processing and reporting.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Employee Management */}
      <section id="employee-management" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Employee Management</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools for managing your workforce efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-primary/30 hover:border-primary transition-all">
              <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Employee Onboarding</h3>
              <p className="text-gray-600 mb-4">
                Streamlined onboarding process with digital forms and document management.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  Digital I-9 and W-4 forms
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  Document storage and management
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  Automated welcome emails
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border-2 border-primary/30 hover:border-primary transition-all">
              <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-4">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Benefits Administration</h3>
              <p className="text-gray-600 mb-4">
                Manage employee benefits with ease, from health insurance to retirement plans.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  Health, dental, and vision plans
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  401(k) and retirement plans
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  Life and disability insurance
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border-2 border-primary/30 hover:border-primary transition-all">
              <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Employee Self-Service</h3>
              <p className="text-gray-600 mb-4">
                Empower employees with access to their information and documents.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  View pay stubs and tax forms
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  Update personal information
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  Request time off
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Time Tracking */}
      <section id="time-tracking" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-16 w-16 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto mb-4">
              <Clock className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Time Tracking</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Accurate time tracking with approval workflows and overtime calculations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <ul className="space-y-4">
                <li className="flex">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Web & Mobile Time Tracking</h4>
                    <p className="text-gray-600">
                      Track time from anywhere with our web and mobile apps.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Approval Workflows</h4>
                    <p className="text-gray-600">
                      Customizable approval workflows for time entries and overtime.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Overtime Calculations</h4>
                    <p className="text-gray-600">
                      Automatic overtime calculations based on federal and state laws.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">PTO Tracking</h4>
                    <p className="text-gray-600">
                      Track and manage paid time off, sick leave, and vacation time.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border-2 border-primary/30 hover:border-primary transition-all">
              <img 
                src="https://images.pexels.com/photos/3943882/pexels-photo-3943882.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Time tracking interface" 
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Administration */}
      <section id="benefits-administration" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <Heart className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Benefits Administration</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamline benefits management for your employees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-primary/30 hover:border-primary transition-all order-2 md:order-1">
              <img 
                src="https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Benefits administration" 
                className="rounded-lg"
              />
            </div>
            <div className="order-1 md:order-2">
              <ul className="space-y-4">
                <li className="flex">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Health Insurance Management</h4>
                    <p className="text-gray-600">
                      Manage health, dental, and vision plans with ease.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Retirement Plan Administration</h4>
                    <p className="text-gray-600">
                      Administer 401(k) and other retirement plans with automatic deductions.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Life and Disability Insurance</h4>
                    <p className="text-gray-600">
                      Manage life, short-term, and long-term disability insurance.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Open Enrollment Management</h4>
                    <p className="text-gray-600">
                      Streamline the open enrollment process with digital forms and automated reminders.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Reporting */}
      <section id="reporting" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <BarChart className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Reporting</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gain insights into your payroll data with detailed reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border-2 border-primary/30 hover:border-primary transition-all">
              <h3 className="text-lg font-semibold mb-4">Payroll Reports</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  Payroll summary reports
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  Employee earnings reports
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  Deduction reports
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  Department cost reports
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg border-2 border-primary/30 hover:border-primary transition-all">
              <h3 className="text-lg font-semibold mb-4">Tax Reports</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  Quarterly tax reports
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  Annual tax summaries
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  W-2 and 1099 preparation
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  Tax liability reports
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg border-2 border-primary/30 hover:border-primary transition-all">
              <h3 className="text-lg font-semibold mb-4">HR Reports</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  Employee directory
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  Time off balances
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  Benefits enrollment reports
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                  Employee turnover reports
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Grow Your Business, Not Your Costs</h2>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
            Flexible services adapt as you scale. Handle payroll for 5 or 500 employees while managing payments effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="btn bg-white text-primary hover:bg-gray-100">
              Start Free Trial
            </Link>
            <Link to="/pricing" className="btn border border-white bg-transparent hover:bg-white/10">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

// Helper function to get feature icon
function getFeatureIcon(iconName: string) {
  switch (iconName) {
    case 'DollarSign':
      return DollarSign;
    case 'FileText':
      return FileText;
    case 'Users':
      return Users;
    case 'Clock':
      return Clock;
    case 'Heart':
      return Heart;
    case 'BarChart':
      return BarChart;
    default:
      return DollarSign;
  }
}

export default Features;