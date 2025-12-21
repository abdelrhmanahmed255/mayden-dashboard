import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gov-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold mb-2">Admin Dashboard</h3>
            <p className="text-gray-400 text-sm">
              Secure document management system for government administrators.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>
                <a href="/dashboard" className="hover:text-gov-light transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/documents" className="hover:text-gov-light transition-colors">
                  Documents
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-2">Support</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>Email: admin-support@gov-portal.gov</li>
              <li>Helpdesk: 1-800-ADMIN</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} Government Document System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
