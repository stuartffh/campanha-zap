import { NextResponse } from 'next/server';
import axios from 'axios';
import db from '@/lib/db';
import { format } from 'date-fns';

const TOKEN = process.env.ZAP_API_TOKEN;
const INSTANCE = process.env.ZAP_INSTANCE_NAME;
const LIMITE_DIARIO = process.env.ZAP_LIMITE;

export async function POST(req) {
  console.log('[enviar-texto] Requisição recebida');

  try {
    const { number, text } = await req.json();
    console.log('[enviar-texto] Dados recebidos:', { number, text });

    if (!number || !text) {
      console.warn('[enviar-texto] Número ou texto ausente');
      return NextResponse.json(
        { error: true, message: 'Número e texto são obrigatórios.' },
        { status: 400 }
      );
    }

    const hoje = format(new Date(), 'yyyy-MM-dd');
    console.log('[enviar-texto] Data de hoje:', hoje);

    // Verifica envios de hoje
    const getEnvios = db.prepare('SELECT total FROM envios_diarios WHERE data = ?');
    const registro = getEnvios.get(hoje);
    const totalHoje = registro?.total || 0;
    console.log(`[enviar-texto] Envios hoje: ${totalHoje}/${LIMITE_DIARIO}`);

    if (totalHoje >= LIMITE_DIARIO) {
      console.warn('[enviar-texto] Limite diário atingido');
      return NextResponse.json(
        { error: true, message: 'Limite diário de envios atingido.' },
        { status: 403 }
      );
    }

    // Envia para ZapChatBR
    const apiUrl = `https://panel.zapchatbr.com/message/sendText/${INSTANCE}`;
    console.log('[enviar-texto] Enviando para API:', apiUrl);

    const response = await axios.post(
      apiUrl,
      {
        number,
        text,
        delay: 1200
      },
      {
        headers: {
          'Content-Type': 'application/json',
          apikey: TOKEN
        }
      }
    );

    console.log('[enviar-texto] Envio bem-sucedido:', response.data);

    // Atualiza contador
    const updateEnvios = db.prepare(`
      INSERT INTO envios_diarios (data, total)
      VALUES (?, 1)
      ON CONFLICT(data) DO UPDATE SET total = total + 1
    `);
    updateEnvios.run(hoje);
    console.log('[enviar-texto] Contador de envios atualizado.');

    return NextResponse.json(response.data);
  } catch (err) {
    console.error('[enviar-texto] Erro:', err.message);
    if (err?.response?.data) {
      console.error('[enviar-texto] Erro resposta API:', err.response.data);
    }

    return NextResponse.json(
      {
        error: true,
        message: err.message,
        detalhe: err?.response?.data || 'Erro interno'
      },
      { status: 500 }
    );
  }
}
