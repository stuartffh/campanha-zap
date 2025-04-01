import { NextResponse } from 'next/server';
import axios from 'axios';
import Database from 'better-sqlite3';

const db = new Database('./db/contatos.db');

// Otimizações para operações em massa
db.pragma('journal_mode = WAL');
db.pragma('cache_size = -64000'); // 64MB cache
db.pragma('temp_store = MEMORY');

const TOKEN = process.env.ZAP_API_TOKEN;
const INSTANCE = process.env.ZAP_INSTANCE_NAME;

export async function POST() {
  try {
    // 1. Busca contatos da API
    const res = await axios.post(
      `https://panel.zapchatbr.com/chat/findContacts/${INSTANCE}`,
      { where: {} },
      { headers: { 'Content-Type': 'application/json', apikey: TOKEN } }
    );

    const contatosAPI = res.data;
    const apiIds = contatosAPI.map(c => c.id);
    
    // 2. Transação única para todas operações
    db.transaction(() => {
      // 3. Bulk Insert/Update
      const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO contatos 
        (id, nome, numero, grupo, atualizado_em)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      // Processa em lote
      const batchSize = 1000;
      for (let i = 0; i < contatosAPI.length; i += batchSize) {
        const batch = contatosAPI.slice(i, i + batchSize);
        db.transaction(() => {
          for (const contato of batch) {
            const raw = contato.remoteJid;
            const numero = raw.replace(/@(s\.whatsapp\.net|g\.us)/, '');
            const isGrupo = raw.includes('@g.us') ? 1 : 0;
            
            insertStmt.run(
              contato.id,
              contato.pushName || '',
              numero,
              isGrupo,
              new Date().toISOString()
            );
          }
        })();
      }

      // 4. Delete massivo eficiente
      if (apiIds.length > 0) {
        const placeholders = apiIds.map(() => '?').join(',');
        db.prepare(`
          DELETE FROM contatos 
          WHERE id NOT IN (${placeholders})
        `).run(apiIds);
      } else {
        // Caso não haja contatos na API, limpa toda a tabela
        db.prepare('DELETE FROM contatos').run();
      }
    })();

    return NextResponse.json({ ok: true, total: contatosAPI.length });
  } catch (err) {
    console.error('[Sincronizar] Erro:', err.message);
    return NextResponse.json({ error: true, message: err.message }, { status: 500 });
  }
}