// components/admin/ui/ConfirmModal.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Fondo oscuro */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Tarjeta */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 170, damping: 15 }}
            className="relative bg-neutral-900 border border-neutral-700 rounded-xl p-6 w-[390px] shadow-2xl"
          >
            <h3 className="text-lg text-white font-bold">{title}</h3>
            <p className="text-sm text-neutral-400 mt-2">{message}</p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 hover:border-neutral-500 transition disabled:opacity-40"
              >
                {cancelLabel}
              </button>

              <button
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 text-sm bg-red-500 text-black font-bold rounded-lg 
                hover:bg-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <span className="w-3 h-3 rounded-full border-2 border-black border-t-transparent animate-spin" />
                )}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
