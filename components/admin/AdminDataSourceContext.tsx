// components/admin/AdminDataSourceContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

export type AdminDataSource = "api" | "local";

type AdminDataSourceCtx = {
  source: AdminDataSource;
  setSource: Dispatch<SetStateAction<AdminDataSource>>;
  lastError: string | null;
  setLastError: Dispatch<SetStateAction<string | null>>;
};

const Ctx = createContext<AdminDataSourceCtx | null>(null);

export function AdminDataSourceProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState<AdminDataSource>("local");
  const [lastError, setLastError] = useState<string | null>(null);

  return (
    <Ctx.Provider value={{ source, setSource, lastError, setLastError }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdminDataSource() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error(
      "useAdminDataSource debe usarse dentro de <AdminDataSourceProvider>"
    );
  }
  return ctx;
}
