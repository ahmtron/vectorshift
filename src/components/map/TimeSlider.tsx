'use client'

import { useEffect } from 'react'
import { useMapStore } from '@/hooks/useMapStore'
import { cn } from '@/lib/utils/cn'

export function TimeSlider() {
  const { activeYear, isPlaying, playSpeed, setYear, startPlaying, stopPlaying, advanceYear, setPlaySpeed } = useMapStore()

  const MIN_YEAR = 1981
  const MAX_YEAR = 2050
  const PROJECTED_START = 2024

  useEffect(() => {
    if (!isPlaying) return
    const PLAY_SPEEDS = { slow: 800, normal: 500, fast: 250 } as const
    const interval = setInterval(advanceYear, PLAY_SPEEDS[playSpeed])
    return () => clearInterval(interval)
  }, [isPlaying, playSpeed, advanceYear])

  const pct = ((activeYear - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100
  const projectedPct = ((PROJECTED_START - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-background-secondary/90 backdrop-blur-md border-t border-border-subtle px-3 md:px-6 py-3 md:py-4 pointer-events-none">
      <div className="flex items-center justify-between mb-2 md:mb-3 pointer-events-none">
        <div className="flex items-center gap-2 md:gap-3 pointer-events-none">
          <button
            onClick={() => {
              if (activeYear >= MAX_YEAR) setYear(MIN_YEAR)
              if (isPlaying) stopPlaying()
              else startPlaying()
            }}
            className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-accent-400 hover:bg-accent-300 text-background-primary flex items-center justify-center transition-colors pointer-events-auto"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <span className="text-xs">❚❚</span> : <span className="text-xs">▶</span>}
          </button>
          <button onClick={() => { stopPlaying(); setYear(MIN_YEAR) }} className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-border-default text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors pointer-events-auto" aria-label="Reset">
            <span className="text-xs">⏮</span>
          </button>
          <div className="hidden md:flex items-center gap-1">
            {(['slow', 'normal', 'fast'] as const).map((speed) => (
              <button key={speed} onClick={() => setPlaySpeed(speed)} className={cn('text-xs px-2 py-1 rounded transition-colors pointer-events-auto', playSpeed === speed ? 'bg-border-default text-text-primary' : 'text-text-tertiary hover:text-text-secondary')}>
                {speed === 'slow' ? '0.5×' : speed === 'normal' ? '1×' : '2×'}
              </button>
            ))}
          </div>
        </div>
        <div className="font-mono text-xl md:text-2xl font-bold text-text-primary">
          {activeYear}
          {activeYear > 2023 && <span className="text-accent-400 text-xs font-normal ml-1 md:ml-2">PROJECTED</span>}
        </div>
        <div className="hidden md:flex gap-4 text-text-tertiary text-xs font-mono">
          <span>{MIN_YEAR}</span>
          <span>NOW: {PROJECTED_START}</span>
          <span>{MAX_YEAR}</span>
        </div>
      </div>
      <div className="relative h-5 md:h-6 flex items-center pointer-events-none">
        <div className="absolute w-full h-1 bg-border-default rounded-full" />
        <div className="absolute h-1 bg-accent-400 rounded-full" style={{ width: `${Math.min(pct, projectedPct)}%` }} />
        {pct > projectedPct && (
          <div className="absolute h-1 rounded-r-full" style={{ left: `${projectedPct}%`, width: `${pct - projectedPct}%`, background: 'repeating-linear-gradient(90deg, #F5A623 0px, #F5A623 4px, transparent 4px, transparent 8px)' }} />
        )}
        <div className="absolute flex flex-col items-center" style={{ left: `${projectedPct}%`, transform: 'translateX(-50%)' }}>
          <div className="w-px h-2 md:h-3 bg-text-tertiary" />
          <span className="text-text-tertiary text-[10px] md:text-xs mt-0.5">NOW</span>
        </div>
        <input type="range" min={MIN_YEAR} max={MAX_YEAR} value={activeYear} onChange={(e) => { stopPlaying(); setYear(parseInt(e.target.value)) }} className="absolute w-full opacity-0 cursor-pointer h-5 md:h-6 z-10 pointer-events-auto" aria-label="Select year" />
        <div className="absolute w-7 h-7 md:w-8 md:h-8 rounded-full bg-accent-400 border-2 border-background-primary flex items-center justify-center shadow-glow-accent pointer-events-none -translate-x-1/2" style={{ left: `${pct}%` }}>
          <span className="text-background-primary text-[10px] md:text-xs font-mono font-bold">{String(activeYear).slice(2)}</span>
        </div>
      </div>
    </div>
  )
}
