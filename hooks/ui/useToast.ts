import { useState } from "react";

export function useToast() {
  const [toast, setToast] = useState({
    show: false,
    kind: "success" as "success" | "error",
    text: "",
  });

  const showToast = (kind: "success" | "error", text: string, ms = 2200) => {
    setToast({ show: true, kind, text });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), ms);
  };

  return { toast, showToast };
}
