'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, logout } from "@/lib/auth";
import TopBar from "@/components/TopBar";
import ContactList from "@/components/ContactList";
import MessageForm from "@/components/MessageForm";
import InstanceModal from "@/components/InstanceModal";

export default function DashboardPage() {
  const router = useRouter();
  const [contatos, setContatos] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [status, setStatus] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);
  const [syncInfo, setSyncInfo] = useState("");
  const [dataAgendamento, setDataAgendamento] = useState("");
  const [horaAgendamento, setHoraAgendamento] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) return router.push("/login");
    console.log("[Dashboard] Verificando status da instância...");
    verificarStatus();
    carregarContatos();
  }, []);

  async function verificarStatus() {
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      setStatus(data);
      if (data.state !== "open") {
        setModalAberto(true);
      }
    } catch (err) {
      console.error("Erro ao verificar status:", err);
      logout();
      router.push("/login");
    }
  }

  async function carregarContatos() {
    try {
      const res = await fetch("/api/contatos");
      const data = await res.json();
      setContatos(data);
    } catch (err) {
      console.error("Erro ao carregar contatos:", err);
    }
  }

  async function sincronizarContatos() {
    if (status?.state !== "open") return alert("Instância não está conectada.");
    setLoadingSync(true);
    setSyncInfo("");

    const inicio = performance.now();

    try {
      const res = await fetch("/api/sincronizar", { method: "POST" });
      const data = await res.json();
      await carregarContatos();

      const fim = performance.now();
      const duracao = ((fim - inicio) / 1000).toFixed(1);
      const total = data?.total || 0;

      setSyncInfo(`${total} contatos em ${duracao}s`);
    } catch (err) {
      console.error("[Dashboard] Erro ao sincronizar:", err);
      setSyncInfo("Erro ao sincronizar");
    } finally {
      setLoadingSync(false);
    }
  }

  async function agendarCampanha() {
    if (!mensagem || selecionados.length === 0) return alert("Preencha a mensagem e selecione os contatos.");
    if (!dataAgendamento || !horaAgendamento) return alert("Escolha a data e a hora do agendamento.");

    const agendado_em = `${dataAgendamento}T${horaAgendamento}:00.000Z`;

    const campanha = {
      mensagem,
      contatos: selecionados,
      agendado_em
    };

    const res = await fetch("/api/agendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(campanha)
    });

    const data = await res.json();
    if (data.error) {
      alert("Erro ao agendar a campanha");
    } else {
      alert("Campanha agendada com sucesso!");
      setMensagem("");
      setSelecionados([]);
      setDataAgendamento("");
      setHoraAgendamento("");
    }
  }

  async function enviarMensagem() {
    if (!mensagem || selecionados.length === 0)
      return alert("Preencha a mensagem e selecione contatos.");
    if (status?.state !== "open") return alert("Instância não conectada.");

    for (const id of selecionados) {
      const contato = contatos.find((c) => c.id === id);
      try {
        await fetch("/api/enviar-texto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ number: contato.numero, text: mensagem }),
        });
        await new Promise((r) => setTimeout(r, Math.random() * 5000 + 5000));
      } catch (err) {
        console.error("Erro ao enviar mensagem para", contato.numero);
      }
    }
    alert("Mensagens enviadas.");
    setMensagem("");
  }

  return (
    <div className="p-4 bg-card text-card-foreground rounded-lg shadow transition-colors duration-300">
      <TopBar
        status={status}
        onSync={sincronizarContatos}
        onLogout={() => {
          logout();
          router.push("/login");
        }}
        loading={loadingSync}
        syncInfo={syncInfo}
      />

      <InstanceModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onStatusUpdate={(newStatus) => {
          setStatus(newStatus);
          setModalAberto(false);
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg font-bold mb-2">Painel de Envio</h2>
          <MessageForm
            contatos={contatos}
            contatosSelecionados={selecionados}
            onSelecionadosChange={setSelecionados}
          />
        </div>

        <div>
          <h2 className="text-lg font-bold mb-2">Contatos</h2>
          <div className="max-h-[500px] overflow-y-auto border rounded p-2 bg-card text-card-foreground shadow-sm">
            <ContactList
              contatos={contatos}
              onSelecionadosChange={setSelecionados}
            />
          </div>
        </div>
      </div>
    </div>
  );
}