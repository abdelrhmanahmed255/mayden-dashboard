import React from 'react';

const Footer: React.FC = () => {

  return (
    <footer className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white border-t border-blue-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">DocuFlow</span>
            </div>
            <p className="text-gray-400 text-sm">
              Modern and secure document management platform for streamlined workflows.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-2 text-gray-200">Quick Links</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>
                <a href="/dashboard" className="hover:text-blue-400 transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/admin/documents" className="hover:text-blue-400 transition-colors">
                  Documents
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
        
        </div>

        
      </div>
    </footer>
  );
};

export default Footer;
