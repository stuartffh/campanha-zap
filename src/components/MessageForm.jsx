'use client';
import { useState } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { FaRegSmile, FaTrashAlt, FaPaperclip } from 'react-icons/fa';

export default function MessageForm({ contatos, contatosSelecionados }) {
  const [mensagem, setMensagem] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mostrarEmoji, setMostrarEmoji] = useState(false);
  const [logs, setLogs] = useState([]);
  const [executandoCampanha, setExecutandoCampanha] = useState(false);

  const handleEmoji = (e) => setMensagem(mensagem + e.native);

  const base64FromFile = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const delayRandom = () => new Promise(r => setTimeout(r, Math.random() * 5000 + 5000));

  const addLog = (logMessage) => {
    setLogs((prevLogs) => {
      const newLogs = [logMessage, ...prevLogs];
      return newLogs.slice(0, 50);
    });
  };

  const enviarCampanha = async () => {
    if (!mensagem && !arquivo) return alert('Insira uma mensagem, imagem, documento ou áudio');

    setEnviando(true);
    setExecutandoCampanha(true);

    for (const id of contatosSelecionados) {
      const contato = contatos.find((c) => c.id === id);
      const numero = contato.numero;

      try {
        if (arquivo) {
          const base64 = await base64FromFile(arquivo);
          const mimetype = arquivo.type;
          let mediatype = 'document';
          const nome = arquivo.name;

          if (mimetype.startsWith('image/')) {
            mediatype = 'image';
          } else if (mimetype.startsWith('audio/')) {
            mediatype = 'audio';
          }

          const resposta = await fetch('/api/enviar-midia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              number: numero,
              caption: mensagem,
              media: base64,
              mediatype,
              mimetype,
              fileName: mediatype === 'document' ? nome : undefined,
            }),
          });

          if (resposta.ok) {
            addLog(`✅ Enviado para ${numero}`);
          } else {
            addLog(`❌ Falha ao enviar para ${numero}`);
          }
        } else {
          const resposta = await fetch('/api/enviar-texto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number: numero, text: mensagem }),
          });

          if (resposta.ok) {
            addLog(`✅ Enviado para ${numero}`);
          } else {
            addLog(`❌ Falha ao enviar para ${numero}`);
          }
        }
      } catch (err) {
        addLog(`❌ Erro ao enviar para ${numero}: ${err.message}`);
      }

      await delayRandom();
    }

    alert('✅ Campanha finalizada.');
    setMensagem('');
    setArquivo(null);
    setEnviando(false);
    setExecutandoCampanha(false);
  };

  return (
    <div className="mt-4 p-4 border bg-card text-card-foreground rounded-lg shadow-sm transition-colors">
      {/* Caixa de envio */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted shadow-sm">
        <textarea
          className="w-full p-2 rounded-md border border-input bg-background text-foreground resize-none focus:ring-2 focus:ring-ring"
          placeholder="Digite sua mensagem"
          rows={3}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          disabled={executandoCampanha}
        />

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setMostrarEmoji(!mostrarEmoji)}
            className="text-lg text-primary"
            disabled={executandoCampanha}
          >
            <FaRegSmile />
          </button>

          <label htmlFor="file-upload" className="text-lg text-primary cursor-pointer">
            <FaPaperclip />
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*,audio/*,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => setArquivo(e.target.files[0])}
            className="hidden"
            disabled={executandoCampanha}
          />
        </div>
      </div>

      {mostrarEmoji && (
        <div className="mt-2 max-w-sm">
          <Picker data={data} onEmojiSelect={handleEmoji} />
        </div>
      )}

      {/* Preview de Arquivo */}
      {arquivo && (
        <div className="relative mt-4">
          {arquivo.type.startsWith('image/') && (
            <img
              src={URL.createObjectURL(arquivo)}
              alt="Preview"
              className="w-40 h-40 object-cover rounded border"
            />
          )}

          {arquivo.type.startsWith('audio/') && (
            <audio controls className="w-full mt-2">
              <source src={URL.createObjectURL(arquivo)} type={arquivo.type} />
              Seu navegador não suporta áudio.
            </audio>
          )}

          {arquivo.type.startsWith('application/') && (
            <div className="p-2 bg-muted rounded border text-sm flex justify-between items-center">
              <span>{arquivo.name}</span>
            </div>
          )}

          <button
            onClick={() => setArquivo(null)}
            className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full"
          >
            <FaTrashAlt />
          </button>
        </div>
      )}

      {/* Botão Enviar */}
      <div className="mt-4">
        <button
          onClick={enviarCampanha}
          disabled={enviando || executandoCampanha}
          className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          {enviando ? 'Enviando...' : 'Enviar Campanha'}
        </button>
      </div>

      {/* Painel de Logs */}
      <div className="mt-6 p-4 bg-muted border rounded shadow-sm max-h-[200px] overflow-y-auto">
        <h3 className="text-sm font-semibold mb-2">📋 Logs da Campanha</h3>
        {logs.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhuma mensagem enviada ainda.</p>
        ) : (
          logs.map((log, i) => (
            <p key={i} className="text-sm text-foreground">
              {log}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
