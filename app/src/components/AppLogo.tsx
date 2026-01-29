'use client'

import Image from 'next/image'

interface AppLogoProps {
  /** Size in pixels (width and height) */
  size?: number
  className?: string
}

/**
 * Picks Predictor app logo — light/dark via CSS (no flash on load).
 * Use everywhere for consistent branding (sidebar, headers, landing).
 */
export function AppLogo({ size = 48, className = '' }: AppLogoProps) {
  return (
    <div
      className={`relative shrink-0 bg-white border-2 border-ink dark:bg-black dark:border-cream overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/picks-predictor-light.svg"
        alt="Picks Predictor"
        fill
        className="object-contain p-0.5 dark:hidden"
        sizes={`${size}px`}
        priority
      />
      <Image
        src="/picks-predictor-dark.svg"
        alt="Picks Predictor"
        fill
        className="object-contain p-0.5 hidden dark:block"
        sizes={`${size}px`}
        priority
      />
    </div>
  )
}
