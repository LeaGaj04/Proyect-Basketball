import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/admin/promedios — Returns AVG scores for all players
// Protected: requires Authorization header matching ADMIN_PASSWORD env var
export async function GET(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD
  const authHeader = req.headers.get('x-admin-token')

  if (!adminPassword || authHeader !== adminPassword) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('promedios_evaluaciones')
      .select('*')
      .order('avg_general', { ascending: false, nullsFirst: false })

    if (error) throw error
    return NextResponse.json({ promedios: data })
  } catch (err) {
    console.error('[API /admin/promedios]', err)
    return NextResponse.json({ error: 'Error al obtener promedios' }, { status: 500 })
  }
}
