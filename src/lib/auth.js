'use client'

const EXPIRACAO_MINUTOS = 60; // duração da sessão, ex: 60 minutos

export function isLoggedIn() {
  if (typeof window === 'undefined') return false;

  const logged = localStorage.getItem('zap-auth') === 'true';
  const expiresAt = localStorage.getItem('zap-auth-expira');

  if (!logged || !expiresAt) return false;

  const agora = new Date();
  const expira = new Date(expiresAt);

  if (agora > expira) {
    logout();
    return false;
  }

  return true;
}

export function login(user, pass) {
  const validUser = process.env.NEXT_PUBLIC_LOGIN_USUARIO;
  const validPass = process.env.NEXT_PUBLIC_LOGIN_SENHA;

  if (user === validUser && pass === validPass) {
    const agora = new Date();
    const expira = new Date(agora.getTime() + EXPIRACAO_MINUTOS * 60 * 1000);
    localStorage.setItem('zap-auth', 'true');
    localStorage.setItem('zap-auth-expira', expira.toISOString());
    return true;
  }

  return false;
}

export function logout() {
  localStorage.removeItem('zap-auth');
  localStorage.removeItem('zap-auth-expira');
}
