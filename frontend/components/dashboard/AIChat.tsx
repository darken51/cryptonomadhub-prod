import { memo, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bot, User as UserIcon, Send, Loader2, ArrowRight } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default memo(function AIChat({ token }: { token: string | null }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI guide for CryptoNomadHub 🌍\n\nI can help with:\n• DeFi wallet audits & tax reports\n• Tax-loss harvesting opportunities\n• Cost basis tracking (FIFO/LIFO/HIFO)\n• Country comparisons (160 jurisdictions)\n• Crypto cards & tools\n• Complete platform navigation\n\n⚠️ General information only - Not financial or legal advice."
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !token) return

    const userMessage: Message = { role: 'user', content: messageText }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const payload: any = { message: messageText }
      if (conversationId) payload.conversation_id = conversationId

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      if (!conversationId && data.conversation_id) {
        setConversationId(data.conversation_id)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (error) {
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsTyping(false)
    }
  }

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-12"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bot className="w-8 h-8 text-violet-400" />
            AI Assistant - Crypto Tax Guide
          </h2>
          <p className="text-slate-400 mt-2">DeFi audits • Tax optimization • 160 countries • Cost basis • Tools • Info only - Not advice</p>
        </div>
        <Link
          href="/chat"
          className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-2"
        >
          Full view
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
        {/* Messages */}
        <div ref={containerRef} className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-2xl px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-white text-slate-900 shadow-xl'
                    : 'bg-white text-slate-900 shadow-lg border-4 border-red-600'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-slate-700 px-4 py-3 rounded-2xl shadow-lg border border-slate-600">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="p-4 border-t border-slate-700 bg-slate-800/30">
          <div className="mb-2 px-2">
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span>⚠️</span>
              <span>General information only • Not financial or legal advice</span>
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: What are Portugal's tax data?"
              className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.section>
  )
})
