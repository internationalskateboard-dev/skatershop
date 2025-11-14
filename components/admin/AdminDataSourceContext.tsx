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

type DataSource = "db" | "api" | "local";
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

// 🔹 Valor por defecto seguro (para cuando NO hay provider)
const defaultValue: AdminDataSourceContextValue = {
  source: "db",
  mode: "auto",
  lastError: null,
  setSource: () => {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[AdminDataSourceContext] setSource llamado sin Provider, usando valor por defecto"
      );
    }
  },
  setMode: () => {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[AdminDataSourceContext] setMode llamado sin Provider, usando valor por defecto"
      );
    }
  },
  setLastError: () => {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[AdminDataSourceContext] setLastError llamado sin Provider, usando valor por defecto"
      );
    }
  },
  reportApiSuccess: () => {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[AdminDataSourceContext] reportApiSuccess llamado sin Provider"
      );
    }
  },
  reportApiError: () => {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[AdminDataSourceContext] reportApiError llamado sin Provider"
      );
    }
  },
};

const AdminDataSourceContext =
  createContext<AdminDataSourceContextValue>(defaultValue);

export function AdminDataSourceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [source, setSourceState] = useState<DataSource>("db");
  const [mode, setModeState] = useState<DataSourceMode>("auto");
  const [lastError, setLastErrorState] = useState<string | null>(null);

  //
  // 1) cargar de localStorage
  //
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedSource = window.localStorage.getItem(LS_DATASOURCE);
    const savedMode = window.localStorage.getItem(LS_DATASOURCE_MODE);

    if (
      savedSource === "api" ||
      savedSource === "local" ||
      savedSource === "db"
    ) {
      setSourceState(savedSource as DataSource);
    }

    if (savedMode === "auto" || savedMode === "force") {
      setModeState(savedMode as DataSourceMode);
    }
  }, []);

  //
  // 2) persistir cambios
  //
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LS_DATASOURCE, source);
    } catch (err) {
      console.warn("[AdminDataSourceContext] Error guardando source en LS", err);
    }
  }, [source]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LS_DATASOURCE_MODE, mode);
    } catch (err) {
      console.warn("[AdminDataSourceContext] Error guardando mode en LS", err);
    }
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

    // En modo AUTO: volvemos a "db" (BD) como fuente principal
    setSourceState((prev) => {
      if (mode === "auto") {
        return "db";
      }
      return prev;
    });
  }, [mode]);

  const reportApiError = useCallback(
    (msg: string) => {
      setLastErrorState(msg);

      // Solo en modo AUTO cambiamos de fuente a local
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
  // 👇 Ya no lanzamos error, devolvemos siempre un contexto válido
  const ctx = useContext(AdminDataSourceContext);
  return ctx;
}
