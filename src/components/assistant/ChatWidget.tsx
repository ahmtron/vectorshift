'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MessageSquare, X, Send, Loader2 } from 'lucide-react'

const SUGGESTED = [
  'Which countries are most at risk for dengue by 2050?',
  'Compare malaria risk in Brazil vs Nigeria',
  'What climate factors drive Lyme disease spread?',
]

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hello! I\'m the VectorShift Assistant. Ask me anything about climate-driven disease risk.' }
  ])
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => Math.random().toString(36).slice(2))
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: text }])
    setLoading(true)
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, session_id: sessionId }),
      })
      const json = await res.json()
      if (json.success) {
        setMessages(m => [...m, { role: 'assistant', content: json.data.answer }])
      } else {
        setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I couldn\'t process that request.' }])
      }
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Network error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div suppressHydrationWarning>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-24 md:bottom-20 right-4 z-40 w-[calc(100vw-32px)] max-w-[360px] max-h-[min(520px,calc(100vh-140px))] bg-background-secondary border border-border-subtle rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border-subtle">
              <div>
                <h3 className="font-display font-semibold text-text-primary text-sm">VectorShift Assistant</h3>
                <p className="text-xs text-text-tertiary">Research intelligence, not medical advice</p>
              </div>
               <button onClick={() => setIsOpen(false)} className="p-1 text-text-tertiary hover:text-text-primary" aria-label="Close chat">
                  <span className="darkreader-ignore">
                    <X size={16} />
                  </span>
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 overscroll-behavior-contain">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-accent-400 text-background-primary' : 'bg-background-primary border border-border-subtle text-text-secondary'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-background-primary border border-border-subtle rounded-xl px-3 py-2 text-text-secondary flex items-center gap-2">
                    <span className="darkreader-ignore">
                      <Loader2 size={14} className="animate-spin" />
                    </span>
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED.map((s) => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="text-xs bg-background-primary border border-border-subtle rounded-full px-3 py-1.5 text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 border-t border-border-subtle">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Ask about disease risk..."
                  className="flex-1 h-9 rounded-md border border-border-default bg-background-primary px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-border-strong"
                />
                <button onClick={send} disabled={loading || !input.trim()} className="h-9 w-9 rounded-md bg-accent-400 hover:bg-accent-300 disabled:opacity-50 text-background-primary flex items-center justify-center transition-colors" aria-label="Send">
                  <span className="darkreader-ignore">
                    <Send size={14} />
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full bg-accent-400 hover:bg-accent-300 text-background-primary shadow-lg flex items-center justify-center transition-colors"
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
      >
        <span className="darkreader-ignore">
          {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
        </span>
      </motion.button>
    </div>
  )
}
