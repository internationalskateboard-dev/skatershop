"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  LS_DATASOURCE,
  LS_DATASOURCE_MODE,
} from "@/lib/admin/constants";

type DataSource = "api" | "local";
type DataSourceMode = "auto" | "force";

type AdminDataSourceContextValue = {
  // estado
  source: DataSource;
  mode: DataSourceMode;
  lastError: string | null;

  // setters
  setSource: (s: DataSource) => void;
  setMode: (m: DataSourceMode) => void;
  setLastError: (err: string | null) => void;

  // helpers para los componentes que pegan a la API
  reportApiSuccess: () => void;
  reportApiError: (msg: string) => void;
};

const AdminDataSourceContext = createContext<AdminDataSourceContextValue | null>(
  null
);

export function AdminDataSourceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [source, setSourceState] = useState<DataSource>("api");
  const [mode, setModeState] = useState<DataSourceMode>("auto");
  const [lastError, setLastErrorState] = useState<string | null>(null);

  //
  // 1) cargar de localStorage
  //
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedSource = window.localStorage.getItem(LS_DATASOURCE);
    const savedMode = window.localStorage.getItem(LS_DATASOURCE_MODE);

    if (savedSource === "api" || savedSource === "local") {
      setSourceState(savedSource);
    }
    if (savedMode === "auto" || savedMode === "force") {
      setModeState(savedMode);
    }
  }, []);

  //
  // 2) persistir cambios
  //
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LS_DATASOURCE, source);
  }, [source]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LS_DATASOURCE_MODE, mode);
  }, [mode]);

  //
  // 3) setters públicos
  //
  const setSource = useCallback((s: DataSource) => {
    setSourceState(s);
  }, []);

  const setMode = useCallback((m: DataSourceMode) => {
    setModeState(m);
  }, []);

  const setLastError = useCallback((err: string | null) => {
    setLastErrorState(err);
  }, []);

  //
  // 4) helpers: para que los componentes no tengan que saber si estamos en auto/force
  //
  const reportApiSuccess = useCallback(() => {
    // Si la API responde, limpiamos error
    setLastErrorState(null);

    // Si estamos en auto y alguien había forzado a local por error de API,
    // podemos volver a API.
    setSourceState((prev) => {
      if (mode === "auto") {
        return "api";
      }
      return prev;
    });
  }, [mode]);

  const reportApiError = useCallback(
    (msg: string) => {
      setLastErrorState(msg);

      // Solo en modo AUTO cambiamos de fuente
      setSourceState((prev) => {
        if (mode === "auto") {
          return "local";
        }
        return prev;
      });
    },
    [mode]
  );

  const value: AdminDataSourceContextValue = {
    source,
    mode,
    lastError,
    setSource,
    setMode,
    setLastError,
    reportApiSuccess,
    reportApiError,
  };

  return (
    <AdminDataSourceContext.Provider value={value}>
      {children}
    </AdminDataSourceContext.Provider>
  );
}

export function useAdminDataSource() {
  const ctx = useContext(AdminDataSourceContext);
  if (!ctx) {
    throw new Error(
      "useAdminDataSource debe usarse dentro de <AdminDataSourceProvider>"
    );
  }
  return ctx;
}
