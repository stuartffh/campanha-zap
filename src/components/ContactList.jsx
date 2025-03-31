'use client';
import { useState, useEffect } from 'react';

export default function ContactList({ contatos = [], onSelecionadosChange }) {
  const [selecionados, setSelecionados] = useState([]);
  const [busca, setBusca] = useState('');
  const [contatosFiltrados, setContatosFiltrados] = useState(contatos);

  useEffect(() => {
    setContatosFiltrados(
      contatos.filter(c =>
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.numero.includes(busca)
      )
    );
  }, [contatos, busca]);

  useEffect(() => {
    onSelecionadosChange(selecionados);
  }, [selecionados]);

  const toggleSelecionado = (id) => {
    const novaLista = selecionados.includes(id)
      ? selecionados.filter(i => i !== id)
      : [...selecionados, id];
    setSelecionados(novaLista);
  };

  const toggleTodos = () => {
    if (selecionados.length === contatosFiltrados.length) {
      setSelecionados([]);
    } else {
      setSelecionados(contatosFiltrados.map(c => c.id));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Barra superior */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">
          {selecionados.length} selecionado{selecionados.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={toggleTodos}
          className="text-sm text-blue-600 hover:underline"
        >
          {selecionados.length === contatosFiltrados.length
            ? 'Desmarcar Todos'
            : 'Selecionar Todos'}
        </button>
      </div>

      {/* Campo de busca */}
      <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome ou número"
        className="w-full p-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {/* Lista de contatos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contatosFiltrados.map(c => (
          <div
            key={c.id}
            className="border border-border p-3 rounded bg-card text-card-foreground shadow-sm hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span className="font-semibold text-sm truncate max-w-[140px]">
                {c.nome || 'Sem nome'}
              </span>
              <span className="text-xs text-muted-foreground">{c.numero}</span>
            </div>

            <input
              type="checkbox"
              checked={selecionados.includes(c.id)}
              onChange={() => toggleSelecionado(c.id)}
              className="w-5 h-5 accent-green-600 cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
