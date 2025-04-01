'use client';
import { useState, useRef, useEffect } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { FaRegSmile, FaTrashAlt, FaPaperclip, FaTelegramPlane } from 'react-icons/fa';

export default function MessageForm({ contatos, contatosSelecionados }) {
  const [mensagem, setMensagem] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mostrarEmoji, setMostrarEmoji] = useState(false);
  const [logs, setLogs] = useState([]);
  const [executandoCampanha, setExecutandoCampanha] = useState(false);
  const emojiPickerRef = useRef(null);

  // Fecha o picker de emojis ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setMostrarEmoji(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <div className="mt-4 p-4 border bg-white rounded-2xl shadow-sm">
      {/* Preview de Arquivo */}
      {arquivo && (
        <div className="relative mb-4 p-3 bg-gray-100 rounded-xl">
          <div className="flex items-center gap-3">
            {arquivo.type.startsWith('image/') && (
              <img
                src={URL.createObjectURL(arquivo)}
                alt="Preview"
                className="w-12 h-12 object-cover rounded-lg"
              />
            )}

            {arquivo.type.startsWith('audio/') && (
              <audio controls className="w-full">
                <source src={URL.createObjectURL(arquivo)} type={arquivo.type} />
              </audio>
            )}

            {arquivo.type.startsWith('application/') && (
              <div className="flex items-center gap-2">
                <FaPaperclip className="text-gray-600" />
                <span className="text-sm text-gray-700">{arquivo.name}</span>
              </div>
            )}

            <button
              onClick={() => setArquivo(null)}
              className="ml-auto p-1.5 hover:bg-gray-200 rounded-full transition-colors"
            >
              <FaTrashAlt className="text-red-500 text-lg" />
            </button>
          </div>
        </div>
      )}

      {/* Caixa de Mensagem */}
      <div className="relative">
        <textarea
          className="w-full p-3 pr-16 rounded-xl border-2 border-gray-200 bg-white text-gray-800 resize-none focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          placeholder="Digite sua mensagem"
          rows={3}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          disabled={executandoCampanha}
        />

        {/* Botões de Ação */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <label 
            htmlFor="file-upload" 
            className={`p-2 hover:bg-gray-100 rounded-full cursor-pointer ${executandoCampanha ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FaPaperclip className="text-gray-500 text-xl" />
          </label>
          
          <button
            onClick={() => setMostrarEmoji(!mostrarEmoji)}
            className={`p-2 hover:bg-gray-100 rounded-full ${executandoCampanha ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={executandoCampanha}
          >
            <FaRegSmile className="text-gray-500 text-xl" />
          </button>

          <button
            onClick={enviarCampanha}
            disabled={enviando || executandoCampanha}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaTelegramPlane className="text-xl" />
          </button>
        </div>

        {/* Picker de Emojis */}
        {mostrarEmoji && (
          <div ref={emojiPickerRef} className="absolute bottom-14 right-0 z-10">
            <Picker
              data={data}
              onEmojiSelect={handleEmoji}
              theme="light"
              previewPosition="none"
              skinTonePosition="search"
            />
          </div>
        )}
      </div>

      <input
        id="file-upload"
        type="file"
        accept="image/*,audio/*,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={(e) => setArquivo(e.target.files[0])}
        className="hidden"
        disabled={executandoCampanha}
      />

      {/* Painel de Logs */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl max-h-48 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">📋 Logs da Campanha</h3>
        {logs.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma mensagem enviada ainda.</p>
        ) : (
          logs.map((log, i) => (
            <p key={i} className="text-sm text-gray-600 py-1 border-b border-gray-100 last:border-0">
              {log}
            </p>
          ))
        )}
      </div>
    </div>
  );
}