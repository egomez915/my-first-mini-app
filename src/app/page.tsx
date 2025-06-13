"use client";

import { Page } from "@/components/PageLayout";
import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Login automático al cargar la página
    const autoLogin = async () => {
      setError(null);
      try {
        // 1. Obtener el nonce
        const res = await fetch("/api/nonce");
        const { nonce } = await res.json();

        // 2. Autenticar con Worldcoin usando el método estático
        const payload = await MiniKit.commandsAsync.walletAuth({
          nonce,
          statement: "Sign in to CambiaYA",
        });

        setUser(payload);
      } catch (err) {
        setError(
          typeof err === "object" && err !== null && "message" in err
            ? String((err as { message?: unknown }).message)
            : "Error en autenticación"
        );
      }
    };

    autoLogin();
  }, []);

  return (
    <Page>
      <Page.Main className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Hola desde CambiaYA</h1>
        {user ? (
          <div>
            <p className="text-green-600 font-semibold mb-2">
              ¡Autenticado correctamente!
            </p>
            <pre className="text-xs">{JSON.stringify(user, null, 2)}</pre>
          </div>
        ) : (
          <p className="text-gray-500">Autenticando usuario...</p>
        )}
        {error && <p className="text-red-600 mt-4">{error}</p>}
      </Page.Main>
    </Page>
  );
}
