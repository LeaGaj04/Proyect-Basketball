'use client'

import { MetricKey, METRIC_LABELS } from '@/lib/types'

interface MetricSliderProps {
  metric: MetricKey
  value: number | null
  onChange: (metric: MetricKey, value: number) => void
}

export default function MetricSlider({ metric, value, onChange }: MetricSliderProps) {
  const displayValue = value ?? 0
  const hasValue = value !== null

  return (
    <div className="metric-slider-container">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white uppercase tracking-widest">
            {METRIC_LABELS[metric]}
          </span>
        </div>
        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black
            transition-all duration-300
            ${hasValue
              ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/60 shadow-[0_0_15px_rgba(0,243,255,0.4)]'
              : 'bg-gray-800 text-gray-600 border border-gray-700'
            }
          `}
        >
          {hasValue ? displayValue : '–'}
        </div>
      </div>

      {/* Slider track */}
      <div className="relative">
        <input
          id={`slider-${metric}`}
          type="range"
          min={1}
          max={10}
          step={1}
          value={displayValue}
          onChange={(e) => onChange(metric, parseInt(e.target.value))}
          className="metric-range w-full h-2 appearance-none cursor-pointer rounded-full"
          style={{
            background: hasValue
              ? `linear-gradient(to right, #00f3ff ${(displayValue - 1) / 9 * 100}%, #1f2937 ${(displayValue - 1) / 9 * 100}%)`
              : '#1f2937',
          }}
          aria-label={`${METRIC_LABELS[metric]} - valor ${displayValue}`}
        />
        {/* Tick marks */}
        <div className="flex justify-between mt-1 px-0.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <span
              key={n}
              className={`text-xs transition-colors duration-200 ${
                hasValue && n <= displayValue ? 'text-cyan-400' : 'text-gray-600'
              }`}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Nota inicial */}
      {!hasValue && (
        <p className="text-xs text-gray-600 mt-1 text-center">Mueve el slider para asignar un valor</p>
      )}
    </div>
  )
}
