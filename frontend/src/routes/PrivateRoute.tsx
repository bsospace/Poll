import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@/lib/Constants';
import { useAuth } from '@/hooks/UseAuth';
import { PageLayout } from '@/components/layouts/PageLayout';
import { useMemo, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function PrivateRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  const shouldRedirect = useMemo(() => !isAuthenticated && !isLoading, [isAuthenticated, isLoading]);

  // Save the current path when redirecting to login, but only if not coming from logout
  useEffect(() => {
    if (shouldRedirect) {
      // Check if this redirect is happening because of a logout
      const isLogout = sessionStorage.getItem('isLogout') === 'true';
      
      if (!isLogout) {
        localStorage.setItem('redirectPath', location.pathname + location.search);
      } else {
        // Clear the flag after using it
        sessionStorage.removeItem('isLogout');
      }
    }
  }, [shouldRedirect, location]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='w-12 h-12 animate-spin' />
      </div>
    );
  }

  if (shouldRedirect || !user?.isGuest) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <PageLayout>
      <Outlet />
    </PageLayout>
  );
}