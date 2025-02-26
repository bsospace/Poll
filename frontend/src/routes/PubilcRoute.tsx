import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '@/lib/Constants';
import { useAuth } from '@/hooks/UseAuth';
import { AuthLayout } from '@/components/layouts/AuthLayout';

export function PublicRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}