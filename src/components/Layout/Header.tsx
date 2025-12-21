import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context';

const Header: React.FC = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-gov-dark text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gov-light rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <Link to="/dashboard" className="text-xl font-bold hover:text-gov-light transition-colors">
                Admin Dashboard
              </Link>
              <p className="text-xs text-gray-300">Document Management System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-gov-light text-white'
                      : 'text-gray-300 hover:bg-gov-primary hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/documents"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/documents') || location.pathname.startsWith('/documents/')
                      ? 'bg-gov-light text-white'
                      : 'text-gray-300 hover:bg-gov-primary hover:text-white'
                  }`}
                >
                  Documents
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/login') || isActive('/')
                      ? 'bg-gov-light text-white'
                      : 'text-gray-300 hover:bg-gov-primary hover:text-white'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/register')
                      ? 'bg-gov-light text-white'
                      : 'text-gray-300 hover:bg-gov-primary hover:text-white'
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* User Info & Logout */}
          {isLoggedIn && (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-gray-300">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
