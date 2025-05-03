import React from 'react';
import { Bell, ChevronDown, Menu, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import SyncStatus from './SyncStatus';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { t } = useTranslation();
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center lg:hidden">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-600"
            onClick={onMenuClick}
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('common.search')}
              className="form-input pl-10"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <SyncStatus className="hidden md:flex" />
          <LanguageSwitcher />
          
          <button type="button" className="text-gray-500 hover:text-gray-600 relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-error transform -translate-y-1/2 translate-x-1/2"></span>
          </button>

          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center uppercase">
              JS
            </div>
            <div className="hidden md:flex ml-2 flex-col">
              <span className="text-sm font-medium">John Smith</span>
              <span className="text-xs text-gray-500">Administrator</span>
            </div>
            <ChevronDown size={16} className="ml-1 text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;