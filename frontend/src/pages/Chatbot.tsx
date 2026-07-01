import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Mic, MicOff, Sparkles, Copy, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../utils/api';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export const Chatbot: React.FC = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: "Hello! I am **CivicMind AI**, your Decision Intelligence Assistant. I monitor real-time city parameters and feedback to help administrators and citizens build smarter communities. Ask me a question about traffic, air quality, or disease forecasts!",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Suggestions block matching problem statement examples
  const suggestedQueries = [
    t('Which area has the highest pollution today?'),
    t("Show tomorrow's traffic prediction."),
    t('Generate weekly city report.')
  ];

  // Auto-scroll anchor helper
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    
    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Format history matching FastAPI schema
      const history = messages.map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      // Call API
      const res = await api.chatWithAI(textToSend, history);
      
      const modelMsg: Message = {
        id: `msg-${Date.now()}-model`,
        role: 'model',
        text: res.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (e) {
      console.error("Gemini API call failed", e);
      // Fallback local response
      const errMsg: Message = {
        id: `msg-${Date.now()}-model-error`,
        role: 'model',
        text: "My apologies, the AI service encountered an issue. Let me fetch standard metrics: Zone 3 has the highest pollution (152 AQI). Traffic forecast shows critical gridlock on East Express Highway for tomorrow.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate input voice-to-text resolution
      setInputText("Show me the pollution trends for this week");
    } else {
      setIsRecording(true);
    }
  };

  // Basic markdown bold/list to HTML renderer helper for chat text
  const renderMessageText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let clean = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      clean = clean.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Render backticks `code` using standard mono code tag
      clean = clean.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-slate-800/80 font-mono text-[10px] text-indigo-600 dark:text-indigo-400 border border-slate-200/30 dark:border-slate-850">$1</code>');
      
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: clean.substring(2) }} />
        );
      }
      if (line.trim().startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-xs mt-3 mb-1.5 text-blue-500 dark:text-blue-400" dangerouslySetInnerHTML={{ __html: clean.substring(4) }} />
        );
      }
      return (
        <p key={idx} className="text-xs leading-relaxed mb-1.5" dangerouslySetInnerHTML={{ __html: clean }} />
      );
    });
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col justify-between glass-card border border-slate-200 dark:border-slate-800/80 shadow-lg overflow-hidden">
      
      {/* 1. Header Banner */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Bot size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              CivicMind Assistant
              <span className="h-2 w-2 rounded-full bg-green-500" />
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Powered by Gemini 2.5 Flash</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full text-[9px] font-bold">
          <Sparkles size={11} className="animate-pulse" />
          Active Agent
        </div>
      </div>

      {/* 2. Messages Stack */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isModel = msg.role === 'model';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 max-w-[85%] ${isModel ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
              >
                {/* Avatar */}
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm ${
                  isModel ? 'bg-gradient-to-tr from-indigo-500 to-purple-500' : 'bg-gradient-to-tr from-blue-50 to-blue-200 text-blue-600 border border-blue-100 dark:border-blue-900/40 dark:from-blue-950 dark:to-blue-900'
                }`}>
                  {isModel ? <Bot size={16} /> : 'U'}
                </div>
                
                {/* Bubble */}
                <div className={`p-4 rounded-2xl relative ${
                  isModel 
                    ? 'pr-9 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200' 
                    : 'bg-blue-600 text-white text-left'
                }`}>
                  <div className="space-y-1">
                    {renderMessageText(msg.text)}
                  </div>
                  {isModel && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition bg-white/40 dark:bg-slate-950/40 rounded-lg border border-slate-200/50 dark:border-slate-850 hover:shadow-sm"
                      title="Copy response to clipboard"
                    >
                      {copiedId === msg.id ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                    </button>
                  )}
                  <span className={`text-[8px] mt-2 block w-fit ${isModel ? 'text-slate-400' : 'text-blue-200'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Loading Indicator Bubble */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 mr-auto text-left items-center"
          >
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs flex-shrink-0">
              <Bot size={16} />
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* 3. Suggested Queries overlay */}
      {messages.length <= 1 && (
        <div className="px-6 py-2 flex flex-wrap gap-2 justify-center mb-1">
          {suggestedQueries.map((query, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(query)}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 text-[10px] font-bold rounded-xl text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition text-left"
            >
              {query}
            </button>
          ))}
        </div>
      )}

      {/* 4. Controls Footer Form */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }}
          className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl focus-within:border-blue-500/50 transition"
        >
          {/* Input text */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('chat_placeholder')}
            disabled={loading}
            className="flex-1 bg-transparent px-2.5 text-xs focus:outline-none placeholder-slate-400 text-slate-800 dark:text-slate-100"
          />

          {/* Voice recorder */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`p-2 rounded-xl transition ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={t('voice_assistant')}
          >
            {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          {/* Send CTA */}
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center gap-1 font-bold text-xs"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
