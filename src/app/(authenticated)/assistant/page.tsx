'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      console.log('Sending chat request')
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ message: userMessage.content })
      })

      const data = await response.json()
      console.log('Received response:', data)

      if (!response.ok) {
        console.error('Response not OK:', response.status, data)
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      if (!data.response) {
        console.error('Invalid response data:', data)
        throw new Error('Invalid response from server')
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: Date.now()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = () => {
    setMessages([])
    setShowClearConfirm(false)
  }

  return (
    <div className="min-h-screen bg-[#111111] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" passHref>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-[#44dd44] font-pixel text-xs md:text-sm 
                           px-4 py-2 border-2 border-[#44dd44] rounded-lg
                           hover:bg-[#44dd44] hover:text-[#111111]
                           transition-colors duration-200"
              >
                ← Back to Dashboard
              </motion.button>
            </Link>
            {messages.length > 0 && !showClearConfirm && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowClearConfirm(true)}
                className="text-red-500 font-pixel text-xs md:text-sm 
                           px-4 py-2 border-2 border-red-500 rounded-lg
                           hover:bg-red-500 hover:text-[#111111]
                           transition-colors duration-200"
              >
                Clear Chat
              </motion.button>
            )}
            {showClearConfirm && (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClearChat}
                  className="text-red-500 font-pixel text-xs md:text-sm 
                             px-4 py-2 border-2 border-red-500 rounded-lg
                             hover:bg-red-500 hover:text-[#111111]
                             transition-colors duration-200"
                >
                  Confirm Clear
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowClearConfirm(false)}
                  className="text-[#44dd44] font-pixel text-xs md:text-sm 
                             px-4 py-2 border-2 border-[#44dd44] rounded-lg
                             hover:bg-[#44dd44] hover:text-[#111111]
                             transition-colors duration-200"
                >
                  Cancel
                </motion.button>
              </div>
            )}
          </div>
          <h1 className="text-[#44dd44] font-pixel text-lg md:text-xl">AI Assistant</h1>
        </div>

        {/* Chat Container */}
        <div className="border-2 border-[#44dd44] rounded-lg bg-[#1a1a1a] overflow-hidden
                      shadow-lg shadow-[#44dd44]/10">
          {/* Messages Area */}
          <div className="h-[65vh] overflow-y-auto p-6 space-y-6 
                        scrollbar-thin scrollbar-thumb-[#44dd44] scrollbar-track-[#222222]">
            {messages.length === 0 && (
              <div className="text-center text-[#44dd44]/50 font-pixel text-sm">
                Start a conversation with your AI assistant...
              </div>
            )}
            {messages.map((message, index) => (
              <motion.div
                key={message.timestamp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-[#44dd44] text-[#111111] rounded-tr-none'
                      : 'bg-[#222222] text-[#44dd44] rounded-tl-none border border-[#44dd44]/30'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none
                                  prose-p:text-[#44dd44] prose-headings:text-[#44dd44]
                                  prose-a:text-[#44dd44] prose-strong:text-[#44dd44]
                                  prose-code:text-[#44dd44] prose-pre:bg-[#1a1a1a]">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-[#222222] text-[#44dd44] px-4 py-3 rounded-2xl rounded-tl-none
                              border border-[#44dd44]/30">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-[#44dd44] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#44dd44] rounded-full animate-bounce" 
                         style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-[#44dd44] rounded-full animate-bounce" 
                         style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t-2 border-[#44dd44] bg-[#1a1a1a] p-4">
            <form onSubmit={handleSubmit} className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-[#222222] text-[#44dd44] px-4 py-3 rounded-xl
                         border-2 border-[#333333] focus:border-[#44dd44] 
                         outline-none transition-colors duration-200
                         placeholder-[#44dd44]/30 font-pixel text-sm"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="px-6 py-3 bg-[#44dd44] text-[#111111] rounded-xl font-pixel
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-[#66ff66] transition-colors duration-200
                         shadow-lg hover:shadow-xl text-sm whitespace-nowrap"
              >
                {isLoading ? 'Sending...' : 'Send Message'}
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
