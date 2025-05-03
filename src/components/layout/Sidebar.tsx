import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  ClipboardList, 
  DollarSign, 
  FileText, 
  Home, 
  Settings, 
  Users, 
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  
  const navItems = [
    { name: t('dashboard.overview'), path: '/app', icon: <Home size={20} /> },
    { name: t('employees.management'), path: '/app/employees', icon: <Users size={20} /> },
    { name: t('payroll.process'), path: '/app/payroll', icon: <DollarSign size={20} /> },
    { name: t('taxes.filing'), path: '/app/tax-filing', icon: <FileText size={20} /> },
    { name: t('dashboard.statistics'), path: '/app/reports', icon: <BarChart3 size={20} /> },
    { name: t('settings.title'), path: '/app/settings', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <ClipboardList size={24} className="text-primary" />
              <div className="ml-3">
                <div className="text-xl font-bold text-gray-900">{t('common.appName')}</div>
                <div className="text-sm text-gray-500 -mt-1">{t('payroll.process')}</div>
              </div>
            </div>
            <button 
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-light/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
                end={item.path === '/app'}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Language switcher */}
          <div className="p-4 border-t border-gray-200">
            <LanguageSwitcher />
          </div>

          {/* Company section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded bg-primary flex items-center justify-center text-white font-semibold">
                  AC
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Acme Corp</p>
                <p className="text-xs font-medium text-gray-500">EIN: 12-3456789</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;