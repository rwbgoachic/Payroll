import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  DollarSign, 
  FileText, 
  LockIcon, 
  ShieldCheck,
  Users,
  Clock,
  Heart,
  BarChart
} from 'lucide-react';
import SEO from '../components/layout/SEO';
import { siteConfig } from '../config/siteConfig';
import { useTranslation } from 'react-i18next';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <SEO />
      
      {/* Hero Section with Video Background */}
      <section className="relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
          <video 
            className="absolute min-w-full min-h-full object-cover"
            autoPlay 
            muted 
            loop 
            playsInline
          >
            <source src="https://player.vimeo.com/external/528726343.sd.mp4?s=edb577b04e6b8d8665ecec6e6d7b1c86c3e4fd3d&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-primary/90"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-white">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Modern Payroll Software for Modern Businesses
              </h1>
              <p className="text-xl opacity-90">
                Streamline your payroll process with automated tax compliance and comprehensive employee management.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                <Link to="/register" className="btn bg-white text-primary hover:bg-gray-100">
                  Start Free Trial
                </Link>
                <Link to="/demo" className="btn border border-white bg-transparent hover:bg-white/10">
                  Request Demo
                </Link>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-5 w-5" />
                <span>No credit card required</span>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-white/10 rounded-lg backdrop-blur-sm animate-pulse"></div>
              <div className="relative bg-white/90 rounded-lg shadow-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div className="ml-3">
                        <div className="text-gray-900 font-semibold">Payroll Dashboard</div>
                        <div className="text-gray-500 text-sm">April 2025</div>
                      </div>
                    </div>
                    <span className="bg-success/10 text-success text-xs px-2 py-1 rounded-full">Processing</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">42 Employees</div>
                          <div className="text-xs text-gray-500">Active</div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-success/10 rounded-full flex items-center justify-center text-success">
                          <DollarSign className="h-4 w-4" />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">$158,234.56</div>
                          <div className="text-xs text-gray-500">Total Payroll</div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-warning/10 rounded-full flex items-center justify-center text-warning">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">Tax Filings</div>
                          <div className="text-xs text-gray-500">Due in 5 days</div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <button className="btn btn-primary w-full mt-6">
                    Run Payroll
                  </button>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                  <div className="text-sm text-gray-500">Next Pay Date: April 30, 2025</div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Comprehensive Payroll Features</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage payroll, tax compliance, and employee benefits in one secure platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-2 border-primary/30 rounded-lg p-6 hover:border-primary transition-all hover:shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Seamless Payroll & Payments</h3>
              <p className="text-gray-600 mb-4">
                Streamline payroll and merchant services with integrated solutions that save time, reduce errors, and keep you compliant. Focus on growing your business, not paperwork.
              </p>
              <Link to="/features#payroll" className="text-primary hover:text-primary-dark font-medium flex items-center">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="border-2 border-primary/30 rounded-lg p-6 hover:border-primary transition-all hover:shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Affordable, Transparent Pricing</h3>
              <p className="text-gray-600 mb-4">
                Say goodbye to hidden fees. Our merchant services offer clear pricing, seamless payroll integration, and 24/7 support tailored for small businesses.
              </p>
              <Link to="/features#tax-compliance" className="text-primary hover:text-primary-dark font-medium flex items-center">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="border-2 border-primary/30 rounded-lg p-6 hover:border-primary transition-all hover:shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure, Fast Payments</h3>
              <p className="text-gray-600 mb-4">
                Ensure payroll accuracy and safeguard transactions with PCI-compliant merchant services. Speed up payments while keeping data secure.
              </p>
              <Link to="/features#employee-management" className="text-primary hover:text-primary-dark font-medium flex items-center">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="border-2 border-primary/30 rounded-lg p-6 hover:border-primary transition-all hover:shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">From Payroll to POS</h3>
              <p className="text-gray-600 mb-4">
                Integrate payroll, payments, and reporting in one platform. Eliminate fragmented systems and simplify financial management.
              </p>
              <Link to="/features#time-tracking" className="text-primary hover:text-primary-dark font-medium flex items-center">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="border-2 border-primary/30 rounded-lg p-6 hover:border-primary transition-all hover:shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">24/7 Support for Payroll</h3>
              <p className="text-gray-600 mb-4">
                Get instant help when payroll deadlines loom. Our merchant services team ensures your payments are always on time and error-free.
              </p>
              <Link to="/features#benefits-administration" className="text-primary hover:text-primary-dark font-medium flex items-center">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="border-2 border-primary/30 rounded-lg p-6 hover:border-primary transition-all hover:shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                <BarChart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Automate Payroll, Boost Productivity</h3>
              <p className="text-gray-600 mb-4">
                Cut manual tasks with automated payroll and merchant tools. Reclaim hours to focus on customer relationships and strategic growth.
              </p>
              <Link to="/features#reporting" className="text-primary hover:text-primary-dark font-medium flex items-center">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 bg-gray-50" id="security">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center order-2 md:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg transform -rotate-3"></div>
                <img 
                  src="https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260" 
                  alt="Secure payroll management" 
                  className="relative rounded-lg shadow-lg object-cover h-80 w-full sm:h-96"
                />
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Compliance Confidence</h2>
              <p className="text-lg text-gray-600 mb-8">
                Avoid penalties with payroll and payment systems built for tax and labor law compliance. Updates included, so you're always covered.
              </p>
              
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <LockIcon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Data Encryption</h3>
                    <p className="mt-1 text-gray-600">
                      AES-256 encryption at rest and TLS 1.3 encryption in transit for all data.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Role-Based Access</h3>
                    <p className="mt-1 text-gray-600">
                      Granular permission controls ensure users only see what they need to.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Data Isolation</h3>
                    <p className="mt-1 text-gray-600">
                      Separate database schemas for each client ensure complete data separation.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Link to="/security" className="btn btn-primary">
                  Learn More About Security
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Real-Time Insights, Smarter Financial Decisions</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Track payroll expenses and payment trends in one dashboard. Make data-driven choices to optimize cash flow and reduce overhead.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-2 border-primary/30 rounded-lg p-6 hover:border-primary transition-all hover:shadow-lg">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  AC
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Acme Corporation</h3>
                  <p className="text-sm text-gray-500">Manufacturing, 250 employees</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "PaySurity has transformed our payroll process. What used to take days now takes hours, and our employees love the self-service portal."
              </p>
              <div className="flex text-yellow-400">
                <Star />
                <Star />
                <Star />
                <Star />
                <Star />
              </div>
            </div>
            
            <div className="border-2 border-primary/30 rounded-lg p-6 hover:border-primary transition-all hover:shadow-lg">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  GI
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Globex Inc</h3>
                  <p className="text-sm text-gray-500">Technology, 75 employees</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "The tax compliance features alone are worth the investment. We operate in 12 states, and PaySurity handles all the different tax rules flawlessly."
              </p>
              <div className="flex text-yellow-400">
                <Star />
                <Star />
                <Star />
                <Star />
                <Star />
              </div>
            </div>
            
            <div className="border-2 border-primary/30 rounded-lg p-6 hover:border-primary transition-all hover:shadow-lg">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  SC
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Sunshine Cafe</h3>
                  <p className="text-sm text-gray-500">Restaurant, 15 employees</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "As a small business, we needed an affordable solution that could grow with us. PaySurity has been perfect, and their customer support is exceptional."
              </p>
              <div className="flex text-yellow-400">
                <Star />
                <Star />
                <Star />
                <Star />
                <StarHalf />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Your Business Deserves Better</h2>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
            Ditch clunky payroll providers. Our merchant services deliver speed, security, and simplicity for businesses tired of settling for "good enough."
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="btn bg-white text-primary hover:bg-gray-100">
              Start Free Trial
            </Link>
            <Link to="/demo" className="btn border border-white bg-transparent hover:bg-white/10">
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

// Helper components for icons
const Star = () => (
  <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const StarHalf = () => (
  <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
    <defs>
      <linearGradient id="half-fill" x1="0" x2="100%" y1="0" y2="0">
        <stop offset="50%" stopColor="currentColor" />
        <stop offset="50%" stopColor="rgba(209, 213, 219, 0.5)" />
      </linearGradient>
    </defs>
    <path fill="url(#half-fill)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default LandingPage;