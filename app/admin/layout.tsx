import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";

export const metadata = {
  title: "Admin | SkaterShop",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLogged, loading } = useAdminAuth();

  // Mientras carga la sesión → no mostrar el dashboard vacío
  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  // Si no está logueado → redirect
  if (!isLogged) {
    redirect("/admin/login");
  }

  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
