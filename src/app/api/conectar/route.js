import { NextResponse } from 'next/server';
import axios from 'axios';

const TOKEN = process.env.ZAP_API_TOKEN;  // Substitua pelo seu token real
const INSTANCE = process.env.ZAP_INSTANCE_NAME;     // Substitua pelo nome correto da instância

export async function GET() {
  try {
    const res = await axios.get(`https://panel.zapchatbr.com/instance/connect/${INSTANCE}`, {
      headers: { apikey: TOKEN }
    });

    //console.log('[API /conectar] Resposta da Evolution API:', res.data);

    const { code } = res.data;

    // Verificação: o código retornado é válido?
    if (!code || typeof code !== 'string') {
      console.warn('[API /conectar] Código inválido recebido:', code);
      return NextResponse.json({
        error: true,
        message: 'QR Code em formato inválido ou ausente.'
      }, { status: 400 });
    }

    return NextResponse.json({ code });
    
  } catch (err) {
    console.error('[API /conectar] Erro ao conectar:', err?.response?.data || err.message);
    return NextResponse.json({
      error: true,
      message: err?.response?.data?.message || err.message,
      details: err?.response?.data || null
    }, { status: err?.response?.status || 500 });
  }
}
