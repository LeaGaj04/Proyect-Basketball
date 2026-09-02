'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSession } from '@/lib/auth'
import MetricSlider from '@/components/MetricSlider'
import { MetricKey, METRIC_LABELS } from '@/lib/types'
import Link from 'next/link'

const ALL_METRICS: MetricKey[] = ['ataque', 'defensa', 'dribling', 'habilidad', 'lanzamiento', 'actitud']

type Scores = Partial<Record<MetricKey, number>>

interface Jugador {
  id: string
  nombre: string
  categoria?: string
}

export default function EvaluarPage() {
  const router = useRouter()
  const params = useParams()
  const evaluadoId = params.evaluado_id as string

  const [evaluado, setEvaluado] = useState<Jugador | null>(null)
  const [scores, setScores] = useState<Scores>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [alreadyVoted, setAlreadyVoted] = useState(false)

  const session = typeof window !== 'undefined' ? getSession() : null

  useEffect(() => {
    if (!session) { router.replace('/'); return }

    // Fetch player info
    fetch('/api/jugadores')
      .then((r) => r.json())
      .then((d) => {
        const found = (d.jugadores ?? []).find((j: Jugador) => j.id === evaluadoId)
        if (!found) { router.replace('/votar'); return }
        setEvaluado(found)
      })

    // Check if already voted
    fetch(`/api/evaluaciones?votante_id=${session.id}`)
      .then((r) => r.json())
      .then((d) => {
        const already = (d.evaluaciones ?? []).some((e: { evaluado_id: string }) => e.evaluado_id === evaluadoId)
        if (already) setAlreadyVoted(true)
      })
  }, [evaluadoId, router, session])

  function handleScoreChange(metric: MetricKey, value: number) {
    setScores((prev) => ({ ...prev, [metric]: value }))
  }

  // Form is valid only when all 6 metrics have a value
  const allFilled = ALL_METRICS.every((m) => scores[m] !== undefined)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allFilled || !session) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/evaluaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          votante_id: session.id,
          evaluado_id: evaluadoId,
          ...scores,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409) { setAlreadyVoted(true); return }
        setError(data.error ?? 'Error al enviar evaluación')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  // ——— Success screen ———
  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(52,211,153,0.2)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-black text-white mb-2">¡Evaluación enviada!</h2>
          <p className="text-gray-400 mb-8">Tu calificación de <span className="text-white font-semibold">{evaluado?.nombre}</span> ha sido registrada.</p>
          <Link
            href="/votar"
            className="inline-flex items-center gap-2 bg-cyan-400 text-black font-bold py-3 px-6 rounded-xl
              hover:bg-cyan-300 hover:shadow-[0_0_25px_rgba(0,243,255,0.5)] transition-all"
          >
            Volver al equipo
          </Link>
        </div>
      </div>
    )
  }

  // ——— Already voted screen ———
  if (alreadyVoted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
          </div>
          <h2 className="text-xl font-black text-white mb-2">Ya evaluaste a este jugador</h2>
          <p className="text-gray-500 mb-8 text-sm">Solo puedes enviar una evaluación por compañero.</p>
          <Link
            href="/votar"
            className="inline-flex items-center gap-2 border border-cyan-400/50 text-cyan-400 font-bold py-3 px-6 rounded-xl
              hover:bg-cyan-400/10 transition-all"
          >
            Volver al equipo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black bg-grid">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/votar" className="text-gray-500 hover:text-white transition-colors text-sm">
          <span className="text-gray-600 group-hover:text-cyan-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </span>
          </Link>
          <span className="text-gray-700">/</span>
          <p className="text-sm font-semibold text-white truncate">{evaluado?.nombre ?? '...'}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Player header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-2xl font-black text-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.15)]">
            {evaluado?.nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() ?? '??'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white">{evaluado?.nombre ?? 'Cargando...'}</h1>
              {evaluado?.categoria && <span className="text-xs uppercase tracking-wider bg-gray-800 text-gray-400 px-2 py-1 rounded-md">{evaluado.categoria}</span>}
            </div>
            <p className="text-gray-500 text-sm mt-1">Evalúa su rendimiento del 1 al 10 en cada categoría</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex gap-1.5">
            {ALL_METRICS.map((m) => (
              <div
                key={m}
                title={METRIC_LABELS[m]}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  scores[m] !== undefined ? 'bg-cyan-400 shadow-[0_0_6px_rgba(0,243,255,0.6)]' : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 shrink-0">
            {Object.keys(scores).length}/6
          </span>
        </div>

        {/* Sliders form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {ALL_METRICS.map((metric) => (
              <MetricSlider
                key={metric}
                metric={metric}
                value={scores[metric] ?? null}
                onChange={handleScoreChange}
              />
            ))}
          </div>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Submit button */}
          <div className="mt-8 sticky bottom-4">
            <button
              id="submit-evaluacion-btn"
              type="submit"
              disabled={!allFilled || submitting}
              className={`
                w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest
                transition-all duration-300
                ${allFilled
                  ? 'bg-cyan-400 text-black hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] active:scale-95'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }
              `}
            >
              {submitting
                ? 'Enviando...'
                : allFilled
                  ? 'Enviar Evaluacion'
                  : `Completa ${6 - Object.keys(scores).length} métrica${6 - Object.keys(scores).length !== 1 ? 's' : ''} más`
              }
            </button>

            {!allFilled && (
              <p className="text-center text-xs text-gray-600 mt-2">
                Debes asignar un valor a las 6 métricas para enviar
              </p>
            )}
          </div>
        </form>
      </main>
    </div>
  )
}
