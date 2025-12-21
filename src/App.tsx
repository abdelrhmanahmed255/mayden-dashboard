import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { 
  Dashboard, 
  DocumentDetails, 
  Documents,
  Login,
  Register
} from './pages';

function App() {
  return (
    <Routes>
      {/* Admin Login */}
      <Route path="/" element={
        <Layout>
          <Login />
        </Layout>
      } />
      <Route path="/login" element={
        <Layout>
          <Login />
        </Layout>
      } />
      {/* Admin Register */}
      <Route path="/register" element={
        <Layout>
          <Register />
        </Layout>
      } />
      
      {/* Protected Dashboard Pages */}
      <Route path="/dashboard" element={
        <Layout>
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Layout>
      } />
      {/* Documents List */}
      <Route path="/documents" element={
        <Layout>
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        </Layout>
      } />
      {/* Document Details */}
      <Route path="/documents/:id" element={
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
