// ============================================
// PROTECTED ROUTE — Guards private pages
// ============================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';
import { selectIsAuthenticated } from '../features/auth/store/authSlice';
import { ROUTES } from './routeConstants';

interface Props {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute = ({ children, redirectTo = ROUTES.LOGIN }: Props) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
