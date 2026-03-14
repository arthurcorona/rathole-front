import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Suggestions from './pages/Suggestions';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import About from './pages/About';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';


const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />; 
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/suggestions" element={<Suggestions />} />
        <Route path="/posts/:slug" element={<PostDetail />} />
        
        {/* Rota Privada Comum */}
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } 
        />

        {/* Rotas de admin */}
        <Route 
          path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }/>

        <Route path="/about" element={
          <About />
          }/>

        {/* Catch-All: Se não achar nada, volta pra Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;