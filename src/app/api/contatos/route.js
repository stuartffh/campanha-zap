import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';

const db = new Database('./db/contatos.db');

export async function GET() {
  try {
    const rows = db.prepare('SELECT * FROM contatos ORDER BY nome').all();
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500 });
  }
}
