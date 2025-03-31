"use client";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function TopBar({
  status,
  onSync,
  onLogout,
  loading,
  syncInfo,
}) {
  const [envios, setEnvios] = useState(null);

  const conectado = status?.state === "open";
  const aguardando = status?.state === "close";
  const erro = status?.state === "error";

  const getStatusColor = () => {
    if (conectado) return "text-green-500 dark:text-green-400";
    if (aguardando) return "text-yellow-500 dark:text-yellow-400";
    if (erro) return "text-red-500 dark:text-red-400";
    return "text-gray-500 dark:text-gray-400";
  };

  const getStatusTexto = () => {
    if (conectado) return "🟢 Conectado";
    if (aguardando) return "🟡 Aguardando Conexão";
    if (erro) return "🔴 Erro na Instância";
    return "⏳ Verificando...";
  };

  useEffect(() => {
    fetchEnvios();
  }, []);

  async function fetchEnvios() {
    try {
      const res = await fetch("/api/envios-hoje");
      const data = await res.json();
      setEnvios(data);
    } catch (err) {
      console.error("Erro ao buscar envios:", err);
    }
  }

  return (
    <div className="flex flex-col gap-4 mb-6 border-b border-border pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className={`font-semibold ${getStatusColor()}`}>
            {getStatusTexto()}
          </p>

          <button
            onClick={onSync}
            disabled={!conectado || loading}
            className={`px-3 py-1 rounded text-sm flex items-center gap-1 transition-all ${
              conectado && !loading
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Sincronizando...
              </>
            ) : (
              <>🔄 Sincronizar Contatos</>
            )}
          </button>

          {syncInfo && (
            <span className="text-sm italic text-muted-foreground">
              ✅ {syncInfo}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-all"
          >
            🚪 Sair
          </button>
        </div>
      </div>

      {envios && (
        <div className="w-full mt-2 h-4 relative bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
          <div
            className="absolute inset-0 flex items-center justify-center text-[11px] font-medium z-10"
            style={{ color: envios.porcentagem < 15 ? "#000" : "#fff" }}
          >
            {envios.total} / {envios.limite} mensagens enviadas (
            {envios.porcentagem}%)
          </div>

          <div
            className="h-full bg-green-600 transition-all duration-300"
            style={{ width: `${envios.porcentagem}%` }}
          />
        </div>
      )}
    </div>
  );
}
