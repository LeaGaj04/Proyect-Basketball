import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('jugadores')
      .select('id, nombre, categoria')
      .order('nombre', { ascending: true })

    if (error) throw error
    return NextResponse.json({ jugadores: data })
  } catch (err) {
    console.error('[API /jugadores]', err)
    return NextResponse.json({ error: 'Error al obtener jugadores' }, { status: 500 })
  }
}
