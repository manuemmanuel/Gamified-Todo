'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface FeatureCard {
  title: string
  description: string
  icon: string
  path: string
  color: string
}

const features: FeatureCard[] = [
  {
    title: 'Calendar',
    description: 'Plan and schedule your future tasks',
    icon: '📅',
    path: '/calendar',
    color: '#44dd44'
  },
  {
    title: 'Quests',
    description: 'Generate AI-powered challenges',
    icon: '⚔️',
    path: '/quests',
    color: '#dd44dd'
  },
  {
    title: 'Dailies',
    description: 'Complete your daily challenges',
    icon: '📝',
    path: '/dailies',
    color: '#44dddd'
  },
  {
    title: 'Todos',
    description: 'Manage your personal task list',
    icon: '✅',
    path: '/todos',
    color: '#dddd44'
  },
  {
    title: 'Stats',
    description: 'Track your progress and growth',
    icon: '📊',
    path: '/stats',
    color: '#dd4444'
  },
  {
    title: 'AI Reports',
    description: 'Get personalized insights',
    icon: '🤖',
    path: '/reports',
    color: '#4444dd'
  },
  {
    title: 'Streaks',
    description: 'Monitor your consistency',
    icon: '🔥',
    path: '/streaks',
    color: '#dd7744'
  },
  {
    title: 'AI Assistant',
    description: 'Chat with your AI companion',
    icon: '💬',
    path: '/assistant',
    color: '#44dd88'
  },
  {
    title: 'Avatar',
    description: 'Customize your character',
    icon: '👤',
    path: '/avatar',
    color: '#dd44aa'
  },
  {
    title: 'Rewards',
    description: 'Unlock new items and abilities',
    icon: '🏆',
    path: '/rewards',
    color: '#88dd44'
  },
  {
    title: 'Social',
    description: 'Connect with other users',
    icon: '🌐',
    path: '/social',
    color: '#4488dd'
  },
  {
    title: 'Messages',
    description: 'Chat with other users',
    icon: '✉️',
    path: '/messages',
    color: '#dd8844'
  }
]

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Return null on first render to avoid hydration mismatch
  if (!mounted) {
    return <div className="min-h-screen bg-[#111111]"></div>
  }

  return (
    <AnimatePresence>
      {mounted && (
        <div className="min-h-screen bg-[#111111] p-4 sm:p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 sm:mb-8">
              <h1 className="text-[#44dd44] font-['Press_Start_2P'] text-xl sm:text-2xl">COMMAND CENTER</h1>
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-[#111111] border-2 border-[#44dd44] 
                             text-[#44dd44] font-['Press_Start_2P'] text-sm sm:text-base
                             hover:bg-[#44dd44] hover:text-[#111111] transition-colors
                             shadow-[4px_4px_0px_0px_#44dd44]"
                >
                  ← DASHBOARD
                </motion.button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {features.map((feature) => (
                <Link href={feature.path} key={feature.path}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative border-2 bg-[#111111] p-4 sm:p-6 h-full
                               before:absolute before:inset-0 before:bg-[linear-gradient(45deg,transparent_25%,rgba(68,221,68,0.1)_50%,transparent_75%)] 
                               before:bg-[length:200%_200%] before:animate-gradient overflow-hidden group"
                    style={{ borderColor: feature.color, boxShadow: `4px 4px 0px 0px ${feature.color}` }}
                  >
                    <div className="relative z-10">
                      <span className="text-3xl sm:text-4xl mb-3 sm:mb-4 block">{feature.icon}</span>
                      <h2 className="font-['Press_Start_2P'] text-base sm:text-lg mb-2" style={{ color: feature.color }}>
                        {feature.title}
                      </h2>
                      <p className="text-[#888888] text-xs sm:text-sm">{feature.description}</p>
                    </div>

                    {/* Decorative corners */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l transition-all duration-300 group-hover:w-3 sm:group-hover:w-4 group-hover:h-3 sm:group-hover:h-4" 
                         style={{ borderColor: feature.color }} />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r transition-all duration-300 group-hover:w-3 sm:group-hover:w-4 group-hover:h-3 sm:group-hover:h-4"
                         style={{ borderColor: feature.color }} />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l transition-all duration-300 group-hover:w-3 sm:group-hover:w-4 group-hover:h-3 sm:group-hover:h-4"
                         style={{ borderColor: feature.color }} />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-all duration-300 group-hover:w-3 sm:group-hover:w-4 group-hover:h-3 sm:group-hover:h-4"
                         style={{ borderColor: feature.color }} />
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
} 