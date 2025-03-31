'use client';
import { useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const dark = savedTheme === 'dark';
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition-all
        bg-muted text-muted-foreground hover:bg-muted/70 border border-border"
    >
      {isDark ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-blue-600" />}
      {isDark ? 'Tema Claro' : 'Tema Escuro'}
    </button>
  );
}
