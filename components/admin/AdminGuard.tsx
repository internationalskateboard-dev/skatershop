"use client";

import { useEffect, useState } from "react";

const ADMIN_PASS = "skateradmin";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [passInput, setPassInput] = useState("");

  useEffect(() => {
    const ok = sessionStorage.getItem("skater-admin-ok");
    if (ok === "yes") setAuthed(true);
  }, []);

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (passInput === ADMIN_PASS) {
      setAuthed(true);
      sessionStorage.setItem("skater-admin-ok", "yes");
    } else {
      alert("Clave incorrecta");
    }
  }

  if (!authed) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-sm mx-auto mt-10 text-white space-y-4">
        <h1 className="text-xl font-bold">Admin / SkaterStore</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <label className="block text-sm">
            <span className="text-neutral-300">Clave de administrador</span>
            <input
              type="password"
              className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
            />
          </label>

          <button
            type="submit"
            className="bg-yellow-400 text-black font-bold text-xs py-2 px-4 rounded-lg hover:bg-yellow-300 active:scale-95 transition uppercase tracking-wide w-full"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
