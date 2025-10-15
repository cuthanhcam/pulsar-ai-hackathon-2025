'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  opacity: number
  pulse: number
}

interface DataStream {
  x: number
  y: number
  speed: number
  length: number
  opacity: number
}

export default function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const dataStreamsRef = useRef<DataStream[]>([])
  const animationFrameRef = useRef<number>()
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    // Create particles
    const createParticles = () => {
      const particles: Particle[] = []
      const particleCount = 50

      for (let i = 0; i < particleCount; i++) {
        const isOrange = Math.random() > 0.7
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          radius: isOrange ? (Math.random() * 2 + 2) : (Math.random() * 1.5 + 0.8),
          color: isOrange ? '#f97316' : '#3b82f6',
          opacity: isOrange ? (Math.random() * 0.4 + 0.6) : (Math.random() * 0.3 + 0.4),
          pulse: Math.random() * Math.PI * 2
        })
      }
      return particles
    }

    // Create data streams
    const createDataStreams = () => {
      const streams: DataStream[] = []
      for (let i = 0; i < 8; i++) {
        streams.push({
          x: Math.random() * canvas.width,
          y: -50,
          speed: Math.random() * 2 + 1,
          length: Math.random() * 100 + 50,
          opacity: Math.random() * 0.5 + 0.3
        })
      }
      return streams
    }

    particlesRef.current = createParticles()
    dataStreamsRef.current = createDataStreams()

    // Draw grid
    const drawGrid = () => {
      const gridSize = 50
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.08)'
      ctx.lineWidth = 1

      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }

    // Draw hexagon
    const drawHexagon = (x: number, y: number, radius: number, opacity: number) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i
        const hx = x + radius * Math.cos(angle)
        const hy = y + radius * Math.sin(angle)
        if (i === 0) ctx.moveTo(hx, hy)
        else ctx.lineTo(hx, hy)
      }
      ctx.closePath()
      ctx.strokeStyle = `rgba(249, 115, 22, ${opacity})`
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // Draw scanning line
    const drawScanLine = (time: number) => {
      const y = ((time * 0.5) % canvas.height)
      const gradient = ctx.createLinearGradient(0, y - 20, 0, y + 20)
      gradient.addColorStop(0, 'rgba(249, 115, 22, 0)')
      gradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.3)')
      gradient.addColorStop(1, 'rgba(249, 115, 22, 0)')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, y - 20, canvas.width, 40)
    }

    // Animation loop
    const animate = () => {
      timeRef.current += 1
      
      // Clear with fade
      ctx.fillStyle = 'rgba(9, 9, 11, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      drawGrid()

      // Draw scanning line
      drawScanLine(timeRef.current)

      const particles = particlesRef.current
      const streams = dataStreamsRef.current

      // Update and draw data streams
      streams.forEach((stream, i) => {
        stream.y += stream.speed

        if (stream.y > canvas.height + stream.length) {
          stream.y = -50
          stream.x = Math.random() * canvas.width
        }

        // Draw stream
        const gradient = ctx.createLinearGradient(stream.x, stream.y - stream.length, stream.x, stream.y)
        gradient.addColorStop(0, 'rgba(249, 115, 22, 0)')
        gradient.addColorStop(0.5, `rgba(249, 115, 22, ${stream.opacity})`)
        gradient.addColorStop(1, 'rgba(249, 115, 22, 0)')
        
        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(stream.x, stream.y - stream.length)
        ctx.lineTo(stream.x, stream.y)
        ctx.stroke()

        // Draw dots on stream
        for (let j = 0; j < 5; j++) {
          const dotY = stream.y - (stream.length / 5) * j
          ctx.beginPath()
          ctx.arc(stream.x, dotY, 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(249, 115, 22, ${stream.opacity * 0.8})`
          ctx.fill()
        }
      })

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Move particle
        particle.x += particle.vx
        particle.y += particle.vy
        particle.pulse += 0.05

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))

        // Draw connections with tech style
        particles.forEach((otherParticle, j) => {
          if (i >= j) return

          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const maxDistance = 180

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.4
            
            // Draw line
            ctx.beginPath()
            ctx.strokeStyle = particle.color === '#f97316' 
              ? `rgba(249, 115, 22, ${opacity})`
              : `rgba(59, 130, 246, ${opacity * 0.5})`
            ctx.lineWidth = 1
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.stroke()

            // Draw midpoint pulse
            if (opacity > 0.25) {
              const midX = (particle.x + otherParticle.x) / 2
              const midY = (particle.y + otherParticle.y) / 2
              ctx.beginPath()
              ctx.arc(midX, midY, 1.5, 0, Math.PI * 2)
              ctx.fillStyle = `rgba(249, 115, 22, ${opacity * 0.8})`
              ctx.fill()
            }
          }
        })

        // Pulsing radius
        const pulseRadius = particle.radius + Math.sin(particle.pulse) * 0.5

        // Draw particle with hexagon
        if (particle.color === '#f97316' && particle.radius > 2) {
          drawHexagon(particle.x, particle.y, pulseRadius * 3, particle.opacity * 0.3)
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, pulseRadius, 0, Math.PI * 2)
        ctx.fillStyle = particle.color === '#f97316' 
          ? `rgba(249, 115, 22, ${particle.opacity})`
          : `rgba(59, 130, 246, ${particle.opacity})`
        ctx.fill()

        // Draw outer ring
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, pulseRadius + 1, 0, Math.PI * 2)
        ctx.strokeStyle = particle.color === '#f97316' 
          ? `rgba(249, 115, 22, ${particle.opacity * 0.5})`
          : `rgba(59, 130, 246, ${particle.opacity * 0.3})`
        ctx.lineWidth = 1
        ctx.stroke()

        // Draw glow
        if (particle.color === '#f97316') {
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, pulseRadius + 6, 0, Math.PI * 2)
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, pulseRadius + 6
          )
          gradient.addColorStop(0, `rgba(249, 115, 22, ${particle.opacity * 0.4})`)
          gradient.addColorStop(1, 'rgba(249, 115, 22, 0)')
          ctx.fillStyle = gradient
          ctx.fill()
        }
      })

      // Draw corner brackets (tech UI style)
      const cornerSize = 20
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.3)'
      ctx.lineWidth = 2
      
      // Top-left
      ctx.beginPath()
      ctx.moveTo(30, 30 + cornerSize)
      ctx.lineTo(30, 30)
      ctx.lineTo(30 + cornerSize, 30)
      ctx.stroke()
      
      // Top-right
      ctx.beginPath()
      ctx.moveTo(canvas.width - 30 - cornerSize, 30)
      ctx.lineTo(canvas.width - 30, 30)
      ctx.lineTo(canvas.width - 30, 30 + cornerSize)
      ctx.stroke()

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateCanvasSize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'transparent' }}
    />
  )
}


