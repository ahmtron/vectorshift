'use client'

import * as React from 'react'

function cn(...classes: (string | boolean | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const currentValue = value ?? min

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange?.(Number(e.target.value))
    }

    const percentage = ((currentValue - min) / (max - min)) * 100

    return (
      <div className={cn('relative flex w-full touch-none select-none items-center', className)}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          className="absolute w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-400 [&::-webkit-slider-thumb]:shadow-glow-accent [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background-primary [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent-400 [&::-moz-range-thumb]:shadow-glow-accent [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background-primary"
          {...props}
        />
        <div className="absolute h-1 rounded-full bg-border-default" style={{ width: '100%' }} />
        <div
          className="absolute h-1 rounded-full bg-accent-400 transition-none"
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }
)
Slider.displayName = 'Slider'

export { Slider }
