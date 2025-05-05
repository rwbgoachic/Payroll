import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

import faqData from '../data/faq.json';

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

  const faqItems: FAQItem[] = faqData.faqs;
  const categories = faqData.schema.categories;
  const systems = faqData.schema.systems;

  const toggleItem = (id: string) => {
    setActiveId(activeId === id ? null : id);
  };

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