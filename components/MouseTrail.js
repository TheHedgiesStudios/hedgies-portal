// components/MouseTrail.js
import { useEffect, useRef, useState } from 'react'

export default function MouseTrail() {
  const [points, setPoints] = useState([])
  const [time, setTime] = useState(0)
  const frameRef = useRef(null)

  // Track mouse positions
  useEffect(() => {
    function handleMove(e) {
      const now = performance.now()
      setPoints(prev => {
        const next = [...prev, { x: e.clientX, y: e.clientY, t: now }]
        const MAX_POINTS = 24
        return next.slice(-MAX_POINTS)
      })
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  // Fade out points over time
  useEffect(() => {
    const MAX_AGE = 260 // ms

    function loop() {
      const now = performance.now()
      setTime(now)
      setPoints(prev => prev.filter(p => now - p.t < MAX_AGE))
      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  const MAX_AGE = 260
  const now = time

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      {points.map((p, idx) => {
        const age = now - p.t
        const life = Math.max(0, 1 - age / MAX_AGE)
        const size = 14 + life * 8
        const blur = 8 + life * 10

        return (
          <div
            key={`${p.t}-${idx}`}
            className="absolute rounded-full"
            style={{
              left: p.x - size / 2,
              top: p.y - size / 2,
              width: size,
              height: size,
              background:
                'radial-gradient(circle, rgba(129,212,250,1) 0%, rgba(3,169,244,0.35) 40%, rgba(3,169,244,0) 70%)',
              opacity: life,
              filter: `blur(${blur}px)`,
            }}
          />
        )
      })}
    </div>
  )
}
