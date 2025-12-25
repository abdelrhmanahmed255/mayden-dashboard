import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context';
import LanguageSwitcher from '../LanguageSwitcher';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-lg border-b border-blue-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">{t('app.title')}</span>
            </div>
          
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {isLoggedIn ? (
              <>
                <Link
                  to="/sys-admin-portal/overview"
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive('/sys-admin-portal/overview')
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-blue-100 hover:bg-blue-500/20'
                  }`}
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  to="/sys-admin-portal/documents"
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive('/sys-admin-portal/documents') || location.pathname.startsWith('/sys-admin-portal/documents/')
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-blue-100 hover:bg-blue-500/20'
                  }`}
                >
                  {t('nav.documents')}
                </Link>
              </>
            ) : (
              <Link
                to="/sys-auth-portal"
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive('/sys-auth-portal')
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-blue-100 hover:bg-blue-500/20'
                }`}
              >
                {t('nav.login')}
              </Link>
            )}
          </nav>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {isLoggedIn && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right rtl:text-left">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg"
                >
                  {t('nav.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
