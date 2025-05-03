import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ClipboardCheck, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const MainHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  const navigation = [
    { title: 'Features', href: '/features' },
    { title: 'Pricing', href: '/pricing' },
    { title: 'Blog', href: '/blog' },
    { title: 'FAQ', href: '/faq' },
    { title: 'Contact', href: '/contact' }
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <ClipboardCheck className="h-8 w-8 text-primary" />
              <div className="ml-2">
                <div className="text-xl font-bold text-gray-900">{t('common.appName')}</div>
                <div className="text-sm text-gray-500 -mt-1">{t('payroll.process')}</div>
              </div>
            </Link>
            <div className="hidden ml-10 space-x-8 lg:flex">
              {navigation.map((link) => (
                <Link
                  key={link.title}
                  to={link.href}
                  className={`text-base font-medium ${
                    isActive(link.href)
                      ? 'text-primary'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            {user ? (
              <>
                <Link
                  to="/app"
                  className="btn btn-primary"
                >
                  {t('dashboard.overview')}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-base font-medium text-gray-500 hover:text-gray-900"
                >
                  {t('auth.signOut')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-base font-medium text-gray-500 hover:text-gray-900"
                >
                  {t('auth.signIn')}
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  {t('auth.signUp')}
                </Link>
              </>
            )}
            <button
              type="button"
              className="lg:hidden p-2 text-gray-400 hover:text-gray-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div
          className={`lg:hidden ${
            mobileMenuOpen ? 'block' : 'hidden'
          } pb-6`}
        >
          <div className="space-y-1">
            {navigation.map((link) => (
              <Link
                key={link.title}
                to={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.href)
                    ? 'bg-gray-50 text-primary'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.title}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              >
                {t('auth.signOut')}
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('auth.signIn')}
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('auth.signUp')}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default MainHeader;