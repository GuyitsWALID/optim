'use client'

import { useEffect, useState, useRef } from 'react'

interface Position {
  x: number
  y: number
}

const TRAIL_LENGTH = 5

export function MouseFollower() {
  const [positionHistory, setPositionHistory] = useState<Position[]>([])
  const [mounted, setMounted] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const lastUpdateRef = useRef<number>(0)

  useEffect(() => {
    setMounted(true)
    const pointerFine = window.matchMedia('(pointer: fine)').matches
    if (!pointerFine) return
    setEnabled(true)

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      // Throttle updates to create smoother, more organic movement
      if (now - lastUpdateRef.current < 16) return
      lastUpdateRef.current = now

      const newPosition = { x: e.clientX, y: e.clientY }

      setPositionHistory((prev) => {
        const updated = [...prev, newPosition]
        if (updated.length > TRAIL_LENGTH) {
          return updated.slice(-TRAIL_LENGTH)
        }
        return updated
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  if (!mounted || !enabled) return null

  const trailPositions = Array.from({ length: TRAIL_LENGTH }, (_, i) => {
    const historyIndex = positionHistory.length - TRAIL_LENGTH + i
    if (historyIndex >= 0 && positionHistory[historyIndex]) {
      return positionHistory[historyIndex]
    }
    // If not enough history, use the last known position
    if (positionHistory.length > 0) {
      return positionHistory[positionHistory.length - 1]
    }
    return { x: -1000, y: -1000 }
  })

  return (
    <>
      {trailPositions.map((pos, index) => (
        <div
          key={index}
          className={`mouse-trail mouse-trail-${index + 1}`}
          style={{
            left: pos.x,
            top: pos.y,
          }}
        />
      ))}
    </>
  )
}
