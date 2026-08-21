import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@2024'

    if (password === adminPassword) {
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
