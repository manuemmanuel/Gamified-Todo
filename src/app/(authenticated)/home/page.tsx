'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowRight, FiCheck, FiStar, FiAward, FiZap, FiHeart } from 'react-icons/fi'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Typewriter from 'typewriter-effect'

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
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Array<{ x: number; y: number; speed: number; size: number }>>([])
  const [activeSection, setActiveSection] = useState('hero')
  
  // List of sections in order
  const sections = ['hero', 'how-it-works', 'features', 'about']

  useEffect(() => {
    setMounted(true)
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  // Initialize particles with larger size and more count
  useEffect(() => {
    if (!canvasRef.current) return
    
    particlesRef.current = Array.from({ length: 100 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: 0.2 + Math.random() * 0.5,
      size: 2 + Math.random() * 3
    }))
  }, [])

  // Animate particles with higher opacity
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = window.innerWidth
    canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw and update particles with higher opacity
    ctx.fillStyle = 'rgba(68, 221, 68, 0.4)' // Increased opacity
    particlesRef.current.forEach(particle => {
      // Move particle up
      particle.y -= particle.speed
      // Reset position if particle goes off screen
      if (particle.y < 0) {
        particle.y = canvas.height
        particle.x = Math.random() * canvas.width
      }
      // Draw particle
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
    })
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      
      const currentIndex = sections.indexOf(activeSection)
      if (e.deltaY > 0 && currentIndex < sections.length - 1) {
        // Scrolling down
        const nextSection = sections[currentIndex + 1]
        document.getElementById(nextSection)?.scrollIntoView({ behavior: 'smooth' })
        setActiveSection(nextSection)
      } else if (e.deltaY < 0 && currentIndex > 0) {
        // Scrolling up
        const prevSection = sections[currentIndex - 1]
        document.getElementById(prevSection)?.scrollIntoView({ behavior: 'smooth' })
        setActiveSection(prevSection)
      }
    }

    // Add wheel event listener with passive: false to prevent default
    window.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [mounted, activeSection])

  // Handle keyboard navigation
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = sections.indexOf(activeSection)
      
      if (e.key === 'ArrowDown' && currentIndex < sections.length - 1) {
        e.preventDefault()
        const nextSection = sections[currentIndex + 1]
        document.getElementById(nextSection)?.scrollIntoView({ behavior: 'smooth' })
        setActiveSection(nextSection)
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault()
        const prevSection = sections[currentIndex - 1]
        document.getElementById(prevSection)?.scrollIntoView({ behavior: 'smooth' })
        setActiveSection(prevSection)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mounted, activeSection])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  const howItWorksData = [
    {
      icon: <FiCheck className="w-8 h-8" />,
      title: "Create Daily Quests",
      description: "Transform your tasks into daily quests with rewards and experience points.",
      details: [
        "Set custom rewards and XP for each task",
        "Create recurring daily challenges",
        "Add difficulty levels to tasks",
        "Track completion streaks"
      ]
    },
    {
      icon: <FiStar className="w-8 h-8" />,
      title: "Gain Experience",
      description: "Complete quests to earn XP and level up your character.",
      details: [
        "Earn XP for completed tasks",
        "Level up your character",
        "Unlock new abilities and features",
        "Track your progress over time"
      ]
    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: "Track Progress",
      description: "Monitor your growth with detailed statistics and achievements.",
      details: [
        "View detailed completion stats",
        "Earn achievement badges",
        "Compare daily and weekly progress",
        "Set and track personal goals"
      ]
    }
  ]

  if (!mounted) {
    return <div className="min-h-screen bg-[#111111]"></div>
  }

  return (
    <AnimatePresence>
      {mounted && (
        <div className="min-h-screen bg-[#111111] overflow-hidden">
          {/* Navigation with active indicators */}
          <motion.nav 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-[#111111]/90 backdrop-blur-sm border-b border-[#44dd44]/20"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <span className="font-['Press_Start_2P'] text-[#44dd44] text-sm">Quest Master</span>
                <div className="flex items-center gap-8">
                  <div className="hidden md:flex items-center gap-8">
                    {[
                      { name: 'Home', id: 'hero' },
                      { name: 'How It Works', id: 'how-it-works' },
                      { name: 'Features', id: 'features' },
                      { name: 'About', id: 'about' }
                    ].map((item) => (
                      <motion.button
                        key={item.id}
                        onClick={() => {
                          document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
                          setActiveSection(item.id)
                        }}
                        className={`text-sm transition-colors ${
                          activeSection === item.id ? 'text-[#44dd44]' : 'text-[#888888] hover:text-[#44dd44]'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {item.name}
                      </motion.button>
                    ))}
                  </div>
                  {user && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 px-4 py-2 bg-[#222222] rounded-lg border border-[#44dd44]/20"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#44dd44] flex items-center justify-center text-[#111111] font-bold">
                        {user.email?.[0].toUpperCase()}
                      </div>
                      <span className="text-[#888888] text-sm hidden sm:block">
                        {user.email?.split('@')[0]}
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.nav>

          <div className="snap-y snap-mandatory h-screen overflow-y-scroll">
            {sections.map((section) => (
              <div key={section} className="snap-start h-screen">
                <section 
                  id={section}
                  className={`h-screen flex items-center transition-opacity duration-500 ${
                    activeSection === section ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  {section === 'hero' && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-4xl mx-auto"
                      >
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-['Press_Start_2P'] text-[#44dd44] mb-12">
                          <Typewriter
                            options={{
                              strings: ['Level Up Your Life', 'Begin Your Quest', 'Master Your Tasks'],
                              autoStart: true,
                              loop: true,
                              delay: 80,
                              deleteSpeed: 50,
                              cursor: '|',
                              wrapperClassName: "font-['Press_Start_2P']"
                            }}
                          />
                        </h1>
                        <p className="text-[#888888] text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto mb-16">
                          Transform your daily tasks into epic quests. Track your progress, earn rewards, and become the hero of your own story.
                        </p>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-block"
                        >
                          <Link href="/dailies">
                            <button className="px-12 py-6 bg-[#44dd44] text-[#111111] rounded-lg font-['Press_Start_2P'] text-base
                                           hover:bg-[#66ff66] transition-colors duration-200 flex items-center gap-3">
                              Start Your Journey <FiArrowRight className="text-xl" />
                            </button>
                          </Link>
                        </motion.div>
                      </motion.div>
                    </div>
                  )}

                  {section === 'how-it-works' && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <h2 className="text-2xl md:text-3xl font-['Press_Start_2P'] text-[#44dd44] text-center mb-16">
                        How It Works
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {howItWorksData.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ 
                              scale: 1.05,
                              transition: { duration: 0.2 }
                            }}
                            className="bg-[#222222] p-8 rounded-xl border-2 border-[#44dd44] text-center
                               hover:bg-[#1d1d1d] transition-all duration-300 group cursor-pointer
                               min-h-[320px] flex flex-col justify-center"
                          >
                            {/* Default content */}
                            <div className="group-hover:hidden h-full flex flex-col justify-center">
                              <div className="text-[#44dd44] mb-6 flex justify-center">
                                <motion.div
                                  animate={{ rotate: [0, 360] }}
                                  transition={{ duration: 0.5, delay: 0.1 }}
                                >
                                  {item.icon}
                                </motion.div>
                              </div>
                              <h3 className="font-['Press_Start_2P'] text-[#44dd44] text-lg mb-6">{item.title}</h3>
                              <p className="text-[#888888]">
                                {item.description}
                              </p>
                            </div>
                            
                            {/* Hover content */}
                            <div className="hidden group-hover:block h-full">
                              <h3 className="font-['Press_Start_2P'] text-[#44dd44] text-lg mb-8">{item.title}</h3>
                              <ul className="text-left space-y-4">
                                {item.details.map((detail, idx) => (
                                  <motion.li
                                    key={idx}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-center gap-3 text-[#888888]"
                                  >
                                    <FiCheck className="text-[#44dd44] flex-shrink-0" />
                                    <span>{detail}</span>
                                  </motion.li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {section === 'features' && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <h2 className="text-2xl md:text-3xl font-['Press_Start_2P'] text-[#44dd44] text-center mb-12">
                        Epic Features
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature) => (
                          <Link href={feature.path} key={feature.path}>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="relative border-2 bg-[#1a1a1a] p-6 rounded-xl h-full
                                   hover:bg-[#222222] transition-colors duration-200"
                              style={{ borderColor: feature.color }}
                            >
                              <div className="relative z-10">
                                <span className="text-4xl mb-4 block">{feature.icon}</span>
                                <h3 className="font-['Press_Start_2P'] text-lg mb-2" style={{ color: feature.color }}>
                                  {feature.title}
                                </h3>
                                <p className="text-[#888888]">{feature.description}</p>
                              </div>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {section === 'about' && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                        >
                          <h2 className="text-2xl md:text-3xl font-['Press_Start_2P'] text-[#44dd44] mb-6">
                            About Quest Master
                          </h2>
                          <p className="text-[#888888] mb-4">
                            Quest Master is more than just a task manager - it's a gamified productivity system designed to make your daily routines more engaging and rewarding.
                          </p>
                          <p className="text-[#888888] mb-6">
                            With features like daily streaks, experience points, and level progression, you'll stay motivated to achieve your goals while having fun along the way.
                          </p>
                          <div className="flex items-center gap-4 text-[#44dd44]">
                            <FiZap className="w-6 h-6" />
                            <span className="font-['Press_Start_2P'] text-sm">Join the Adventure</span>
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          className="bg-[#222222] p-8 rounded-xl border-2 border-[#44dd44]"
                        >
                          <div className="space-y-4">
                            {[
                              "Daily Quest System",
                              "Experience Points & Leveling",
                              "Achievement Tracking",
                              "Streak Bonuses",
                              "AI-Powered Insights",
                              "Social Features"
                            ].map((feature, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <FiCheck className="text-[#44dd44]" />
                                <span className="text-[#888888]">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            ))}
          </div>

          {/* Footer */}
          <footer className="bg-[#111111]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="font-['Press_Start_2P'] text-[#44dd44] text-sm mb-4">Quest Master</h3>
                  <p className="text-[#888888] text-sm">Level up your productivity with gamified task management.</p>
                </div>
                <div>
                  <h3 className="font-['Press_Start_2P'] text-[#44dd44] text-sm mb-4">Features</h3>
                  <ul className="space-y-2 text-sm text-[#888888]">
                    <li>Daily Quests</li>
                    <li>Experience System</li>
                    <li>Achievement Tracking</li>
                    <li>Social Features</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-['Press_Start_2P'] text-[#44dd44] text-sm mb-4">Resources</h3>
                  <ul className="space-y-2 text-sm text-[#888888]">
                    <li>Documentation</li>
                    <li>API</li>
                    <li>Support</li>
                    <li>Community</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-['Press_Start_2P'] text-[#44dd44] text-sm mb-4">Connect</h3>
                  <ul className="space-y-2 text-sm text-[#888888]">
                    <li>Twitter</li>
                    <li>Discord</li>
                    <li>GitHub</li>
                    <li>Blog</li>
                  </ul>
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-[#333333] text-center">
                <p className="text-[#888888] text-sm">
                  Made with <FiHeart className="inline text-[#44dd44]" /> by Team - 13
                </p>
              </div>
            </div>
          </footer>
        </div>
      )}
    </AnimatePresence>
  )
} 