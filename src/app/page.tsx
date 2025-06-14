"use client";
import React, { useEffect, useState } from "react";
import { MiniKit } from '@worldcoin/minikit-js';

declare global {
  interface Window {
    worldApp?: {
      session?: {
        address?: string;
      };
    };
  }
}

// Parámetros principales
const WLD_TOKEN_ADDRESS = "0x3d8cA8fc8F6eA31d1B95B4e2cF64d40eC0d5f4C0";
const ETHERSCAN_API_KEY = "H59GZM3Q4QTABG6C82EKMGP5EGK2T1ZA1N";
const COP_RATE = 10000;

// Utilidad para formatear el saldo WLD
function formatEth(value: string, decimals = 18) {
  if (!value) return "0";
  const num = BigInt(value);
  const divisor = BigInt(10 ** decimals);
  const whole = num / divisor;
  const fraction = num % divisor;
  return `${whole.toString()}.${fraction
    .toString()
    .padStart(decimals, "0")
    .slice(0, 4)}`;
}

// Detecta la address real desde World App, si existe
function getWorldAppAddress() {
  if (typeof window !== "undefined") {
    // Prueba varios posibles contextos
    if (
      window.worldApp &&
      window.worldApp.session &&
      window.worldApp.session.address
    ) {
      return window.worldApp.session.address;
    }
    // Otros posibles contextos (descomenta si es necesario)
    // if (window.worldID?.address) return window.worldID.address;
    // if (window.siwe?.address) return window.siwe.address;
  }
  return null;
}

const banks = [
  { label: "Nequi", icon: "💸" },
  { label: "Daviplata", icon: "🏦" },
  { label: "Efectivo", icon: "💵" },
  { label: "Achiras", icon: "🌽" },
];

export default function CambiaYA() {
  const [address, setAddress] = useState<string | null>(null);
  const [wldBalance, setWldBalance] = useState<string>("0.00");
  const [wldInput, setWldInput] = useState<string>("");
  const [copValue, setCopValue] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [debugLog, setDebugLog] = useState<string>("");

  // Al montar el componente, busca la address real de World App
  useEffect(() => {
    const authenticate = async () => {
      try {
        setDebugLog('MiniKit: ' + JSON.stringify(MiniKit));
        // Llama a MiniKit.install() si existe
        if (MiniKit.install) {
          setDebugLog(prev => prev + '\nLlamando a MiniKit.install()');
          MiniKit.install();
        }
        // 1. Obtén el nonce del endpoint
        const res = await fetch("/api/nonce");
        const { nonce } = await res.json();

        // 2. Llama a walletAuth con el nonce
        const result = await MiniKit.commandsAsync.walletAuth({
          nonce,
        });
        setDebugLog(prev => prev + '\nResultado de walletAuth: ' + JSON.stringify(result));
        setDebugLog(prev => prev + '\nfinalPayload: ' + JSON.stringify(result?.finalPayload));
        if (result?.finalPayload?.status === 'success') {
          setAddress(result.finalPayload.address);
        } else {
          setAddress(null);
        }
      } catch (e) {
        setDebugLog(prev => prev + '\nError en authenticate: ' + (e instanceof Error ? e.message : String(e)));
        setAddress(null);
      }
    };
    authenticate();
  }, []);

  const fetchBalance = async () => {
    if (!address) return;
    setLoading(true);
    setWldBalance("...");
    const url = `https://api-optimistic.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${WLD_TOKEN_ADDRESS}&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === "1") {
        setWldBalance(formatEth(data.result, 18));
      } else {
        setWldBalance("0.00");
      }
    } catch {
      setWldBalance("Error");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (address) fetchBalance();
    // eslint-disable-next-line
  }, [address]);

  function handleWldInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(",", ".");
    setWldInput(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      setCopValue((num * COP_RATE).toLocaleString("es-CO"));
    } else {
      setCopValue("");
    }
  }

  // Logo WLD svg moderno
  const wldLogo =
    "https://raw.githubusercontent.com/worldcoin/worldcoin-org/main/public/images/logos/wld-token-logo.svg";
  // Azul neón
  const azulGradient =
    "bg-gradient-to-r from-blue-800 via-blue-500 to-cyan-400";

  // Verificación explícita de entorno World App
  const isWorldApp = typeof window !== 'undefined' && !!window.worldApp && !!window.worldApp.session && !!window.worldApp.session.address;

  // Solo si hay address mostramos la UI, si no mostramos mensaje
  if (!isWorldApp) {
    return (
      <div className="text-center mt-12 text-red-600 text-lg">
        Debes abrir esta app desde World App para autenticarte.<br />
        (O aún no se ha recibido la sesión o no estás en el entorno correcto)<br />
        <span className="block mt-4 text-xs text-gray-700 bg-gray-100 p-2 rounded">
          <b>window.worldApp:</b><br />
          {typeof window !== 'undefined' && window.worldApp ? (
            <pre className="text-left whitespace-pre-wrap">{JSON.stringify(window.worldApp, null, 2)}</pre>
          ) : (
            'No existe window.worldApp'
          )}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-blue-50 relative pb-20">
      {/* Header moderno */}
      <header
        className={`${azulGradient} w-full flex items-center px-4 py-4 shadow-lg`}
      >
        <img
          src={wldLogo}
          alt="WLD Logo"
          className="w-12 h-12 rounded-full bg-white p-2 mr-4 shadow"
        />
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
            CambiaYA
          </h1>
          <span className="text-sm text-white/70">
            Convierte WLD a pesos fácil
          </span>
        </div>
      </header>

      {/* Solo si hay address mostramos la UI, si no mostramos mensaje */}
      {!address ? (
        <div className="text-center mt-12 text-red-600 text-lg">
          Debes abrir esta app desde World App para autenticarte.<br />
          (O aún no se ha recibido la sesión o no estás en el entorno correcto)
          <br />
          {/* Bloque de depuración visible solo para pruebas */}
          <div className="mt-4 p-2 bg-gray-100 text-xs text-left text-black rounded break-all">
            <b>Debug log:</b>
            <pre>{debugLog}</pre>
          </div>
        </div>
      ) : (
        <>
          {/* Sección saldo + botón actualizar */}
          <section className="w-full mt-4 px-6">
            <div className="flex items-center justify-between">
              <div className="text-lg text-blue-800/80 font-medium">
                Saldo WLD
              </div>
              <button
                onClick={fetchBalance}
                className="text-xs bg-white/30 backdrop-blur rounded-full px-3 py-1 shadow border border-blue-200 text-blue-600 hover:bg-white/70 active:bg-blue-100"
              >
                {loading ? "Cargando..." : "Actualizar"}
              </button>
            </div>
            <div className="text-5xl font-bold my-2 text-blue-900 tracking-tight">
              {wldBalance}{" "}
              <span className="text-xl font-medium text-blue-500">WLD</span>
            </div>
            <div className="text-gray-400 text-xs mb-3">
              {/* Mostrar la dirección completa */}
              {address}
            </div>
          </section>

          {/* Inputs estilo glassmorphism */}
          <main className="w-full px-6 flex flex-col gap-6 mt-3">
            {/* Cambiar WLD */}
            <div className="rounded-xl p-4 bg-white/70 backdrop-blur shadow border border-blue-100">
              <label className="block text-blue-900 font-bold mb-1">
                ¿Cuánto quieres cambiar?
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  min="0"
                  max={wldBalance}
                  step="0.01"
                  className="flex-1 px-4 py-2 rounded-lg border-2 border-blue-200 bg-white/70 text-blue-900 font-semibold focus:ring-2 focus:ring-blue-400 outline-none text-lg"
                  placeholder="0.00"
                  value={wldInput}
                  onChange={handleWldInput}
                />
                <img
                  src={wldLogo}
                  alt="WLD"
                  className="w-7 h-7 bg-white rounded-full border border-blue-100"
                />
              </div>
              <button
                className="text-xs text-cyan-700 underline mb-1 hover:text-blue-500"
                onClick={() => {
                  setWldInput(wldBalance);
                  setCopValue(
                    (parseFloat(wldBalance) * COP_RATE).toLocaleString("es-CO")
                  );
                }}
              >
                Usar todo mi saldo
              </button>
            </div>

            {/* Recibir en COP */}
            <div className="rounded-xl p-4 bg-white/70 backdrop-blur shadow border border-blue-100">
              <label className="block text-blue-900 font-bold mb-1">
                Recibes en pesos
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={copValue}
                  readOnly
                  className="flex-1 px-4 py-2 rounded-lg border-2 border-blue-200 bg-white/70 text-blue-900 font-semibold outline-none text-lg"
                  placeholder="$ 0"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Colombia.svg"
                  alt="COP"
                  className="w-7 h-7 rounded-full border border-blue-100"
                />
              </div>
              <div className="text-xs text-blue-400 mt-1">
                Tasa estimada: ${COP_RATE.toLocaleString("es-CO")} COP / 1 WLD
              </div>
            </div>

            {/* Métodos de pago como chips */}
            <div className="rounded-xl p-4 bg-white/70 backdrop-blur shadow border border-blue-100">
              <label className="block text-blue-900 font-bold mb-1">
                Método de pago
              </label>
              <div className="flex gap-2 flex-wrap">
                {banks.map((bank) => (
                  <button
                    key={bank.label}
                    onClick={() => setSelectedBank(bank.label)}
                    className={`px-4 py-2 rounded-full border-2 transition text-base font-semibold flex items-center gap-1 
                  ${
                    selectedBank === bank.label
                      ? "bg-blue-600 text-white border-blue-700 shadow"
                      : "bg-white/80 text-blue-700 border-blue-200 hover:bg-blue-100"
                  }
                `}
                  >
                    <span className="text-lg">{bank.icon}</span>
                    {bank.label}
                  </button>
                ))}
              </div>
            </div>
          </main>
        </>
      )}

      {/* Footer súper minimalista */}
      <footer className="fixed bottom-0 left-0 w-full py-2 bg-white/80 backdrop-blur border-t border-blue-100 flex items-center justify-center gap-8 text-blue-800 font-medium shadow-sm z-50">
        <span className="hover:text-cyan-700 transition cursor-pointer">
          Historial
        </span>
        <span className="hover:text-cyan-700 transition cursor-pointer">
          Inicio
        </span>
        <span className="hover:text-cyan-700 transition cursor-pointer">
          Ayuda
        </span>
      </footer>
    </div>
  );
}
