import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// POST /api/auth/login — Validate player credentials (name + PIN)
export async function POST(req: NextRequest) {
  try {
    const { jugador_id, pin } = await req.json()
    if (!jugador_id || !pin) {
      return NextResponse.json({ error: 'jugador_id y pin requeridos' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('jugadores')
      .select('id, nombre, pin, categoria')
      .eq('id', jugador_id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Jugador no encontrado' }, { status: 404 })
    }

    if (data.pin !== pin) {
      return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
    }

    return NextResponse.json({ jugador: { id: data.id, nombre: data.nombre, categoria: data.categoria } })
  } catch (err) {
    console.error('[API /auth/login]', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
