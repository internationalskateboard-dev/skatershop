"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

type WizardPanelProps = {
  step: number;
  current: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

export function WizardPanel({
  step,
  current,
  title,
  description,
  children,
  onClick,
}: WizardPanelProps) {
  const isDone = current > step;
  const isActive = current === step;

  const green = "#00c853";
  const yellow = "#facc15";

  // Colores dinámicos del número/círculo
  const stepColor = isDone ? green : isActive ? yellow : "#6b7280"; // gris 500
  const stepBorder = stepColor;

  return (
    <div className="space-y-3">
      {/* Encabezado */}
      <div
        className={`flex items-center gap-3 cursor-pointer select-none ${
          isActive ? "" : "hover:opacity-80"
        }`}
        onClick={() => {
          if (isDone && onClick) onClick();
        }}
      >
        {/* Círculo del paso con animación */}
        <motion.div
          animate={{
            scale: isActive ? 1.15 : 1,
            borderColor: stepBorder,
            color: stepColor,
          }}
          transition={{ duration: 0.25 }}
          className={`w-8 h-8 flex items-center justify-center rounded-full border text-xs font-semibold`}
          style={{
            borderColor: stepBorder,
            color: stepColor,
          }}
        >
          {isDone ? "✔" : step}
        </motion.div>

        <div>
          <p className="text-sm text-white font-semibold">{title}</p>
          {description && (
            <p className="text-[11px] text-neutral-500">{description}</p>
          )}
        </div>
      </div>

      {/* Contenido del panel con animación */}
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            key={`panel-${step}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className={`border rounded-xl p-5 ${
              isActive
                ? "border-yellow-400 bg-neutral-900"
                : isDone
                ? "border-green-600/40 bg-neutral-900/40"
                : "border-neutral-800 bg-neutral-900/20"
            }`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
