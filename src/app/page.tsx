"use client";

import { Page } from "@/components/PageLayout";
import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const statement = "Sign in";

  useEffect(() => {
    const autoLogin = async () => {
      setError(null);
      try {
        const res = await fetch("/api/nonce");
        const data: { nonce?: unknown } = await res.json();
        setNonce(typeof data.nonce === "string" ? data.nonce : null);

        const payload = await MiniKit.commandsAsync.walletAuth({
          nonce: typeof data.nonce === "string" ? data.nonce : "",
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
        <h1 className="text-3xl font-bold mb-4">Hola desde CambiaYA3</h1>
        <p className="text-gray-500">Autenticando usuario...</p>
        <div style={{ fontSize: 12, color: "#888", margin: 8 }}>
          <div>
            nonce:{" "}
            {nonce !== null && nonce !== undefined ? String(nonce) : "..."}
          </div>
          <div>statement: {String(statement)}</div>
        </div>
        {typeof user === "object" && user !== null && (
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
