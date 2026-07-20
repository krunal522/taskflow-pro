// ============================================
// APP ROUTES — Central routing config (lazy loaded)
// ============================================

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { selectIsAuthenticated } from '../features/auth/store/authSlice';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES } from './routeConstants';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Lazy loaded pages — code splitting for performance
const LandingPage  = lazy(() => import('../pages/LandingPage'));
const LoginPage    = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const Dashboard    = lazy(() => import('../pages/Dashboard'));
const ProfilePage  = lazy(() => import('../pages/Profile/ProfilePage'));
const NotFoundPage = lazy(() => import('../pages/NotFound/NotFoundPage'));

const PageLoader = () => (
  <div className="loader-container">
    <div className="spinner" />
  </div>
);

// Public only route (redirect to dashboard if already logged in)
const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  return isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <>{children}</>;
};

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Landing — always public */}
      <Route path={ROUTES.HOME} element={<LandingPage />} />

      {/* Auth routes — redirect if logged in */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={
          <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>
        } />
        <Route path={ROUTES.REGISTER} element={
          <PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>
        } />
      </Route>

      {/* Protected routes — redirect to login if not authenticated */}
      <Route element={
        <ProtectedRoute><MainLayout /></ProtectedRoute>
      }>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.PROFILE}   element={<ProfilePage />} />
      </Route>

      {/* 404 fallback */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
