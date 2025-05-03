/**
 * Site configuration for payroll.paysurity.com
 */

export const siteConfig = {
  name: 'PaySurity Payroll',
  description: 'Modern payroll software with automated tax compliance for businesses of all sizes',
  url: 'https://payroll.paysurity.com',
  mainSiteUrl: 'https://paysurity.com',
  ogImage: 'https://payroll.paysurity.com/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/paysurity',
    github: 'https://github.com/paysurity',
    linkedin: 'https://linkedin.com/company/paysurity'
  },
  contactEmail: 'support@paysurity.com',
  contactPhone: '1-800-PAY-SURE',
  address: {
    street: '123 Business Ave, Suite 100',
    city: 'San Francisco',
    state: 'CA',
    zip: '94103',
    country: 'USA'
  },
  features: [
    {
      id: 'payroll-processing',
      title: 'Payroll Processing',
      description: 'Fast, accurate payroll with automatic tax calculations and deductions',
      icon: 'DollarSign'
    },
    {
      id: 'tax-compliance',
      title: 'Tax Compliance',
      description: 'Automated tax filing and compliance for all 50 states',
      icon: 'FileText'
    },
    {
      id: 'employee-management',
      title: 'Employee Management',
      description: 'Comprehensive tools for managing your workforce',
      icon: 'Users'
    },
    {
      id: 'time-tracking',
      title: 'Time Tracking',
      description: 'Accurate time tracking with approval workflows',
      icon: 'Clock'
    },
    {
      id: 'benefits-administration',
      title: 'Benefits Administration',
      description: 'Manage employee benefits with ease',
      icon: 'Heart'
    },
    {
      id: 'reporting',
      title: 'Reporting',
      description: 'Comprehensive reporting for payroll, taxes, and more',
      icon: 'BarChart'
    }
  ],
  pricing: {
    currency: 'USD',
    plans: [
      {
        id: 'starter',
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
        id: 'professional',
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
        id: 'enterprise',
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
    ]
  },
  mainNavigation: [
    { title: 'Features', href: '/features' },
    { title: 'Pricing', href: '/pricing' },
    { title: 'Blog', href: '/blog' },
    { title: 'Resources', href: '/resources' },
    { title: 'Contact', href: '/contact' }
  ],
  footerNavigation: {
    solutions: [
      { name: 'Payroll Processing', href: '/features#payroll' },
      { name: 'Tax Filing', href: '/features#tax-filing' },
      { name: 'Employee Benefits', href: '/features#benefits' },
      { name: 'Time Tracking', href: '/features#time-tracking' },
      { name: 'HR Management', href: '/features#hr' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQ', href: '/faq' }
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' }
    ],
    legal: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
      { name: 'Security', href: '/security' },
      { name: 'Compliance', href: '/compliance' }
    ]
  },
  relatedSystems: [],
  seo: {
    titleTemplate: '%s | PaySurity Payroll',
    defaultTitle: 'PaySurity Payroll - Modern Payroll Software for Businesses',
    defaultDescription: 'PaySurity delivers affordable payroll services with automated tax compliance for SMBs and global teams.',
    defaultKeywords: [
      'payroll software',
      'automated tax compliance',
      'small business payroll',
      'global payroll solutions',
      'affordable payroll services'
    ]
  }
};