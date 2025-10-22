'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { AppHeader } from '@/components/AppHeader'
import { Footer } from '@/components/Footer'
import { Send, Bot, User as UserIcon, Sparkles, Plus, MessageSquare, Trash2, Menu, X } from 'lucide-react'
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
  created_at?: string
}

interface Conversation {
  id: number
  title: string
  created_at: string
  updated_at: string
  message_count: number
  last_message_preview: string | null
}

interface ChatResponse {
  conversation_id: number
  message: string
  suggestions: string[]
  can_simulate: boolean
  simulation_params: any
}

export default function ChatPage() {
  const { user, token, isLoading } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([
    'Which countries have 0% crypto tax?',
    'How does Portugal tax crypto?',
    'Compare France and Germany'
  ])
  const [canSimulate, setCanSimulate] = useState(false)
  const [simulationParams, setSimulationParams] = useState<any>({})
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load conversations on mount
  useEffect(() => {
    if (token) {
      loadConversations()
    }
  }, [token])

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId && token) {
      loadMessages(currentConversationId)
    } else {
      // No conversation selected, show welcome message
      setMessages([
        {
          role: 'assistant',
          content: 'Hi! I\'m your crypto tax assistant. I can help you understand tax regulations in different countries and guide you through simulations. What would you like to know?\n\n⚠️ Remember: I provide general information only, not financial advice.'
        }
      ])
    }
  }, [currentConversationId, token])

  const loadConversations = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load conversations')
      }

      const data: Conversation[] = await response.json()
      setConversations(data)
    } catch (error: any) {
      showToast(error.message || 'Failed to load conversations', 'error')
    }
  }

  const loadMessages = async (conversationId: number) => {
    setIsLoadingMessages(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/conversations/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to load messages')
      }

      const data: Message[] = await response.json()
      setMessages(data)
    } catch (error: any) {
      showToast(error.message || 'Failed to load messages', 'error')
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const createNewConversation = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/conversations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to create conversation')
      }

      const data = await response.json()
      setCurrentConversationId(data.id)
      await loadConversations()
      showToast('New conversation created', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to create conversation', 'error')
    }
  }

  const deleteConversation = async (conversationId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/conversations/${conversationId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete conversation')
      }

      // If deleted current conversation, clear selection
      if (conversationId === currentConversationId) {
        setCurrentConversationId(null)
        setMessages([])
      }

      await loadConversations()
      showToast('Conversation deleted', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to delete conversation', 'error')
    }
  }

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !token) return

    // Optimistically add user message to UI
    const userMessage: Message = { role: 'user', content: messageText }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      let conversationId = currentConversationId

      // If no conversation selected, use legacy endpoint that auto-creates
      if (!conversationId) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            message: messageText
          })
        })

        if (!response.ok) {
          throw new Error('Failed to get response')
        }

        const data: ChatResponse = await response.json()
        conversationId = data.conversation_id

        // Update current conversation
        setCurrentConversationId(conversationId)
        await loadConversations()

        const assistantMessage: Message = { role: 'assistant', content: data.message }
        setMessages(prev => [...prev, assistantMessage])
        setSuggestions(data.suggestions)
        setCanSimulate(data.can_simulate)
        setSimulationParams(data.simulation_params)
      } else {
        // Send to existing conversation
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/conversations/${conversationId}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              message: messageText
            })
          }
        )

        if (!response.ok) {
          throw new Error('Failed to get response')
        }

        const data: ChatResponse = await response.json()

        const assistantMessage: Message = { role: 'assistant', content: data.message }
        setMessages(prev => [...prev, assistantMessage])
        setSuggestions(data.suggestions)
        setCanSimulate(data.can_simulate)
        setSimulationParams(data.simulation_params)

        // Refresh conversations to update timestamp/preview
        await loadConversations()
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to send message', 'error')
      // Remove optimistic message on error
      setMessages(prev => prev.slice(0, -1))
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

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Conversation List */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Conversations</h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
                <button
                  onClick={createNewConversation}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-md hover:shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  New Conversation
                </button>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto p-2">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No conversations yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <motion.div
                        key={conv.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`group relative p-3 rounded-xl cursor-pointer transition-all ${
                          currentConversationId === conv.id
                            ? 'bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/20 dark:to-fuchsia-900/20 shadow-md'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                        onClick={() => setCurrentConversationId(conv.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                              {conv.title}
                            </h3>
                            {conv.last_message_preview && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                                {conv.last_message_preview}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 dark:text-slate-600">
                              <MessageSquare className="w-3 h-3" />
                              <span>{conv.message_count} messages</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteConversation(conv.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            {/* Sidebar Toggle Button */}
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </button>
            )}
            <div className="flex-1"></div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 p-3 rounded-2xl shadow-lg">
                <Bot className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              AI Tax Assistant
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Powered by Claude AI • Not financial advice
            </p>
          </div>
        </motion.div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-6">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-4 border-violet-200 dark:border-violet-900 border-t-violet-600 dark:border-t-fuchsia-500 rounded-full animate-spin"></div>
                <p className="text-slate-600 dark:text-slate-400">Loading messages...</p>
              </div>
            </div>
          ) : (
            <>
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
          </>
          )}

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
      </div>

      <Footer />
    </div>
  )
}
