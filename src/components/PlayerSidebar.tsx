'use client'

import { PromedioJugador } from '@/lib/types'

interface PlayerSidebarProps {
  players: PromedioJugador[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function getInitials(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function RatingBadge({ value }: { value: number }) {
  const color =
    value >= 8 ? 'text-emerald-400' :
    value >= 6 ? 'text-cyan-400' :
    value >= 4 ? 'text-yellow-400' : 'text-red-400'
  return (
    <span className={`text-xs font-bold ${color} tabular-nums`}>
      {value > 0 ? value.toFixed(1) : '–'}
    </span>
  )
}

export default function PlayerSidebar({ players, selectedId, onSelect }: PlayerSidebarProps) {
  return (
    <aside className="w-72 shrink-0 bg-[#0a0a0a] border-r border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-gray-800">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">
          Plantilla
        </h2>
        <p className="text-white font-semibold">15 Jugadores</p>
      </div>

      {/* Player list */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-1 px-2">
        {players.map((player, idx) => {
          const isActive = player.jugador_id === selectedId
          return (
            <button
              key={player.jugador_id}
              id={`player-btn-${player.jugador_id}`}
              onClick={() => onSelect(player.jugador_id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left
                transition-all duration-200 group
                ${isActive
                  ? 'bg-cyan-400/10 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,243,255,0.1)]'
                  : 'border border-transparent hover:bg-gray-800/60 hover:border-gray-700'
                }
              `}
            >
              {/* Rank */}
              <span className={`text-xs w-5 text-center shrink-0 font-bold ${isActive ? 'text-cyan-400' : 'text-gray-600'}`}>
                {idx + 1}
              </span>

              {/* Avatar */}
              <div
                className={`
                  w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black shrink-0
                  transition-all duration-200
                  ${isActive
                    ? 'bg-cyan-400/20 text-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.3)]'
                    : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'
                  }
                `}
              >
                {getInitials(player.nombre)}
              </div>

              {/* Name + avg */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                  {player.nombre.split(' ')[0]}
                </p>
                <p className="text-xs text-gray-500 truncate">{player.nombre.split(' ').slice(1).join(' ')}</p>
              </div>

              {/* Rating */}
              <div className="shrink-0 text-right">
                <RatingBadge value={Number(player.avg_general)} />
                <p className="text-xs text-gray-600">{player.total_votos}v</p>
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 w-0.5 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(0,243,255,0.8)]" />
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
