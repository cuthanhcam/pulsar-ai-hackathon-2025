'use client'

import { useEffect, useRef } from 'react'

export default function TechCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Particles
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      alpha: number
      color: string
    }> = []

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.3,
        color: Math.random() > 0.7 ? '#f97316' : '#ffffff'
      })
    }

    // Grid lines
    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
      ctx.lineWidth = 1

      const gridSize = 50
      
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

    // Tech lines (diagonal and curved)
    const techLines: Array<{
      x1: number
      y1: number
      x2: number
      y2: number
      progress: number
      speed: number
    }> = []

    // Create tech lines
    for (let i = 0; i < 15; i++) {
      techLines.push({
        x1: Math.random() * canvas.width,
        y1: Math.random() * canvas.height,
        x2: Math.random() * canvas.width,
        y2: Math.random() * canvas.height,
        progress: Math.random(),
        speed: Math.random() * 0.002 + 0.001
      })
    }

    let animationFrame: number

    const animate = () => {
      // Clear with fade effect
      ctx.fillStyle = 'rgba(9, 9, 11, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      drawGrid()

      // Draw tech lines
      techLines.forEach(line => {
        line.progress += line.speed
        if (line.progress > 1) line.progress = 0

        const currentX = line.x1 + (line.x2 - line.x1) * line.progress
        const currentY = line.y1 + (line.y2 - line.y1) * line.progress

        // Glowing line
        const gradient = ctx.createLinearGradient(line.x1, line.y1, currentX, currentY)
        gradient.addColorStop(0, 'rgba(249, 115, 22, 0)')
        gradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.3)')
        gradient.addColorStop(1, 'rgba(249, 115, 22, 0)')

        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(line.x1, line.y1)
        ctx.lineTo(currentX, currentY)
        ctx.stroke()

        // Particle at end
        ctx.fillStyle = 'rgba(249, 115, 22, 0.8)'
        ctx.beginPath()
        ctx.arc(currentX, currentY, 3, 0, Math.PI * 2)
        ctx.fill()

        // Glow
        const glowGradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, 10)
        glowGradient.addColorStop(0, 'rgba(249, 115, 22, 0.3)')
        glowGradient.addColorStop(1, 'rgba(249, 115, 22, 0)')
        ctx.fillStyle = glowGradient
        ctx.fillRect(currentX - 10, currentY - 10, 20, 20)
      })

      // Update and draw particles
      particles.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Draw particle
        ctx.fillStyle = particle.color === '#f97316' 
          ? `rgba(249, 115, 22, ${particle.alpha})`
          : `rgba(255, 255, 255, ${particle.alpha})`
        
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Glow for orange particles
        if (particle.color === '#f97316') {
          const glowGradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 4
          )
          glowGradient.addColorStop(0, 'rgba(249, 115, 22, 0.2)')
          glowGradient.addColorStop(1, 'rgba(249, 115, 22, 0)')
          ctx.fillStyle = glowGradient
          ctx.fillRect(
            particle.x - particle.size * 4,
            particle.y - particle.size * 4,
            particle.size * 8,
            particle.size * 8
          )
        }
      })

      // Draw connections
      const maxDistance = 150
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.3
            ctx.strokeStyle = `rgba(249, 115, 22, ${opacity})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: '#09090b' }}
    />
  )
}

