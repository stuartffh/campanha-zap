import './globals.css';

export const metadata = {
  title: 'Campanha Zap',
  description: 'Envio de mensagens via WhatsApp',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen font-sans transition-colors duration-300">
        <main className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}