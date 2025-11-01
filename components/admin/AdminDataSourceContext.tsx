"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  LS_DATASOURCE,
  LS_DATASOURCE_MODE,
} from "@/lib/admin/constants";

type DataSource = "api" | "local";
type DataSourceMode = "auto" | "force";

interface AdminDataSourceContextValue {
  source: DataSource;
  setSource: (s: DataSource) => void;
  mode: DataSourceMode;
  setMode: (m: DataSourceMode) => void;
  lastError: string | null;
  setLastError: (err: string | null) => void;
  reportApiSuccess: () => void;
  reportApiError: (msg: string) => void;
}

const AdminDataSourceContext = createContext<AdminDataSourceContextValue | null>(null);

export function AdminDataSourceProvider({ children }: { children: React.ReactNode }) {
  const [source, setSourceState] = useState<DataSource>("api");
  const [mode, setModeState] = useState<DataSourceMode>("auto");
  const [lastError, setLastErrorState] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedSource = window.localStorage.getItem(LS_DATASOURCE) as DataSource | null;
    const savedMode = window.localStorage.getItem(LS_DATASOURCE_MODE) as DataSourceMode | null;
    if (savedSource === "api" || savedSource === "local") {
      setSourceState(savedSource);
    }
    if (savedMode === "auto" || savedMode === "force") {
      setModeState(savedMode);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LS_DATASOURCE, source);
  }, [source]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LS_DATASOURCE_MODE, mode);
  }, [mode]);

  const setSource = useCallback((s: DataSource) => {
    setSourceState(s);
  }, []);

  const setMode = useCallback((m: DataSourceMode) => {
    setModeState(m);
  }, []);

  const setLastError = useCallback((err: string | null) => {
    setLastErrorState(err);
  }, []);

  const reportApiSuccess = useCallback(() => {
    // solo cambiaremos a API si estamos en modo auto
    setLastError(null);
    setSourceState((prev) => (prev === "api" ? prev : "api"));
  }, [setLastError]);

  const reportApiError = useCallback(
    (msg: string) => {
      setLastError(msg);
      setSourceState((prev) => {
        if (mode === "auto") return "local";
        return prev;
      });
    },
    [mode, setLastError]
  );

  return (
    <AdminDataSourceContext.Provider
      value={{
        source,
        setSource,
        mode,
        setMode,
        lastError,
        setLastError,
        reportApiSuccess,
        reportApiError,
      }}
    >
      {children}
    </AdminDataSourceContext.Provider>
  );
}

export function useAdminDataSource() {
  const ctx = useContext(AdminDataSourceContext);
  if (!ctx) {
    throw new Error("useAdminDataSource must be used within AdminDataSourceProvider");
  }
  return ctx;
}
