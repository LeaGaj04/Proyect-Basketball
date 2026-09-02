'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, clearSession } from '@/lib/auth'
import { JugadorSession } from '@/lib/auth'
import Link from 'next/link'

interface Jugador {
  id: string
  nombre: string
  categoria?: string
}

interface EvaluacionHecha {
  evaluado_id: string
  created_at: string
}

export default function VotarPage() {
  const router = useRouter()
  const [session, setSessionData] = useState<JugadorSession | null>(null)
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [evaluadas, setEvaluadas] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = getSession()
    if (!s) { router.replace('/'); return }
    setSessionData(s)

    Promise.all([
      fetch('/api/jugadores').then((r) => r.json()),
      fetch(`/api/evaluaciones?votante_id=${s.id}`).then((r) => r.json()),
    ]).then(([jugData, evalData]) => {
      const todos: Jugador[] = (jugData.jugadores ?? [])
        .filter((j: Jugador) => j.id !== s.id && (!s.categoria || j.categoria === s.categoria))
      setJugadores(todos)
      const done = new Set<string>((evalData.evaluaciones ?? []).map((e: EvaluacionHecha) => e.evaluado_id))
      setEvaluadas(done)
    }).finally(() => setLoading(false))
  }, [router])

  function handleLogout() {
    clearSession()
    router.push('/')
  }

  const pendientes = jugadores.filter((j) => !evaluadas.has(j.id))
  const completadas = jugadores.filter((j) => evaluadas.has(j.id))
  const progress = jugadores.length > 0 ? (evaluadas.size / jugadores.length) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black bg-grid">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 2a10 10 0 100 20A10 10 0 0012 2z" /></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Club Deportivo Project</p>
              <p className="text-sm font-bold text-white">{session?.nombre}</p>
            </div>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="text-xs text-gray-600 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress section */}
        <div className="mb-8">
          <div className="flex items-end justify-between mb-3">
            <div>
              <h1 className="text-2xl font-black text-white">Evalúa a tu equipo</h1>
              <p className="text-gray-500 text-sm mt-1">Haz click en cada compañero para calificarlo</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-cyan-400 tabular-nums">{evaluadas.size}<span className="text-gray-600 text-lg">/{jugadores.length}</span></p>
              <p className="text-xs text-gray-500">completadas</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                boxShadow: progress > 0 ? '0 0 12px rgba(0,243,255,0.6)' : 'none',
              }}
            />
          </div>

          {progress === 100 && (
            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-sm font-semibold flex items-center gap-2">
              Completaste todas las evaluaciones. Gracias por tu participacion.
            </div>
          )}
        </div>

        {/* Pending players */}
        {pendientes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">
              Pendientes ({pendientes.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendientes.map((j) => (
                <Link
                  key={j.id}
                  id={`player-card-${j.id}`}
                  href={`/votar/${j.id}`}
                  className="group glass-card p-4 flex items-center gap-4 transition-all duration-200
                    hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(0,243,255,0.1)]"
                >
                  <div className="w-11 h-11 rounded-xl bg-gray-800 text-gray-400 flex items-center justify-center font-black text-sm group-hover:bg-cyan-400/10 group-hover:text-cyan-400 transition-all">
                    {j.nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{j.nombre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {j.categoria && <span className="text-[10px] uppercase tracking-wider bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-md">{j.categoria}</span>}
                      <p className="text-xs text-gray-600">Sin evaluar</p>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Completed players */}
        {completadas.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">
              Evaluados ({completadas.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {completadas.map((j) => (
                <div
                  key={j.id}
                  className="glass-card p-4 flex items-center gap-4 opacity-50"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-sm">
                    {j.nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{j.nombre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {j.categoria && <span className="text-[10px] uppercase tracking-wider bg-emerald-900/30 text-emerald-500/70 px-1.5 py-0.5 rounded-md">{j.categoria}</span>}
                      <p className="text-xs text-emerald-500">Evaluado</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
