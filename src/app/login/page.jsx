'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, login } from '@/lib/auth';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) router.push('/dashboard');
  }, []);

  function handleLogin(e) {
    e.preventDefault();
    if (login(usuario, senha)) {
      router.push('/dashboard');
    } else {
      setErro('Usuário ou senha incorretos.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <form
        onSubmit={handleLogin}
        className="bg-card text-card-foreground border border-border p-6 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-xl font-bold mb-4">Login</h1>

        {erro && <p className="text-red-500 text-sm mb-3">{erro}</p>}

        <input
          type="text"
          placeholder="Usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="w-full bg-background border border-input text-foreground placeholder:text-muted-foreground p-2 mb-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full bg-background border border-input text-foreground placeholder:text-muted-foreground p-2 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-all"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
