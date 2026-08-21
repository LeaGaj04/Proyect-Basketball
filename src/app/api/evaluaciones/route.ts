import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// POST /api/evaluaciones — Insert a new evaluation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { votante_id, evaluado_id, ataque, defensa, dribling, habilidad, lanzamiento, actitud } = body

    // --- Validate required fields ---
    if (!votante_id || !evaluado_id) {
      return NextResponse.json({ error: 'votante_id y evaluado_id son requeridos' }, { status: 400 })
    }
    if (votante_id === evaluado_id) {
      return NextResponse.json({ error: 'No puedes evaluarte a ti mismo' }, { status: 400 })
    }
    const metrics = [ataque, defensa, dribling, habilidad, lanzamiento, actitud]
    if (metrics.some((v) => v === undefined || v === null || v < 1 || v > 10)) {
      return NextResponse.json({ error: 'Todos los valores deben estar entre 1 y 10' }, { status: 400 })
    }

    // --- Verify the voter exists ---
    const supabase = createServerClient()
    const { data: voter, error: voterErr } = await supabase
      .from('jugadores')
      .select('id')
      .eq('id', votante_id)
      .single()

    if (voterErr || !voter) {
      return NextResponse.json({ error: 'Jugador votante no encontrado' }, { status: 404 })
    }

    // --- Check for duplicate vote (belt-and-suspenders, DB has UNIQUE constraint too) ---
    const { data: existing } = await supabase
      .from('evaluaciones')
      .select('id')
      .eq('votante_id', votante_id)
      .eq('evaluado_id', evaluado_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Ya evaluaste a este jugador' }, { status: 409 })
    }

    // --- Insert ---
    const { data, error } = await supabase
      .from('evaluaciones')
      .insert({ votante_id, evaluado_id, ataque, defensa, dribling, habilidad, lanzamiento, actitud })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ evaluacion: data }, { status: 201 })
  } catch (err: unknown) {
    console.error('[API /evaluaciones POST]', err)
    // Handle Postgres UNIQUE violation
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === '23505') {
      return NextResponse.json({ error: 'Ya evaluaste a este jugador' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error al insertar evaluación' }, { status: 500 })
  }
}

// GET /api/evaluaciones?votante_id=xxx — Check which players have already been evaluated
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const votante_id = searchParams.get('votante_id')
    if (!votante_id) {
      return NextResponse.json({ error: 'votante_id requerido' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('evaluaciones')
      .select('evaluado_id, created_at')
      .eq('votante_id', votante_id)

    if (error) throw error
    return NextResponse.json({ evaluaciones: data })
  } catch (err) {
    console.error('[API /evaluaciones GET]', err)
    return NextResponse.json({ error: 'Error al obtener evaluaciones' }, { status: 500 })
  }
}
