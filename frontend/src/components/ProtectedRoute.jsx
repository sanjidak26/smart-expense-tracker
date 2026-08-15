import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Route guard component that forces users to authenticate before accessing child routes
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 gap-4">
        <div className="relative flex items-center justify-center">
          {/* Pulsing decorative circles */}
          <div className="absolute w-20 h-20 bg-brand-500/20 rounded-full animate-ping duration-1000" />
          <div className="absolute w-14 h-14 bg-brand-500/30 rounded-full animate-pulse" />
          
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin z-10" />
        </div>
        <div className="text-sm font-semibold tracking-wide bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent animate-pulse">
          Securing session...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
