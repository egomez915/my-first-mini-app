"use client";

import { Page } from "@/components/PageLayout";
import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<any>(null); // <- Cambiamos temporalmente a any para facilitar el renderizado
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const statement = "Sign in";

  useEffect(() => {
    // Login automático al cargar la página
    const autoLogin = async () => {
      setError(null);
      try {
        // 1. Obtener el nonce
        const res = await fetch("/api/nonce");
        const data = await res.json();
        setNonce(data.nonce);

        // 2. Autenticar con Worldcoin usando el método estático
        const payload = await MiniKit.commandsAsync.walletAuth({
          nonce: data.nonce,
          statement,
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
        <h1 className="text-3xl font-bold mb-4">Hola desde CambiaYA2</h1>
        <p className="text-gray-500">Autenticando usuario...</p>
        {/* Mostramos datos útiles */}
        <div style={{ fontSize: 12, color: "#888", margin: 8 }}>
          <div>nonce: {nonce || "..."}</div>
          <div>statement: {statement}</div>
        </div>
        {user && (
          <div>
            <p className="text-green-600 font-semibold mb-2">
              ¡Autenticado correctamente!
            </p>
            <pre className="text-xs">{JSON.stringify(user, null, 2)}</pre>
          </div>
        )}
        {error && <p className="text-red-600 mt-4">{error}</p>}
      </Page.Main>
    </Page>
  );
}
