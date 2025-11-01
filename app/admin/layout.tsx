// app/admin/layout.tsx
import type { ReactNode } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";

export const metadata = {
  title: "Admin | SkaterShop",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
