// lib/admin/types.ts
// Reexporta los tipos base del proyecto (lib/types.ts)
// para que el panel de admin use los mismos sin duplicar.

export * from "@/lib/types";

// Tipos auxiliares solo para el admin.
export type AdminDataSource = "auto" |"db" |"api" | "local";
export type AdminDataMode = "auto" | "force";
