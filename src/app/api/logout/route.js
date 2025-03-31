import { NextResponse } from 'next/server';
import axios from 'axios';

const TOKEN = process.env.ZAP_API_TOKEN;
const INSTANCE = process.env.ZAP_INSTANCE_NAME;

export async function DELETE() {
  try {
    const res = await axios.delete(`https://panel.zapchatbr.com/instance/logout/${INSTANCE}`, {
      headers: { apikey: TOKEN }
    });

    return NextResponse.json(res.data);
  } catch (err) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500 });
  }
}
