import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  system: string;
}

const FAQ: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSystem, setActiveSystem] = useState<string | null>(null);

  const faqItems: FAQItem[] = [
    // Payroll System FAQs
    {
      id: '1',
      question: 'How do I set up multi-factor authentication?',
      answer: 'To set up multi-factor authentication, go to Settings > Security > Two-Factor Authentication. Click "Set up" and follow the instructions to scan the QR code with your authenticator app. Enter the verification code to complete the setup.',
      category: 'Security',
      system: 'Payroll'
    },
    {
      id: '2',
      question: 'What happens if I lose access to my authenticator app?',
      answer: 'If you lose access to your authenticator app, you can use your backup recovery codes to sign in. These codes were provided when you set up MFA. If you don\'t have your recovery codes, contact our support team for assistance.',
      category: 'Security',
      system: 'Payroll'
    },
    {
      id: '3',
      question: 'How do I verify my company\'s EIN?',
      answer: 'During registration, you\'ll be asked to provide your company\'s EIN. Click the "Verify" button next to the EIN field. Our system will validate your EIN with government records. This verification helps ensure the security and compliance of our platform.',
      category: 'Registration',
      system: 'Payroll'
    },
    {
      id: '4',
      question: 'How often are payroll taxes calculated?',
      answer: 'Payroll taxes are calculated each time you process a payroll. The system automatically applies the most current tax rates and considers all applicable deductions and exemptions for each employee.',
      category: 'Payroll',
      system: 'Payroll'
    },
    {
      id: '5',
      question: 'Can I process payroll for employees in multiple states?',
      answer: 'Yes, PaySurity supports multi-state payroll processing. The system automatically applies the appropriate state tax rules based on each employee\'s work location. You can manage employees across all 50 states from a single account.',
      category: 'Payroll',
      system: 'Payroll'
    },
    
    // BistroBeast FAQs
    {
      id: '6',
      question: 'How does BistroBeast handle table management?',
      answer: 'BistroBeast includes a visual table management system that allows you to create a digital floor plan of your restaurant. You can track table status, assign servers, manage reservations, and optimize seating arrangements to maximize capacity.',
      category: 'Operations',
      system: 'BistroBeast'
    },
    {
      id: '7',
      question: 'Can BistroBeast integrate with third-party delivery services?',
      answer: 'Yes, BistroBeast integrates with major delivery platforms like DoorDash, Uber Eats, and Grubhub. Orders from these platforms are automatically imported into your POS system, streamlining operations and reducing manual entry errors.',
      category: 'Integrations',
      system: 'BistroBeast'
    },
    {
      id: '8',
      question: 'How does inventory management work in BistroBeast?',
      answer: 'BistroBeast\'s inventory management tracks ingredient usage based on menu items sold, automatically updates stock levels, and alerts you when items are running low. You can set reorder points, track vendor information, and generate purchase orders directly from the system.',
      category: 'Inventory',
      system: 'BistroBeast'
    },
    
    // GrocerEase FAQs
    {
      id: '9',
      question: 'Does GrocerEase support barcode scanning?',
      answer: 'Yes, GrocerEase fully supports barcode scanning for inventory management, receiving shipments, and at checkout. The system is compatible with most standard barcode scanners and can also use mobile devices as scanners through our mobile app.',
      category: 'Operations',
      system: 'GrocerEase'
    },
    {
      id: '10',
      question: 'How does GrocerEase handle perishable inventory?',
      answer: 'GrocerEase includes specialized features for perishable inventory management, including expiration date tracking, FIFO (First In, First Out) enforcement, automated markdown scheduling for aging products, and waste tracking for analytics and loss prevention.',
      category: 'Inventory',
      system: 'GrocerEase'
    },
    {
      id: '11',
      question: 'Can GrocerEase manage customer loyalty programs?',
      answer: 'Yes, GrocerEase includes a comprehensive loyalty program module that supports points systems, tiered rewards, digital coupons, and personalized offers based on purchase history. The system can also integrate with existing loyalty programs.',
      category: 'Marketing',
      system: 'GrocerEase'
    },
    
    // LegalEdge FAQs
    {
      id: '12',
      question: 'How does LegalEdge handle client conflict checks?',
      answer: 'LegalEdge includes an automated conflict checking system that searches across clients, matters, and related parties to identify potential conflicts of interest. The system maintains a comprehensive database of relationships and can generate conflict reports for compliance purposes.',
      category: 'Compliance',
      system: 'LegalEdge'
    },
    {
      id: '13',
      question: 'Does LegalEdge support trust accounting?',
      answer: 'Yes, LegalEdge includes specialized trust accounting features that help law firms maintain compliance with bar association rules. The system tracks client funds separately, prevents commingling, and generates the necessary reports for trust account reconciliation and audits.',
      category: 'Accounting',
      system: 'LegalEdge'
    },
    {
      id: '14',
      question: 'Can LegalEdge track billable hours and generate invoices?',
      answer: 'LegalEdge provides comprehensive time tracking with multiple timer options, expense tracking, and customizable billing rates. The system can generate detailed invoices with time entries, apply different fee arrangements (hourly, flat fee, contingency), and process online payments.',
      category: 'Billing',
      system: 'LegalEdge'
    },
    
    // DentistPro FAQs
    {
      id: '15',
      question: 'How does DentistPro handle patient scheduling?',
      answer: 'DentistPro includes a visual scheduling system that supports multiple providers, operatories, and appointment types. The system can send automated appointment reminders, handle recurring appointments, and optimize scheduling to maximize chair time.',
      category: 'Operations',
      system: 'DentistPro'
    },
    {
      id: '16',
      question: 'Does DentistPro support digital charting?',
      answer: 'Yes, DentistPro includes comprehensive digital charting with tooth and perio charts, treatment planning, and clinical notes. The system supports voice-to-text for hands-free documentation and integrates with major imaging software for a complete digital workflow.',
      category: 'Clinical',
      system: 'DentistPro'
    },
    {
      id: '17',
      question: 'How does DentistPro handle insurance claims?',
      answer: 'DentistPro streamlines insurance management with electronic claims submission, real-time eligibility verification, and automated claim tracking. The system maintains a database of insurance plans and fee schedules, and can generate patient estimates based on coverage.',
      category: 'Billing',
      system: 'DentistPro'
    },
    
    // MerchantHub FAQs
    {
      id: '18',
      question: 'What payment methods does MerchantHub support?',
      answer: 'MerchantHub supports all major credit and debit cards, ACH transfers, digital wallets (Apple Pay, Google Pay, etc.), and buy-now-pay-later options. The system is PCI compliant and includes fraud prevention tools to protect your business.',
      category: 'Payments',
      system: 'MerchantHub'
    },
    {
      id: '19',
      question: 'How does MerchantHub handle transaction fees?',
      answer: 'MerchantHub offers transparent pricing with no hidden fees. Rates are based on your business type and transaction volume, with discounts available for higher volumes. All fees are clearly displayed in your monthly statement and dashboard.',
      category: 'Billing',
      system: 'MerchantHub'
    },
    {
      id: '20',
      question: 'Can MerchantHub integrate with my existing systems?',
      answer: 'Yes, MerchantHub offers APIs and pre-built integrations with all other PaySurity systems as well as popular e-commerce platforms, accounting software, and CRM systems. Our team can also build custom integrations for your specific business needs.',
      category: 'Integrations',
      system: 'MerchantHub'
    }
  ];

  const toggleItem = (id: string) => {
    setActiveId(activeId === id ? null : id);
  };

  const categories = Array.from(new Set(faqItems.map(item => item.category)));
  const systems = Array.from(new Set(faqItems.map(item => item.system)));

  const filteredItems = faqItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === null || item.category === activeCategory;
    const matchesSystem = activeSystem === null || item.system === activeSystem;
    
    return matchesSearch && matchesCategory && matchesSystem;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Helmet>
        <title>Frequently Asked Questions | PaySurity</title>
        <meta name="description" content="Find answers to common questions about PaySurity's business management systems and services." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about all PaySurity systems and services.
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for questions..."
              className="form-input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by System:</label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeSystem === null
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveSystem(null)}
              >
                All Systems
              </button>
              {systems.map(system => (
                <button
                  key={system}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    activeSystem === system
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveSystem(system)}
                >
                  {system}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category:</label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeCategory === null
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveCategory(null)}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    activeCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No questions found matching your criteria.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                  onClick={() => toggleItem(item.id)}
                >
                  <div>
                    <span className="text-lg font-medium text-gray-900">{item.question}</span>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                        {item.system}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  {activeId === item.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                
                {activeId === item.id && (
                  <div className="px-6 pb-4">
                    <div className="text-gray-600">
                      {item.answer}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-12 bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-4">
            Our support team is here to help you with any questions you may have.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/contact" className="btn btn-primary">
              Contact Support
            </a>
            <a href="/docs" className="btn btn-outline">
              View Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;