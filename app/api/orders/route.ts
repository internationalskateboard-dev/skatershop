import { NextRequest, NextResponse } from 'next/server'

// Aquí guardaríamos el pedido en DB después del pago
export async function POST(req: NextRequest) {
  const body = await req.json()
  console.log('SAVE ORDER >>>', body)

  // TODO: guardar en MongoDB / Firestore
  return NextResponse.json({ ok: true })
}
