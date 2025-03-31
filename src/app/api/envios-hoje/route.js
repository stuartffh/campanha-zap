import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { format } from 'date-fns';

const LIMITE_DIARIO = process.env.ZAP_INSTANCE_NAME;

export async function GET() {
  try {
    const hoje = format(new Date(), 'yyyy-MM-dd');

    const stmt = db.prepare('SELECT total FROM envios_diarios WHERE data = ?');
    const registro = stmt.get(hoje);

    const total = registro?.total || 0;

    return NextResponse.json({
      total,
      limite: LIMITE_DIARIO,
      restante: Math.max(0, LIMITE_DIARIO - total),
      porcentagem: Math.min(100, ((total / LIMITE_DIARIO) * 100).toFixed(1))
    });
  } catch (err) {
    console.error('[envios-hoje] Erro ao consultar:', err);
    return NextResponse.json({
      error: true,
      message: 'Erro ao consultar envios do dia'
    }, { status: 500 });
  }
}
