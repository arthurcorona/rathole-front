import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Suggestions from './pages/Suggestions';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import About from './pages/About';
import AdminEditPost from './pages/admin/AdminEditPost';
import Prime from './pages/Prime';
import PrimeOsint from './pages/PrimeOsint';
import PrimeOsintCase from './pages/PrimeOsintCase';
import PrimeOsintTarget from './pages/PrimeOsintTarget';
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/suggestions" element={<Suggestions />} />
        <Route path="/posts/:slug" element={<PostDetail />} />
        {/* Prime (área de membros): a própria página mostra a landing para quem não é membro */}
        <Route path="/prime" element={<Prime />} />
        {/* Painel OSINT (ponte para o ratosint): fase de teste, só admin */}
        <Route
          path="/prime/osint"
          element={
            <AdminRoute>
              <PrimeOsint />
            </AdminRoute>
          }
        />
        <Route
          path="/prime/osint/casos/:caseId"
          element={
            <AdminRoute>
              <PrimeOsintCase />
            </AdminRoute>
          }
        />
        <Route
          path="/prime/osint/alvos/:targetId"
          element={
            <AdminRoute>
              <PrimeOsintTarget />
            </AdminRoute>
          }
        />

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

        <Route 
          path="/admin/posts/edit/:id" 
          element={
            <AdminRoute>
              <AdminEditPost />
            </AdminRoute>
          }/>

        {/* Catch-All: Se não achar nada, volta pra Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;