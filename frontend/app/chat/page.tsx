'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { AppHeader } from '@/components/AppHeader'
import { Footer } from '@/components/Footer'
import { Send, Bot, User as UserIcon, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Helper to render text with clickable links
function renderTextWithLinks(text: string) {
  // Split by URLs and internal paths
  const urlPattern = /(https?:\/\/[^\s]+)|(\/[a-z-]+)/gi
  const parts = text.split(urlPattern).filter(part => part !== undefined && part !== '')

  return parts.map((part, i) => {
    if (!part) return null

    // External URL
    if (part.match(/^https?:\/\//)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-violet-600 dark:text-fuchsia-400 hover:text-violet-700 dark:hover:text-fuchsia-300 transition-colors"
        >
          {part}
        </a>
      )
    }
    // Internal path like /tools, /cost-basis
    if (part.match(/^\/[a-z-]+$/)) {
      return (
        <Link
          key={i}
          href={part}
          className="underline text-violet-600 dark:text-fuchsia-400 hover:text-violet-700 dark:hover:text-fuchsia-300 transition-colors font-medium"
        >
          {part}
        </Link>
      )
    }
    // Regular text
    return <span key={i}>{part}</span>
  })
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  message: string
  suggestions: string[]
  can_simulate: boolean
  simulation_params: any
}

export default function ChatPage() {
  const { user, token, isLoading } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your crypto tax assistant. I can help you understand tax regulations in different countries and guide you through simulations. What would you like to know?\n\n⚠️ Remember: I provide general information only, not financial advice.'
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([
    'Which countries have 0% crypto tax?',
    'How does Portugal tax crypto?',
    'Compare France and Germany'
  ])
  const [canSimulate, setCanSimulate] = useState(false)
  const [simulationParams, setSimulationParams] = useState<any>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !token) return

    const userMessage: Message = { role: 'user', content: messageText }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: messageText,
          conversation_history: messages
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data: ChatResponse = await response.json()

      const assistantMessage: Message = { role: 'assistant', content: data.message }
      setMessages(prev => [...prev, assistantMessage])
      setSuggestions(data.suggestions)
      setCanSimulate(data.can_simulate)
      setSimulationParams(data.simulation_params)
    } catch (error: any) {
      showToast(error.message || 'Failed to send message', 'error')
    } finally {
      setIsTyping(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === 'Run simulation now' && canSimulate) {
      // Navigate to simulation with params
      const params = new URLSearchParams()
      if (simulationParams.current_country) params.set('current', simulationParams.current_country)
      if (simulationParams.target_country) params.set('target', simulationParams.target_country)
      if (simulationParams.short_term_gains) params.set('short', simulationParams.short_term_gains.toString())
      if (simulationParams.long_term_gains) params.set('long', simulationParams.long_term_gains.toString())

      router.push(`/simulations/new?${params.toString()}`)
    } else {
      sendMessage(suggestion)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-violet-200 dark:border-violet-900 border-t-violet-600 dark:border-t-fuchsia-500 rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-fuchsia-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
      <AppHeader />

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 p-3 rounded-2xl shadow-lg">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            AI Tax Assistant
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Powered by AI • Not financial advice
          </p>
        </motion.div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-violet-600 to-violet-700'
                      : 'bg-gradient-to-br from-violet-500 to-fuchsia-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <UserIcon className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </motion.div>

                {/* Message Bubble */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className={`flex-1 max-w-2xl px-5 py-4 rounded-2xl shadow-lg transition-shadow hover:shadow-xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-violet-600 to-violet-700 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p className={`text-sm whitespace-pre-wrap leading-relaxed ${message.role === 'user' ? '!text-white' : ''}`}>
                    {renderTextWithLinks(message.content)}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-4 rounded-2xl shadow-lg">
                  <div className="flex gap-1.5">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-violet-500 dark:bg-fuchsia-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-violet-500 dark:bg-fuchsia-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-violet-500 dark:bg-fuchsia-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4"
            >
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-violet-600 dark:text-fuchsia-500" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Suggested questions:
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-fuchsia-400 transition-all shadow-sm hover:shadow-md font-medium"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about crypto taxes..."
                className="flex-1 px-5 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-violet-500 dark:focus:ring-fuchsia-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-lg transition-all"
                disabled={isTyping}
              />
              <motion.button
                type="submit"
                disabled={!input.trim() || isTyping}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-semibold hover:from-violet-700 hover:to-fuchsia-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">Send</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
