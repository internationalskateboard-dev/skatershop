// app/admin/layout.tsx
'use client';

import { ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLogged, loading } = useAdminAuth();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  // Si es la página de login, mostrar siempre el contenido
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Para otras rutas admin, verificar autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!isLogged) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">No autorizado - Redirigiendo al login...</div>
      </div>
    );
  }

  return <>{children}</>;
}