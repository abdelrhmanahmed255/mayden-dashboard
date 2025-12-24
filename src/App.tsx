import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { 
  Dashboard, 
  DocumentDetails, 
  Documents,
  DemoLogin,
  Login,
  Register
} from './pages';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set HTML dir and lang attributes based on current language
    const isRtl = i18n.language === 'ar';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Routes>
      {/* Demo Login - Default Page */}
      <Route path="/" element={<DemoLogin />} />
      
      {/* Admin Login with API */}
      <Route path="/dashboard" element={<Login />} />
      <Route path="/dashboard/register" element={<Register />} />
      
      {/* Protected Admin Dashboard Pages */}
      <Route path="/admin/dashboard" element={
        <Layout>
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Layout>
      } />
      {/* Documents List */}
      <Route path="/admin/documents" element={
        <Layout>
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        </Layout>
      } />
      {/* Document Details */}
      <Route path="/admin/documents/:id" element={
        <Layout>
          <ProtectedRoute>
            <DocumentDetails />
          </ProtectedRoute>
        </Layout>
      } />
    </Routes>
  );
}

export default App;
