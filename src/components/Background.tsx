import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Background() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const glitchVariants = {
    normal: { opacity: 0.4, scale: 1, x: 0, y: 0 },
    glitch: (custom: number) => ({
      opacity: [0.4, 0.8, 0, 0.4],
      scale: [1, 1.2, 0.8, 1],
      x: [0, 5, -5, 0],
      y: [0, -5, 5, 0],
      transition: {
        duration: 0.2,
        repeat: 2,
        repeatType: "reverse" as const,
        delay: custom * 0.01,
      }
    })
  }

  return (
    <div className="fixed inset-0 -z-10">
      {Array.from({ length: 50 }, (_, row) => (
        Array.from({ length: 50 }, (_, col) => {
          const x = (col + 1) * 32
          const y = (row + 1) * 32
          
          const distance = Math.sqrt(
            Math.pow(x - mousePosition.x, 2) + 
            Math.pow(y - mousePosition.y, 2)
          )
          
          const repelRadius = 150
          const repelStrength = 30
          const dotIndex = row * 50 + col // Unique index for each dot
          
          return (
            <motion.div
              key={`${row}-${col}`}
              custom={dotIndex}
              variants={glitchVariants}
              initial="normal"
              animate={{
                x: distance < repelRadius ? 
                  ((x - mousePosition.x) / distance) * repelStrength : 0,
                y: distance < repelRadius ? 
                  ((y - mousePosition.y) / distance) * repelStrength : 0,
                opacity: 0.4,
                scale: Math.random() > 0.997 ? [1, 1.2, 0.8, 1] : 1
              }}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: 2.5,
                height: 2.5,
                backgroundColor: '#44dd44',
                borderRadius: '50%',
                boxShadow: '0 0 5px rgba(68, 221, 68, 0.3)',
              }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 15,
                mass: 0.1
              }}
              whileHover={{
                scale: 1.5,
                opacity: 0.8,
                transition: { duration: 0.1 }
              }}
            />
          )
        })
      ))}
    </div>
  )
} 