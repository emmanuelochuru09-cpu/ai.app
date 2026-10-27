import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  Bot,
  Send,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  User,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AssistantView: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      content: `Hello ${user?.fullName.split(' ')[0]}! I'm your SellPilot Business Advisor. I'm tailored specifically for **${user?.businessName}** (${user?.businessType}).\n\nI can help you build customer acquisition funnels, handle tricky buyer objections on WhatsApp, structure seasonal promotions, or optimize your marketing angles. What business challenge are we solving today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.askAssistant(apiMessages, `Current Business: ${user?.businessName}, Category: ${user?.businessType}`);
      const botMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...newHistory, botMsg]);
      refreshUser();
    } catch (err: any) {
      setError(err?.message || 'Advisor request failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    'How can I get more paying customers on WhatsApp this week?',
    'A customer said my price is too high. How should I reply?',
    'What promotional campaign could I run for the upcoming weekend?',
    'What should my 5-post content strategy be this week?',
    'How do I turn one-time buyers into repeat VIP clients?',
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 shrink-0">
        <div className="text-xs text-slate-400">
          <span>Strategic AI Consultant</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Personalized to {user?.businessName}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
          AI Business Advisor
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Pragmatic growth strategy, sales psychology, pricing tactics, and customer communication advice.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-center gap-2 shrink-0">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="flex-1 bg-[#0B101B] border border-slate-800 rounded-xl p-4 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-200 space-y-2'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
              <div className="flex items-center justify-between gap-4 mt-2 pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                <span>{m.timestamp}</span>
                {m.role === 'assistant' && (
                  <button
                    onClick={() => copyMessage(m.content, m.id)}
                    className="hover:text-white flex items-center gap-1 transition-colors"
                  >
                    {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                )}
              </div>
            </div>

            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Analyzing business context and formulating advice...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="text-[11px] font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors hover:text-white disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about marketing, pricing, customer retention for ${user?.businessName}...`}
          disabled={loading}
          className="flex-1 bg-[#0B101B] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-colors shrink-0 shadow-sm"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
