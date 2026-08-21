'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { setSession, setAdminAuthenticated, getSession } from '@/lib/auth'
import { Jugador } from '@/lib/types'

export default function HomePage() {
  const router = useRouter()
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAdmin, setShowAdmin] = useState(false)
  const [adminPass, setAdminPass] = useState('')
  const [adminError, setAdminError] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    const session = getSession()
    if (session) router.replace('/votar')
  }, [router])

  // Fetch players
  useEffect(() => {
    fetch('/api/jugadores')
      .then((r) => r.json())
      .then((d) => setJugadores(d.jugadores ?? []))
      .catch(() => setError('No se pudieron cargar los jugadores'))
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId || pin.length !== 4) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jugador_id: selectedId, pin }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error de autenticación')
        return
      }
      setSession(data.jugador)
      router.push('/votar')
    } catch {
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault()
    setAdminError('')
    const res = await fetch('/api/auth/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPass }),
    })
    if (res.ok) {
      setAdminAuthenticated()
      // Store password for admin API calls (used as x-admin-token header)
      sessionStorage.setItem('ADMIN_PASSWORD', adminPass)
      router.push('/admin')
    } else {
      setAdminError('Contraseña incorrecta')
    }
  }

  return (
    <main className="min-h-screen bg-black bg-grid flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow blobs removed */}

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 shadow-[0_0_30px_rgba(0,243,255,0.15)] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight glow-text-cyan">
            Sports Survey
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Evaluación de equipo · Temporada 2024</p>
        </div>

        {/* Login Card */}
        {!showAdmin ? (
          <div className="glass-card p-8">
            <h2 className="text-lg font-bold text-white mb-6">Acceso de Jugador</h2>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Player selector */}
              <div>
                <label htmlFor="jugador-select" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Selecciona tu nombre
                </label>
                <select
                  id="jugador-select"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-gray-700 text-white rounded-xl px-4 py-3
                    focus:outline-none focus:border-cyan-400/60 focus:shadow-[0_0_15px_rgba(0,243,255,0.15)]
                    transition-all duration-200 appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>Elige tu jugador...</option>
                  {jugadores.map((j) => (
                    <option key={j.id} value={j.id}>{j.nombre}</option>
                  ))}
                </select>
              </div>

              {/* PIN */}
              <div>
                <label htmlFor="pin-input" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  PIN (4 dígitos)
                </label>
                <input
                  id="pin-input"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  pattern="\d{4}"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full bg-[#0d0d0d] border border-gray-700 text-white rounded-xl px-4 py-3
                    text-center text-2xl tracking-[0.5em] letter-spacing-widest
                    focus:outline-none focus:border-cyan-400/60 focus:shadow-[0_0_15px_rgba(0,243,255,0.15)]
                    transition-all duration-200 placeholder:text-gray-700 placeholder:tracking-normal"
                  required
                />
                <p className="text-xs text-gray-600 mt-1 text-center">PIN por defecto: 1234</p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading || !selectedId || pin.length !== 4}
                className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest
                  bg-cyan-400 text-black transition-all duration-200
                  hover:bg-cyan-300 hover:shadow-[0_0_25px_rgba(0,243,255,0.5)]
                  disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none
                  active:scale-95"
              >
                {loading ? 'Verificando...' : 'Entrar al Sistema'}
              </button>
            </form>

            {/* Admin link */}
            <div className="mt-6 pt-5 border-t border-gray-800 text-center">
              <button
                id="admin-access-btn"
                onClick={() => setShowAdmin(true)}
                className="text-xs text-gray-600 hover:text-cyan-400 transition-colors duration-200"
              >
                Acceso Administrador
              </button>
            </div>
          </div>
        ) : (
          /* Admin login panel */
          <div className="glass-card p-8">
            <button
              onClick={() => { setShowAdmin(false); setAdminPass(''); setAdminError('') }}
              className="text-gray-500 hover:text-white text-sm mb-5 flex items-center gap-2 transition-colors"
            >
              ← Volver
            </button>
            <h2 className="text-lg font-bold text-white mb-2">Panel de Administrador</h2>
            <p className="text-gray-500 text-sm mb-6">Acceso restringido al dashboard de estadísticas</p>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-pass-input" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Contraseña
                </label>
                <input
                  id="admin-pass-input"
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="Contraseña de administrador"
                  className="w-full bg-[#0d0d0d] border border-gray-700 text-white rounded-xl px-4 py-3
                    focus:outline-none focus:border-cyan-400/60 focus:shadow-[0_0_15px_rgba(0,243,255,0.15)]
                    transition-all duration-200 placeholder:text-gray-700"
                  required
                />
              </div>

              {adminError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
                  {adminError}
                </div>
              )}

              <button
                id="admin-login-btn"
                type="submit"
                disabled={!adminPass}
                className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest
                  border border-cyan-400/50 text-cyan-400 transition-all duration-200
                  hover:bg-cyan-400/10 hover:shadow-[0_0_20px_rgba(0,243,255,0.2)]
                  disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Acceder al Dashboard
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-gray-700 text-xs mt-6">
          Sports Survey v1.0 · Todos los derechos reservados
        </p>
      </div>
    </main>
  )
}
