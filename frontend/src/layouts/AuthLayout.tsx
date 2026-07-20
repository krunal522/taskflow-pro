// Layouts — AuthLayout (for login/register pages)
import { Outlet, Navigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { selectIsAuthenticated } from '../features/auth/store/authSlice';
import { ROUTES } from '../routes/routeConstants';

const AuthLayout = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return <Outlet />;
};

export default AuthLayout;
