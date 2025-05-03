import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, X, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing: React.FC = () => {
  const [annual, setAnnual] = useState(true);
  
  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small businesses just getting started',
      monthlyPrice: 29,
      annualPrice: 24,
      features: [
        'Up to 10 employees',
        'Automated payroll processing',
        'Direct deposit',
        'Basic tax filing',
        'Employee self-service portal',
        'Email support'
      ],
      notIncluded: [
        'Multi-state tax filing',
        'Benefits administration',
        'Time tracking',
        'Advanced reporting',
        'Dedicated account manager'
      ]
    },
    {
      name: 'Professional',
      description: 'Ideal for growing businesses with more complex needs',
      monthlyPrice: 59,
      annualPrice: 49,
      popular: true,
      features: [
        'Up to 50 employees',
        'Automated payroll processing',
        'Direct deposit',
        'Federal & state tax filing',
        'Employee self-service portal',
        'Benefits administration',
        'Time tracking',
        'Basic reporting',
        'Email & phone support'
      ],
      notIncluded: [
        'Multi-state tax filing',
        'Advanced reporting',
        'Dedicated account manager'
      ]
    },
    {
      name: 'Enterprise',
      description: 'For larger organizations with advanced requirements',
      monthlyPrice: 99,
      annualPrice: 79,
      features: [
        'Unlimited employees',
        'Automated payroll processing',
        'Direct deposit',
        'Federal & multi-state tax filing',
        'Employee self-service portal',
        'Benefits administration',
        'Time tracking',
        'Advanced reporting',
        'Custom integrations',
        'Dedicated account manager',
        'Priority support'
      ],
      notIncluded: []
    }
  ];

  return (
    <div className="bg-gray-50">
      <Helmet>
        <title>Pricing | PaySurity - Modern Payroll Software</title>
        <meta name="description" content="Affordable payroll software pricing plans for businesses of all sizes. Choose the plan that fits your needs and budget." />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Choose the plan that fits your business needs. No hidden fees, no surprises.
          </p>
        </div>
      </div>

      {/* Pricing Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-full p-1 flex shadow-sm">
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium ${
                !annual ? 'bg-primary text-white' : 'text-gray-500'
              }`}
              onClick={() => setAnnual(false)}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium ${
                annual ? 'bg-primary text-white' : 'text-gray-500'
              }`}
              onClick={() => setAnnual(true)}
            >
              Annual <span className="text-xs opacity-75">(Save 20%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`bg-white rounded-lg shadow-sm overflow-hidden ${
                plan.popular ? 'ring-2 ring-primary relative' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-primary text-white text-xs font-bold uppercase tracking-wider py-1 text-center">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-500 mt-1">{plan.description}</p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${annual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="ml-1 text-xl font-medium text-gray-500">
                    /mo per employee
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {annual ? 'Billed annually' : 'Billed monthly'}
                </p>
                <Link
                  to="/register"
                  className={`mt-6 block w-full py-3 px-4 rounded-md shadow text-center text-sm font-medium ${
                    plan.popular
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'bg-primary-light/10 text-primary hover:bg-primary-light/20'
                  }`}
                >
                  Start Free Trial
                </Link>
              </div>
              <div className="px-6 pt-6 pb-8 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                  What's included
                </h4>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5 mr-3" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.notIncluded.length > 0 && (
                  <>
                    <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mt-6">
                      Not included
                    </h4>
                    <ul className="mt-4 space-y-3">
                      {plan.notIncluded.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5 mr-3" />
                          <span className="text-sm text-gray-500">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">
            Find answers to common questions about our pricing and plans.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <HelpCircle className="h-5 w-5 text-primary mr-2" />
              Are there any setup fees?
            </h3>
            <p className="mt-2 text-gray-600">
              No, there are no setup fees for any of our plans. You only pay the monthly or annual subscription fee.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <HelpCircle className="h-5 w-5 text-primary mr-2" />
              Can I change plans later?
            </h3>
            <p className="mt-2 text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged the prorated difference. If you downgrade, you'll receive a prorated credit towards your next billing cycle.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <HelpCircle className="h-5 w-5 text-primary mr-2" />
              Is there a free trial?
            </h3>
            <p className="mt-2 text-gray-600">
              Yes, we offer a 14-day free trial for all plans. No credit card required to start your trial.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <HelpCircle className="h-5 w-5 text-primary mr-2" />
              What payment methods do you accept?
            </h3>
            <p className="mt-2 text-gray-600">
              We accept all major credit cards (Visa, Mastercard, American Express, Discover) and ACH bank transfers for annual plans.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <HelpCircle className="h-5 w-5 text-primary mr-2" />
              Do you offer discounts for nonprofits?
            </h3>
            <p className="mt-2 text-gray-600">
              Yes, we offer special pricing for nonprofit organizations. Please contact our sales team for more information.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to simplify your payroll?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
            Join thousands of businesses that trust PaySurity for their payroll needs. Get started with a free trial today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="btn bg-white text-primary hover:bg-gray-100">
              Start Free Trial
            </Link>
            <Link to="/contact" className="btn border border-white bg-transparent hover:bg-white/10">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;