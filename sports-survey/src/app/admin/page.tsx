'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { isAdminAuthenticated, clearAdminSession } from '@/lib/auth'
import PlayerSidebar from '@/components/PlayerSidebar'
import RadarChartComponent from '@/components/RadarChartComponent'
import StatsCard from '@/components/StatsCard'
import { PromedioJugador, MetricKey, METRIC_LABELS } from '@/lib/types'

const ADMIN_PASSWORD_KEY = 'ADMIN_PASSWORD'

export default function AdminPage() {
  const router = useRouter()
  const [promedios, setPromedios] = useState<PromedioJugador[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const selectedPlayer = promedios.find((p) => p.jugador_id === selectedId) ?? null

  const fetchPromedios = useCallback(async () => {
    // The admin password was validated on the landing page, now we need it for the header
    // We store it temporarily in sessionStorage at login time
    const pass = sessionStorage.getItem(ADMIN_PASSWORD_KEY) ?? 'Admin@2024'
    try {
      const res = await fetch('/api/admin/promedios', {
        headers: { 'x-admin-token': pass },
      })
      if (res.status === 401) {
        clearAdminSession()
        router.replace('/')
        return
      }
      const data = await res.json()
      const list: PromedioJugador[] = data.promedios ?? []
      setPromedios(list)
      if (!selectedId && list.length > 0) {
        setSelectedId(list[0].jugador_id)
      }
    } catch {
      setError('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [router, selectedId])

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace('/')
      return
    }
    fetchPromedios()
  }, [fetchPromedios, router])

  function handleLogout() {
    clearAdminSession()
    router.push('/')
  }

  // Derive best and worst metric from selected player
  const metricKeys: MetricKey[] = ['ataque', 'defensa', 'dribling', 'habilidad', 'lanzamiento', 'actitud']
  const getMetricValue = (p: PromedioJugador, k: MetricKey) =>
    Number(p[`avg_${k}` as keyof PromedioJugador]) || 0

  type MetricStat = { key: MetricKey; val: number }
  let bestMetric: MetricStat | null = null
  let worstMetric: MetricStat | null = null

  if (selectedPlayer) {
    metricKeys.forEach((k) => {
      const val = getMetricValue(selectedPlayer, k)
      if (!bestMetric || val > bestMetric.val) bestMetric = { key: k, val }
      if (!worstMetric || val < worstMetric.val) worstMetric = { key: k, val }
    })
  }

  const safeBest = bestMetric as MetricStat | null
  const safeWorst = worstMetric as MetricStat | null

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top nav */}
      <header className="h-14 bg-[#050505] border-b border-gray-800 flex items-center px-4 gap-4 shrink-0 z-50">
        {/* Mobile sidebar toggle */}
        <button
          id="sidebar-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden text-gray-500 hover:text-white transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /></svg>
          </div>
          <span className="font-bold text-white text-sm">Sports Survey</span>
          <span className="text-gray-600 text-xs">/ Admin</span>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {/* Refresh */}
          <button
            id="refresh-btn"
            onClick={() => { setLoading(true); fetchPromedios() }}
            className="text-xs text-gray-500 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
          >
            Actualizar
          </button>
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="text-xs text-gray-600 hover:text-red-400 transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm px-4 py-2 text-center">
          {error}
        </div>
      )}

      {/* Body: sidebar + main */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar overlay on mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative z-40 h-[calc(100vh-3.5rem)] transition-transform duration-300
        `}>
          <PlayerSidebar
            players={promedios}
            selectedId={selectedId}
            onSelect={(id: string) => { setSelectedId(id); setSidebarOpen(false) }}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#050505]">
          {!selectedPlayer ? (
            <div className="flex items-center justify-center h-full text-gray-600">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mx-auto mb-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <p>Selecciona un jugador del panel lateral</p>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              {/* Player heading */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-xl font-black text-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.15)] shrink-0">
                  {selectedPlayer.nombre.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">{selectedPlayer.nombre}</h1>
                  <p className="text-gray-500 text-sm">
                    {selectedPlayer.total_votos} evaluación{selectedPlayer.total_votos !== 1 ? 'es' : ''} recibida{selectedPlayer.total_votos !== 1 ? 's' : ''}
                    {Number(selectedPlayer.total_votos) < 15 && (
                      <span className="ml-2 text-yellow-500/70">
                        · {15 - Number(selectedPlayer.total_votos)} pendiente{(15 - Number(selectedPlayer.total_votos)) !== 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Stats cards row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard
                  label="Promedio General"
                  value={Number(selectedPlayer.avg_general) > 0 ? Number(selectedPlayer.avg_general).toFixed(1) : '–'}
                  icon=""
                  highlight
                />
                <StatsCard
                  label="Votos Recibidos"
                  value={selectedPlayer.total_votos}
                  icon=""
                  sub="de 14 posibles"
                />
                {safeBest && (
                  <StatsCard
                    label={`Mejor: ${METRIC_LABELS[safeBest.key]}`}
                    value={safeBest.val.toFixed(1)}
                    icon=""
                    sub="Punto mas fuerte"
                  />
                )}
                {safeWorst && (
                  <StatsCard
                    label={`Menor: ${METRIC_LABELS[safeWorst.key]}`}
                    value={safeWorst.val.toFixed(1)}
                    icon=""
                    sub="Area a mejorar"
                  />
                )}
              </div>

              {/* Radar chart + metric bars */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Radar */}
                <div className="bg-[#0d0d0d] border border-gray-800 rounded-2xl p-6">
                  <h2 className="text-sm font-bold text-white mb-1">Gráfico de Radar</h2>
                  <p className="text-xs text-gray-500 mb-4">Promedio de {selectedPlayer.total_votos} evaluaciones · escala 0–10</p>
                  {Number(selectedPlayer.total_votos) === 0 ? (
                    <div className="flex items-center justify-center h-64 text-gray-600 text-sm">
                      Sin evaluaciones aún
                    </div>
                  ) : (
                    <RadarChartComponent data={selectedPlayer} />
                  )}
                </div>

                {/* Metric breakdown bars */}
                <div className="bg-[#0d0d0d] border border-gray-800 rounded-2xl p-6">
                  <h2 className="text-sm font-bold text-white mb-1">Desglose por Métrica</h2>
                  <p className="text-xs text-gray-500 mb-6">Promedios individuales</p>
                  <div className="space-y-5">
                    {metricKeys.map((k) => {
                      const val = getMetricValue(selectedPlayer, k)
                      const pct = (val / 10) * 100
                      return (
                        <div key={k}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span>{METRIC_ICONS[k]}</span>
                              <span className="text-sm text-gray-300 font-medium">{METRIC_LABELS[k]}</span>
                            </div>
                            <span className="text-sm font-bold text-white tabular-nums">
                              {val > 0 ? val.toFixed(1) : '–'}
                              <span className="text-gray-600 text-xs font-normal">/10</span>
                            </span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                background: pct >= 80 ? '#10b981' : pct >= 60 ? '#00f3ff' : pct >= 40 ? '#f59e0b' : '#ef4444',
                                boxShadow: pct > 0 ? `0 0 8px ${pct >= 60 ? 'rgba(0,243,255,0.5)' : 'rgba(245,158,11,0.4)'}` : 'none',
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
