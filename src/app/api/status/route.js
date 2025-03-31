import { NextResponse } from 'next/server';
import axios from 'axios';

const TOKEN = process.env.ZAP_API_TOKEN;
const INSTANCE = process.env.ZAP_INSTANCE_NAME;

export async function GET() {
  try {
    const res = await axios.get(`https://panel.zapchatbr.com/instance/connectionState/${INSTANCE}`, {
      headers: { apikey: TOKEN }
    });

    return NextResponse.json(res.data.instance);
  } catch (err) {
    return NextResponse.json({ state: 'error', message: err.message }, { status: 500 });
  }
}
