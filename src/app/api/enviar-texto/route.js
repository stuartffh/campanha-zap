import { NextResponse } from 'next/server';
import axios from 'axios';

const TOKEN = process.env.ZAP_API_TOKEN;
const INSTANCE = process.env.ZAP_INSTANCE_NAME;

export async function POST(req) {
  const { number, text } = await req.json();

  try {
    const res = await axios.post(`https://panel.zapchatbr.com/message/sendText/${INSTANCE}`, {
      number,
      text,
      delay: 1200
    }, {
      headers: {
        'Content-Type': 'application/json',
        apikey: TOKEN
      }
    });

    return NextResponse.json(res.data);
  } catch (err) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500 });
  }
}
