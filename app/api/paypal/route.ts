import { NextRequest, NextResponse } from 'next/server'

// Aquí iría lógica server-side segura de PayPal si quieres ocultar tu client secret.
// Por ahora devolvemos dummy.
export async function POST(req: NextRequest) {
  return NextResponse.json({ ok: true })
}
