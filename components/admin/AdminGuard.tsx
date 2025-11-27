// components/admin/AdminGuard.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";

type Props = {
  children: React.ReactNode;
};

export default function AdminGuard({ children }: Props) {
  const { isLogged, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLogged) {
      router.replace("/admin/login");
    }
  }, [loading, isLogged, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-200">
        <p className="text-sm text-neutral-400">Verificando sesión de administrador...</p>
      </div>
    );
  }

  if (!isLogged) {
    // mientras redirige
    return null;
  }

  return <>{children}</>;
}
