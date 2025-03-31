"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

export default function InstanceModal({ open, onClose, onStatusUpdate }) {
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState("verificando...");
  const tentativas = useRef(0);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    const fetchQRCode = async () => {
      const res = await fetch("/api/conectar");
      const data = await res.json();
      setQrCode(data.code);
    };

    const verificarStatus = async () => {
      const res = await fetch("/api/status");
      const data = await res.json();

      if (data.state === "open") {
        onStatusUpdate(data);
        onClose();
        return;
      }

      tentativas.current += 1;
      setStatus(data.state);

      if (tentativas.current >= 5) {
        await fetch("/api/logout", { method: "DELETE" });
        localStorage.removeItem("logged");
        router.push("/login");
      }
    };

    fetchQRCode();
    const interval = setInterval(verificarStatus, 15000);
    return () => clearInterval(interval);
  }, [open]);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "DELETE" });
      localStorage.removeItem("logged");
      onClose();
      router.replace("/login");
    } catch (err) {
      console.error("Erro ao sair:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="text-center max-w-2xl bg-card text-card-foreground border-4 border-border dark:border-white p-8 rounded-xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Conectar Instância
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm mb-4">
          Status atual:{" "}
          <strong>
            {status === "close"
              ? "Desconectado"
              : status === "open"
              ? "Conectado"
              : status === "connecting"
              ? "Conectando..."
              : "Verificando..."}
          </strong>
        </p>

        {qrCode ? (
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg shadow-md border border-gray-300">
              <QRCodeCanvas value={qrCode} size={400} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Carregando QR Code...</p>
        )}

        <button
          onClick={handleLogout}
          className="mt-6 bg-destructive text-white px-6 py-2 rounded hover:bg-red-700 transition-all"
        >
          Sair
        </button>
      </DialogContent>
    </Dialog>
  );
}
