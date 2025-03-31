import { NextResponse } from 'next/server';
import axios from 'axios';
import Database from 'better-sqlite3';

const db = new Database('./db/contatos.db');

const TOKEN = process.env.ZAP_API_TOKEN;
const INSTANCE = process.env.ZAP_INSTANCE_NAME;

export async function POST() {
  try {
    const res = await axios.post(`https://panel.zapchatbr.com/chat/findContacts/${INSTANCE}`, {
      where: {}
    }, {
      headers: {
        'Content-Type': 'application/json',
        apikey: TOKEN
      }
    });

    const contatos = res.data;

    const insert = db.prepare(`
      INSERT OR REPLACE INTO contatos (id, nome, numero, grupo, atualizado_em)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const contato of contatos) {
      const raw = contato.remoteJid;
      const numero = raw.replace('@s.whatsapp.net', '').replace('@g.us', '');
      const isGrupo = raw.includes('@g.us') ? 1 : 0;
      insert.run(contato.id, contato.pushName || '', numero, isGrupo, new Date().toISOString());
    }

    return NextResponse.json({ ok: true, total: contatos.length });
  } catch (err) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500 });
  }
}
