const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Caminho do banco de dados
const dbPath = path.join(__dirname, 'contatos.db');

// Garante que a pasta existe
const dirPath = path.dirname(dbPath);
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

// Inicializa o banco
const db = new Database(dbPath);

// Tabela de contatos (já existente)
db.exec(`
  CREATE TABLE IF NOT EXISTS contatos (
    id TEXT PRIMARY KEY,
    nome TEXT,
    numero TEXT,
    grupo BOOLEAN,
    atualizado_em TEXT
  );
`);

// Tabela de campanhas
db.exec(`
  CREATE TABLE IF NOT EXISTS campanhas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mensagem TEXT,
    arquivo_base64 TEXT,
    mimetype TEXT,
    mediatype TEXT,
    filename TEXT,
    contatos TEXT, -- JSON.stringify([]) dos contatos
    agendado_em TEXT, -- Data/hora ISO
    status TEXT DEFAULT 'agendada', -- agendada | enviando | enviada | erro
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Tabela para controle de limite diário de envios
db.exec(`
  CREATE TABLE IF NOT EXISTS limites (
    data TEXT PRIMARY KEY,     -- ex: '2025-03-31'
    total INTEGER DEFAULT 0    -- total de envios nesse dia
  );
`);

// Tabela de controle diário de envios
db.exec(`
  CREATE TABLE IF NOT EXISTS envios_diarios (
    data TEXT PRIMARY KEY, -- YYYY-MM-DD
    total INTEGER DEFAULT 0
  );
`);

console.log('✅ Banco SQLite inicializado com sucesso em:', dbPath);

module.exports = db;
