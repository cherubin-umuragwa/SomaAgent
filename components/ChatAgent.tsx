'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types';

interface Props {
  schoolName?: string;
}

const ChatAgent: React.FC<Props> = ({ schoolName = "School" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: `### Welcome to Soma-Agent 🤖
      
Hello! I am your AI study specialist. To begin our session at **${schoolName}**, here is our **O-Level Biology Syllabus** overview:

1. **Cell Biology** (The building blocks)
2. **Plant Nutrition** (Photosynthesis & Growth)
3. **Human Transport** (Circulatory System)
4. **Coordination** (Nervous & Endocrine)
5. **Homeostasis** (Internal Balance)

> "Knowledge is like a garden: if it is not cultivated, it cannot be harvested."

Which of these specialized areas would you like to master today?` 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = inputValue;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          context: `Student at ${schoolName}`,
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I ran into a connection issue. Let's try again in a moment!" 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.trim().startsWith('###')) {
        return <h3 key={i} className="font-bold text-base md:text-lg mt-2 mb-1 text-blue-900 border-b border-slate-100 pb-1">{line.replace('###', '').trim()}</h3>;
      }
      let formattedLine: any = line;
      if (line.includes('**')) {
        const parts = line.split('**');
        formattedLine = parts.map((part, index) => 
          index % 2 === 1 ? <strong key={index} className="text-blue-900 font-bold">{part}</strong> : part
        );
      }
      if (line.trim().startsWith('>')) {
        return <blockquote key={i} className="border-l-4 border-yellow-400 pl-3 italic my-2 text-slate-500 bg-slate-50 py-1 text-xs md:text-sm">{line.replace('>', '').trim()}</blockquote>;
      }
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ') || /^\d+\./.test(line.trim())) {
        return <li key={i} className="ml-4 list-disc mb-1 text-xs md:text-sm">{formattedLine}</li>;
      }

      return <p key={i} className="mb-2 leading-relaxed text-xs md:text-sm">{formattedLine}</p>;
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 md:bottom-10 right-4 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-yellow-400 text-blue-900 rounded-full shadow-2xl flex items-center justify-center text-2xl md:text-3xl z-50 hover:scale-110 active:scale-95 transition-all border-4 border-white"
      >
        {isOpen ? '❌' : '🤖'}
      </button>

      {isOpen && (
        <div className="fixed bottom-0 md:bottom-24 right-0 md:right-10 left-0 md:left-auto md:w-[450px] h-[100dvh] md:h-[600px] bg-white rounded-none md:rounded-[40px] shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-5">
          <div className="bg-blue-900 p-4 md:p-6 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-inner transform rotate-3">🤖</div>
              <div>
                <h3 className="font-bold text-sm md:text-base tracking-tight">Soma-Agent</h3>
                <p className="text-[8px] md:text-[10px] text-yellow-400 font-black uppercase tracking-widest leading-none">AI Mastery Specialist</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               <button onClick={() => setIsOpen(false)} className="md:hidden text-white text-xl ml-4">✕</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-slate-50/50 scrollbar-thin pb-24 md:pb-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[90%] p-4 md:p-5 rounded-[24px] md:rounded-[28px] text-sm shadow-xl shadow-slate-200/50
                  ${msg.role === 'user' ? 'bg-blue-900 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`}
                >
                  {msg.role === 'assistant' ? renderContent(msg.content) : <p className="text-xs md:text-sm">{msg.content}</p>}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-3 md:p-4 rounded-2xl rounded-tl-none shadow-sm flex space-x-2 items-center">
                  <div className="w-1.5 h-1.5 bg-blue-900/20 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-900/40 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-blue-900/60 rounded-full animate-bounce delay-150"></div>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-2">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 md:p-6 bg-white border-t border-slate-100 sticky bottom-0 left-0 right-0">
            <div className="flex items-center space-x-2 md:space-x-3 bg-slate-50 p-1.5 md:p-2 rounded-2xl border border-slate-200 focus-within:ring-4 focus-within:ring-blue-900/10 transition-all">
              <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                type="text" 
                placeholder="Ask about Cell Biology..." 
                className="flex-1 bg-transparent px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm outline-none font-medium placeholder:text-slate-400"
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="bg-blue-900 text-white w-10 h-10 rounded-xl disabled:opacity-50 transition-all flex items-center justify-center shadow-lg hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAgent;
