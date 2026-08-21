import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  Trash2,
  BrainCircuit,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';

const AIAssistant = () => {
  const { addToast } = useToast();
  
  // Tab states
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'insights'

  // Insights State
  const [insights, setInsights] = useState('');
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Chat State
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your SmartFinance AI Advisor. 
      I can help you review your budgets, analyze your category spending, and suggest ways to save.
      
      What would you like to ask today? For example, "Am I spending too much on Dining?" or "How can I improve my savings rate?"`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  // Load Insights on tab switch if empty
  const handleLoadInsights = async () => {
    if (insights) return;
    try {
      setLoadingInsights(true);
      const response = await api.get('/ai/insights');
      setInsights(response.data.insights || 'Failed to generate insights.');
      setLoadingInsights(false);
      addToast('Spending analysis generated!', 'success');
    } catch (error) {
      console.error(error);
      setInsights('Failed to connect to the AI service. Verify your Gemini API configuration.');
      setLoadingInsights(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setSendingMessage(true);

    try {
      // Map message history to send to API
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await api.post('/ai/chat', {
        message: userMsg.content,
        history: historyPayload,
      });

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.reply || 'Sorry, I encountered an issue.',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      addToast('AI Assistant failed to reply', 'error');
      
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I had trouble connecting to my brain. Please check your backend configurations and API key status.',
        },
      ]);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear your conversation history?')) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "Hello again! Conversation history cleared. How can I help you manage your finances now?",
        },
      ]);
      addToast('Chat history cleared', 'info');
    }
  };

  // Custom regex Markdown renderer to output clean styles
  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let cleanLine = line.trim();
      
      // Header check
      if (cleanLine.startsWith('###')) {
        return (
          <h4 key={idx} className="text-sm font-extrabold text-brand-600 dark:text-brand-400 mt-4 mb-1.5 pl-1">
            {cleanLine.replace('###', '').trim()}
          </h4>
        );
      }
      if (cleanLine.startsWith('##')) {
        return (
          <h3 key={idx} className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-5 mb-2 pl-1 border-l-2 border-brand-500">
            {cleanLine.replace('##', '').trim()}
          </h3>
        );
      }
      if (cleanLine.startsWith('#')) {
        return (
          <h2 key={idx} className="text-lg font-black text-slate-900 dark:text-white mt-6 mb-3 pl-1">
            {cleanLine.replace('#', '').trim()}
          </h2>
        );
      }
      
      // Bold text parser: **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      // Check if line is bullet point
      const isBullet = cleanLine.startsWith('*') || cleanLine.startsWith('-');
      if (isBullet) {
        cleanLine = cleanLine.replace(/^[\s*-]+/, '').trim();
      }

      while ((match = boldRegex.exec(cleanLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(cleanLine.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="font-bold text-slate-905 dark:text-slate-100">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < cleanLine.length) {
        parts.push(cleanLine.substring(lastIndex));
      }

      if (isBullet) {
        return (
          <li key={idx} className="ml-5 list-disc text-sm text-slate-650 dark:text-slate-350 leading-relaxed mb-1.5 pl-1">
            {parts.length > 0 ? parts : cleanLine}
          </li>
        );
      }

      if (cleanLine.startsWith('>')) {
        return (
          <blockquote key={idx} className="border-l-4 border-brand-500 pl-4 py-1.5 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 rounded-r-2xl my-3 text-sm">
            {cleanLine.replace('>', '').trim()}
          </blockquote>
        );
      }

      if (cleanLine === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
          {parts.length > 0 ? parts : cleanLine}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-[78vh] animate-fade-in space-y-4">
      
      {/* NAVIGATION TABS */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 shrink-0">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 pb-2.5 text-sm font-bold tracking-wide border-b-2 transition duration-200 cursor-pointer ${
              activeTab === 'chat'
                ? 'border-brand-650 text-brand-650'
                : 'border-transparent text-slate-450 dark:text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4.5 h-4.5" />
            <span>Interactive Chat</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('insights');
              handleLoadInsights();
            }}
            className={`flex items-center gap-2 pb-2.5 text-sm font-bold tracking-wide border-b-2 transition duration-200 cursor-pointer ${
              activeTab === 'insights'
                ? 'border-brand-650 text-brand-650'
                : 'border-transparent text-slate-450 dark:text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4.5 h-4.5" />
            <span>AI Spending Insights</span>
          </button>
        </div>

        {activeTab === 'chat' && (
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-800 hover:border-rose-350 dark:hover:border-rose-900/40 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl text-slate-500 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* TAB CONTENT: INTERACTIVE CHAT */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-4 max-w-[85%] ${
                  m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${
                  m.role === 'user'
                    ? 'bg-brand-50 border-brand-200 dark:bg-brand-950 dark:border-brand-850 text-brand-600 dark:text-brand-450'
                    : 'bg-success-light border-success/20 text-success-dark dark:text-success'
                }`}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-3xl ${
                  m.role === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-900'
                }`}>
                  <div className="space-y-1 text-sm leading-relaxed">
                    {m.role === 'user' ? (
                      <p className="whitespace-pre-wrap font-semibold">{m.content}</p>
                    ) : (
                      renderMarkdown(m.content)
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* AI is thinking bubble */}
            {sendingMessage && (
              <div className="flex gap-4 max-w-[80%]">
                <div className="w-9 h-9 rounded-xl bg-success-light border border-success/20 text-success-dark dark:text-success flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-900 p-4 rounded-3xl rounded-tl-none flex items-center gap-2 text-slate-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-600 dark:text-brand-400" />
                  <span className="font-semibold italic">SmartFinance is analyzing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Form input controls */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3 shrink-0">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about your category budgets, savings rates, or expense reduction tips..."
              className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-800 dark:text-slate-100 outline-none placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-500 transition shadow-sm"
              disabled={sendingMessage}
            />
            <button
              type="submit"
              disabled={sendingMessage || !inputMessage.trim()}
              className="px-5 bg-brand-650 hover:bg-brand-700 disabled:bg-slate-850 disabled:text-slate-500 text-white rounded-2xl shadow-md transition duration-200 flex items-center justify-center cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* TAB CONTENT: AI INSIGHTS REPORT */}
      {activeTab === 'insights' && (
        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm relative">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-brand-650 flex items-center justify-center text-white">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-slate-100">Audit Insights Report</h3>
                <p className="text-xs text-slate-450 dark:text-slate-400">Personalized spending behavior diagnostics</p>
              </div>
            </div>

            <button
              onClick={() => {
                setInsights('');
                handleLoadInsights();
              }}
              disabled={loadingInsights}
              className="flex items-center gap-1.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-brand-500/30 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Regenerate Audit</span>
            </button>
          </div>

          {loadingInsights ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3.5">
              <Loader2 className="w-10 h-10 text-brand-600 dark:text-brand-400 animate-spin" />
              <div className="text-center space-y-1">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-300">Auditing transaction logs...</span>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">AI is matching limits, category expenses, and constructing savings projections.</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-2 prose dark:prose-invert">
              {renderMarkdown(insights)}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default AIAssistant;
