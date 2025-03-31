import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req) {
  try {
    const {
      mensagem,
      arquivo_base64,
      mimetype,
      mediatype,
      filename,
      contatos,
      agendado_em
    } = await req.json();

    // Validações básicas
    if (!Array.isArray(contatos) || contatos.length === 0) {
      return NextResponse.json({ error: true, message: 'Contatos obrigatórios' }, { status: 400 });
    }

    if (!mensagem && !arquivo_base64) {
      return NextResponse.json({ error: true, message: 'Mensagem ou arquivo obrigatório' }, { status: 400 });
    }

    if (!agendado_em || isNaN(Date.parse(agendado_em))) {
      return NextResponse.json({ error: true, message: 'Data de agendamento inválida' }, { status: 400 });
    }

    if (new Date(agendado_em) < new Date()) {
      return NextResponse.json({ error: true, message: 'Data de agendamento deve ser futura' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO campanhas (
        mensagem, arquivo_base64, mimetype, mediatype, filename,
        contatos, agendado_em, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'agendada')
    `);

    const result = stmt.run(
      mensagem || '',
      arquivo_base64 || '',
      mimetype || '',
      mediatype || '',
      filename || '',
      JSON.stringify(contatos),
      agendado_em
    );

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Campanha agendada com sucesso!'
    });
  } catch (err) {
    console.error('[API /agendar] Erro:', err.message);
    return NextResponse.json({ error: true, message: 'Erro ao agendar campanha' }, { status: 500 });
  }
}
