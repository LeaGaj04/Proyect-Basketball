'use client'

interface StatsCardProps {
  label: string
  value: string | number
  icon: string
  sub?: string
  highlight?: boolean
}

export default function StatsCard({ label, value, icon, sub, highlight = false }: StatsCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-5
        bg-[#0d0d0d] border transition-all duration-300
        ${highlight
          ? 'border-cyan-400/40 shadow-[0_0_25px_rgba(0,243,255,0.1)]'
          : 'border-gray-800 hover:border-gray-700'
        }
      `}
    >
      {/* Glow blob for highlight cards */}
      {highlight && (
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-cyan-400/10 rounded-full blur-2xl" />
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          {icon && <span className="text-2xl">{icon}</span>}
          {highlight && (
            <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/30">
              TOP
            </span>
          )}
        </div>
        <p className="text-3xl font-black text-white mb-1 tabular-nums">{value}</p>
        <p className="text-sm font-semibold text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
      </div>
    </div>
  )
}
