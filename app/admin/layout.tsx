// app/admin/layout.tsx
'use client';

import { ReactNode } from 'react';
import { useAdminAuth } from '@/lib/admin/useAdminAuth';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLogged, loading } = useAdminAuth();

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
        <div className="text-lg">No autorizado</div>
      </div>
    );
  }

  return <>{children}</>;
}