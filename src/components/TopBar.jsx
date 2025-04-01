"use client";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { FiCheckCircle, FiAlertCircle, FiLoader, FiRefreshCw, FiLogOut, FiInfo } from "react-icons/fi";
import { Tooltip } from "@/components/ui/tooltip";

export default function TopBar({ status, onSync, onLogout, loading, syncInfo }) {
  const [envios, setEnvios] = useState({ total: 0, limite: process.env.NEXT_PUBLIC_ZAP_LIMITE || 100 });
  const [porcentagem, setPorcentagem] = useState(0);

  // Estados de conexão
  const conectado = status?.state === "open";
  const aguardando = status?.state === "close";
  const erro = status?.state === "error";

  // Calcula porcentagem sempre que envios ou limite mudam
  useEffect(() => {
    const calcularPorcentagem = () => {
      const limite = Number(envios.limite) || 100;
      const total = Number(envios.total) || 0;
      const porcentagemCalculada = Math.min(100, (total / limite) * 100);
      setPorcentagem(Math.round(porcentagemCalculada));
    };

    calcularPorcentagem();
  }, [envios.total, envios.limite]);

  // Busca os envios periodicamente
  useEffect(() => {
    const buscarEnviosPeriodicamente = async () => {
      try {
        const res = await fetch("/api/envios-hoje");
        const data = await res.json();
        
        setEnvios(prev => ({
          total: data.total || 0,
          limite: process.env.NEXT_PUBLIC_ZAP_LIMITE || prev.limite
        }));
      } catch (err) {
        console.error("Erro ao buscar envios:", err);
      }
    };

    buscarEnviosPeriodicamente();
    const interval = setInterval(buscarEnviosPeriodicamente, 300000);

    return () => clearInterval(interval);
  }, []);

  // Componente de status dinâmico com tooltip
  const StatusConexao = () => {
    const config = {
      conectado: { 
        icone: <FiCheckCircle className="w-5 h-5" />,
        texto: "Conectado",
        cor: "text-green-500",
        tooltip: "Conexão ativa com o WhatsApp"
      },
      aguardando: {
        icone: <FiLoader className="animate-spin w-5 h-5" />,
        texto: "Aguardando Conexão",
        cor: "text-yellow-500",
        tooltip: "Aguardando conexão com o WhatsApp"
      },
      erro: {
        icone: <FiAlertCircle className="w-5 h-5" />,
        texto: "Erro na Instância",
        cor: "text-red-500",
        tooltip: "Problema na conexão com o WhatsApp"
      },
      default: {
        icone: <FiLoader className="animate-pulse w-5 h-5" />,
        texto: "Verificando...",
        cor: "text-gray-500",
        tooltip: "Verificando status da conexão"
      }
    };

    const estado = conectado ? "conectado" : 
                 aguardando ? "aguardando" : 
                 erro ? "erro" : "default";

    return (
      <Tooltip content={config[estado].tooltip} position="bottom">
        <div className={`flex items-center gap-2 ${config[estado].cor} cursor-help`}>
          {config[estado].icone}
          <span className="font-medium">{config[estado].texto}</span>
        </div>
      </Tooltip>
    );
  };

  return (
    <div className="flex flex-col gap-4 mb-6 border-b border-border pb-4">
      {/* Linha superior */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <StatusConexao />
          
          <Tooltip 
            content={!conectado ? "Conecte-se para sincronizar" : "Atualizar lista de contatos"} 
            position="bottom"
          >
            <button
              onClick={onSync}
              disabled={!conectado || loading}
              className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-all
                ${!conectado || loading 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800" 
                  : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"}`}
            >
              {loading ? (
                <>
                  <FiRefreshCw className="animate-spin w-4 h-4" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <FiRefreshCw className="w-4 h-4" />
                  Sincronizar Contatos
                </>
              )}
            </button>
          </Tooltip>

          {syncInfo && (
            <Tooltip content="Última sincronização realizada" position="bottom">
              <div className="px-3 py-1.5 bg-green-100 text-green-800 rounded-md text-sm dark:bg-green-900/30 dark:text-green-300">
                {syncInfo}
              </div>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Tooltip content="Alternar tema" position="bottom">
            <div>
              <ThemeToggle />
            </div>
          </Tooltip>
          
          <Tooltip content="Sair do sistema" position="bottom">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-md text-sm
                        hover:bg-red-200 transition-colors dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/50"
            >
              <FiLogOut className="w-4 h-4" />
              Sair
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="w-full relative">
        <div className="flex justify-between text-sm mb-1">
          <span>Limite de Mensagens Diárias</span>
          <span>{porcentagem}% Utilizado</span>
        </div>
        
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
          <div
            className={`h-full bg-gradient-to-r transition-all duration-500 ${
              porcentagem >= 90 ? 'from-red-500 to-red-400' :
              porcentagem >= 75 ? 'from-yellow-500 to-yellow-400' :
              'from-blue-500 to-blue-400'
            }`}
            style={{ width: `${porcentagem}%` }}
          />
        </div>
        
        <Tooltip content={`${envios.limite - envios.total} mensagens restantes hoje`} position="bottom">
          <div className="flex justify-between text-sm mt-1 text-gray-500 dark:text-gray-400">
            <span>
              <FiInfo className="inline mr-1" />
              {envios.total} mensagens enviadas-
            </span>
            
            <span>Limite: {envios.limite}</span>
          </div>
        </Tooltip>
      </div>
    </div>
  );
}