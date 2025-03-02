'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Background from '@/components/Background'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [username, setUsername] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  const frameGlitchOrigins = Array(6).fill(0).map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    isBrighter: Math.random() > 0.5
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let result;
      if (isSignUp) {
        result = await supabase.auth.signUp({
          email,
          password,
        })
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        })
      }
      
      if (result.error) throw result.error

      setUsername(email.split('@')[0])
      setShowWelcome(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    }
  }

  const glitchVariants = {
    initial: { skew: 0, opacity: 1, x: 0 },
    glitch: {
      skew: [0, -2],
      opacity: [1, 0.75],
      x: [0, -15],
      filter: [
        'brightness(100%) contrast(100%)',
        'brightness(300%) contrast(200%)',
      ],
      transition: {
        duration: 0.08,
        repeat: 1,
        repeatType: "reverse" as const,
        repeatDelay: Math.random() * 2 + 0.5,
        ease: "circOut"
      }
    }
  }

  const titleGlitchVariants = {
    initial: { textShadow: "none", x: 0 },
    glitch: {
      textShadow: [
        "none",
        "-4px 0 #ff0000, 2px 0 #0000ff",
      ],
      x: [0, -4],
      transition: {
        duration: 0.05,
        repeat: 1,
        repeatType: "reverse" as const,
        repeatDelay: Math.random() * 2 + 0.5,
        ease: "circOut"
      }
    }
  }

  const scanlineVariants = {
    animate: {
      y: [0, 800],
      opacity: [0.5, 0.2],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }

  const frameGlitchVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: [0, 0.8, 0.2, 0.4, 0],
      x: [-2, 1, -1, 2, -1],
      y: [1, -1, 2, -1, 1],
      scale: [1, 1.01, 0.99, 1.01, 1],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        repeatDelay: Math.random() * 0.2,
        ease: "linear"
      }
    }
  }

  return (
    <main className="relative min-h-screen font-['Press_Start_2P'] overflow-hidden">
      <Background />
      
      <div className="fixed inset-0 bg-gradient-to-b from-[#00220011] via-[#44dd4422] to-[#00220011] animate-pulse" />
      
      <motion.div
        className="fixed inset-0 bg-gradient-to-b from-transparent via-[#44dd4410] to-transparent pointer-events-none"
        style={{ height: '2px' }}
        variants={scanlineVariants}
        animate="animate"
      />

      <div className="flex min-h-screen items-center justify-center px-4">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="relative w-full max-w-md space-y-8 border-4 border-[#44dd44] bg-[#111111] p-8 shadow-[4px_4px_0px_0px_#44dd44] overflow-hidden
                     before:absolute before:inset-0 before:bg-[linear-gradient(45deg,transparent_25%,rgba(68,221,68,0.1)_50%,transparent_75%)] before:bg-[length:200%_200%] before:animate-gradient"
        >
          <>
            {frameGlitchOrigins.map((origin, i) => (
              <motion.div
                key={i}
                variants={frameGlitchVariants}
                initial="initial"
                animate="animate"
                className={`absolute inset-0 border-2 opacity-0
                           ${origin.isBrighter ? 'border-[#88ff88]' : 'border-[#44dd44]'}`}
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                  filter: 'blur(0.5px)',
                  transformOrigin: `${origin.x}% ${origin.y}%`,
                }}
              />
            ))}
            
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#44dd44]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#44dd44]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#44dd44]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#44dd44]" />
          </>

          <motion.div
            className="absolute inset-0 bg-[#44dd44] mix-blend-overlay pointer-events-none opacity-60"
            initial="initial"
            animate="glitch"
            variants={glitchVariants}
          />

          <motion.div
            className="absolute inset-0 bg-[#111111] mix-blend-multiply pointer-events-none opacity-80"
            initial="initial"
            animate="glitch"
            variants={{
              ...glitchVariants,
              glitch: {
                ...glitchVariants.glitch,
                x: [0, -12],
                transition: {
                  ...glitchVariants.glitch.transition,
                  repeatDelay: Math.random() * 2 + 0.3,
                }
              }
            }}
          />

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="mt-6 text-center text-3xl tracking-tight text-[#44dd44] relative z-10">
              <motion.span
                className="inline-block relative"
                initial="initial"
                animate="glitch"
                variants={titleGlitchVariants}
              >
                PLAYER LOGIN
              </motion.span>
            </h2>
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-center relative"
            >
              <span className="text-[#44dd44] opacity-70 text-xs tracking-[0.2em] relative">
                <span className="absolute -left-2 top-0 w-2 h-full bg-[#111111]" />
                <span className="absolute -right-2 top-0 w-2 h-full bg-[#111111]" />
                {'< SYSTEM v2.0.4 >'}
              </span>
            </motion.div>
          </motion.div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="off">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-2 border-[#ff4444] bg-[#331111] p-4 text-sm text-[#ff4444] shadow-[2px_2px_0px_0px_#ff4444]
                           relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[#ff4444] opacity-10 animate-pulse" />
                {error}
              </motion.div>
            )}
            
            <div className="space-y-4">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative block w-full border-2 border-[#44dd44] bg-[#111111] p-2 text-[#44dd44] font-['Press_Start_2P'] 
                           placeholder:text-[#227722] focus:border-[#88ff88] focus:outline-none focus:ring-0 
                           transition-all hover:shadow-[0_0_10px_#44dd44] focus:shadow-[0_0_15px_#44dd44]"
                  placeholder="EMAIL ADDRESS"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#44dd44] animate-pulse" />
              </motion.div>

              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative block w-full border-2 border-[#44dd44] bg-[#111111] p-2 text-[#44dd44] font-['Press_Start_2P'] 
                           placeholder:text-[#227722] focus:border-[#88ff88] focus:outline-none focus:ring-0 
                           transition-all hover:shadow-[0_0_10px_#44dd44] focus:shadow-[0_0_15px_#44dd44]"
                  placeholder="PASSWORD"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#44dd44] animate-pulse" />
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px #44dd44" }}
                whileTap={{ scale: 0.95 }}
                className="group relative flex w-full justify-center border-4 border-[#44dd44] bg-[#111111] px-3 py-2 
                         text-sm text-[#44dd44] hover:bg-[#44dd44] hover:text-[#111111] transition-all
                         before:absolute before:inset-0 before:bg-[linear-gradient(45deg,transparent_25%,rgba(68,221,68,0.1)_50%,transparent_75%)] 
                         before:bg-[length:200%_200%] before:animate-gradient"
              >
                {isSignUp ? 'REGISTER' : 'START GAME'}
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full border-4 border-[#44dd44] bg-[#222222] px-4 py-3 mt-4
                          text-[#44dd44] text-sm font-bold hover:text-[#111111] hover:bg-[#44dd44]
                          transition-all hover:shadow-[0_0_20px_#44dd44] shadow-[4px_4px_0px_0px_#44dd44]
                          relative z-20"
              >
                {isSignUp ? '← BACK TO LOGIN' : 'NEW PLAYER? SIGN UP →'}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {showWelcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-black/90" />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
            className="relative max-w-2xl w-full bg-[#111111] border-4 border-[#44dd44] p-8 text-center
                       shadow-[0_0_20px_rgba(68,221,68,0.5)] overflow-hidden"
          >
            <motion.div
              animate={{
                background: [
                  'radial-gradient(circle at center, #44dd4410 0%, transparent 50%)',
                  'radial-gradient(circle at center, #44dd4430 0%, transparent 50%)',
                  'radial-gradient(circle at center, #44dd4410 0%, transparent 50%)',
                ],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0"
            />
            
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <h2 className="text-[#44dd44] text-4xl mb-4">SYSTEM INITIALIZED</h2>
              <div className="text-[#44dd44] text-xl mb-2">
                <span className="text-[#88ff88]">{username.toUpperCase()}</span> DETECTED
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-[#44dd44] text-lg mb-8 leading-relaxed space-y-4"
            >
              <p>
                "Greetings, {username}. I am ARIA, the Arcadian Neural Interface."
              </p>
              <p>
                "In the heart of chaos lies the seed of order."
              </p>
              <p>
                "The realm of <span className="text-[#88ff88]">ARCADIA</span> beckons, 
                and you have been chosen as the <span className="text-[#ff4444] font-bold">CHAOS BRINGER</span>."
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-[#44dd44]/80 text-sm italic mb-8"
            >
              "Your journey begins now. Will you answer the call?"
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={() => {
                setShowWelcome(false)
                router.push('/dashboard')
                router.refresh()
              }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px #44dd44" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 border-2 border-[#44dd44] bg-black text-[#44dd44] 
                         hover:bg-[#44dd44] hover:text-black transition-all
                         shadow-[0_0_10px_rgba(68,221,68,0.3)]
                         relative overflow-hidden group"
            >
              <span className="relative z-10">INITIALIZE NEURAL LINK</span>
              <div className="absolute inset-0 bg-[#44dd44] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </motion.button>

            {/* Terminal-style blinking cursor */}
            <motion.div
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="absolute bottom-4 right-4 w-3 h-6 bg-[#44dd44]"
            />

            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#44dd44]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#44dd44]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#44dd44]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#44dd44]" />
          </motion.div>
        </motion.div>
      )}
    </main>
  )
}
