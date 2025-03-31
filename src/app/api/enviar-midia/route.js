import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = 'https://panel.zapchatbr.com';
const TOKEN = process.env.ZAP_API_TOKEN;
const INSTANCE = process.env.ZAP_INSTANCE_NAME;

const MAX_FILE_SIZE_MB = 5;
const MAX_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
  document: [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { number, media, mediatype, mimetype, caption, fileName } = body;

    if (!number || !media || !mediatype || !mimetype) {
      return NextResponse.json({
        error: true,
        message: 'Campos obrigatórios ausentes'
      }, { status: 400 });
    }

    // 🛡️ Valida tipo de mídia
    const allowed = ALLOWED_MIME_TYPES[mediatype];
    if (!allowed || !allowed.includes(mimetype)) {
      return NextResponse.json({
        error: true,
        message: `Mimetype "${mimetype}" não permitido para tipo "${mediatype}".`
      }, { status: 400 });
    }

    // 📏 Valida tamanho estimado
    const estimatedSize = (media.length * 3) / 4;
    if (estimatedSize > MAX_BYTES) {
      return NextResponse.json({
        error: true,
        message: `Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE_MB}MB`
      }, { status: 400 });
    }

    const payload = {
      number,
      media,
      mediatype,
      mimetype,
      caption,
      delay: 1200
    };

    // 📄 Para documentos o Evolution exige fileName
    if (mediatype === 'document') {
      payload.fileName = fileName || 'arquivo.pdf';
    }

    const { data } = await axios.post(`${API_URL}/message/sendMedia/${INSTANCE}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        apikey: TOKEN
      }
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error('[enviar-midia] Erro:', err?.response?.data || err.message);
    return NextResponse.json({
      error: true,
      message: 'Erro ao enviar mídia',
      detalhe: err?.response?.data || err.message
    }, { status: 500 });
  }
}
