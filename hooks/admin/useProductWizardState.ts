// hooks/admin/useProductWizardState.ts
"use client";

import { useState } from "react";

export type WizardBaseData = {
  productId?: number;
  name: string;
  slug: string;
  price: string;
  desc: string;
  details: string;
  productTypeId: number | null;
  categoryId: number | null;
};

export type WizardVariantDraft = {
  colorId: number;
  sizeId: number;
  stock: number;
};

export type WizardStep = 1 | 2 | 3 | 4;

type UseProductWizardStateResult = {
  step: WizardStep;
  setStep: (s: WizardStep) => void;
  baseData: WizardBaseData;
  updateBaseData: (patch: Partial<WizardBaseData>) => void;
  setBaseFromServer: (payload: { id: number; name: string; slug: string }) => void;
  variants: WizardVariantDraft[];
  setVariants: (vs: WizardVariantDraft[]) => void;
};

const initialBase: WizardBaseData = {
  productId: undefined,
  name: "",
  slug: "",
  price: "",
  desc: "",
  details: "",
  productTypeId: null,
  categoryId: null,
};

export function useProductWizardState(): UseProductWizardStateResult {
  const [step, setStep] = useState<WizardStep>(1);
  const [baseData, setBaseData] = useState<WizardBaseData>(initialBase);
  const [variants, setVariants] = useState<WizardVariantDraft[]>([]);

  function updateBaseData(patch: Partial<WizardBaseData>) {
    setBaseData((prev) => ({ ...prev, ...patch }));
  }

  function setBaseFromServer(payload: { id: number; name: string; slug: string }) {
    setBaseData((prev) => ({
      ...prev,
      productId: payload.id,
      name: payload.name,
      slug: payload.slug,
    }));
  }

  return {
    step,
    setStep,
    baseData,
    updateBaseData,
    setBaseFromServer,
    variants,
    setVariants,
  };
}
