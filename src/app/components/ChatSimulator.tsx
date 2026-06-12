'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PG } from './PGCard';

interface Message {
  id: string;
  sender: 'user' | 'owner';
  text: string;
  timestamp: string;
}

interface ChatSimulatorProps {
  pg: PG;
  ownerName: string;
  onClose: () => void;
}

export default function ChatSimulator({ pg, ownerName, onClose }: ChatSimulatorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcome message from the owner
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'owner',
        text: `Hi! I am ${ownerName.split(' ')[0]}, the owner of ${pg.name}. Let me know if you have any questions about rooms, rent, weekly food schedules, or safety measures in our area!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [pg, ownerName]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Query backend smart replies
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          pgId: pg.id,
          pgName: pg.name,
          ownerName: ownerName,
          price: pg.price,
          safetyScore: pg.safetyScore,
        }),
      });
      const data = await response.json();

      // Simulate network delay + typing experience
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: 'owner-msg-' + Date.now(),
            sender: 'owner',
            text: data.reply || "Thanks for your inquiry! Let's arrange a call.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col h-[480px] animate-float" style={{ animationDuration: '10s' }}>
      
      {/* Chat Header */}
      <div className="p-4 bg-gradient-to-r from-royal-green to-emerald-800 border-b border-emerald-900/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/25 border border-white/20 flex items-center justify-center text-sm text-white">
            👨‍💼
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white leading-none">{ownerName}</h4>
            <span className="text-[10px] text-emerald-100 font-bold flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
              {pg.name} Owner
            </span>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Chat Messages Feed */}
      <div
        ref={feedRef}
        className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 flex flex-col"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed font-semibold shadow-sm ${
              msg.sender === 'user'
                ? 'bg-royal-green text-white self-end rounded-tr-none'
                : 'bg-white border border-slate-200 text-slate-700 self-start rounded-tl-none'
            }`}
          >
            <p>{msg.text}</p>
            <span className={`block text-[8px] text-right mt-1 ${msg.sender === 'user' ? 'text-white/60' : 'text-slate-400'}`}>{msg.timestamp}</span>
          </div>
        ))}

        {isTyping && (
          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 text-xs self-start max-w-[80%] flex items-center gap-1 font-semibold text-slate-500 shadow-sm">
            <span>Owner typing</span>
            <div className="flex gap-0.5 mt-1 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Message Footer */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about rent, food, safety, rooms..."
          className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-royal-green text-xs transition-all font-semibold"
        />
        <button
          type="submit"
          className="p-2.5 bg-royal-green text-white rounded-xl hover:bg-emerald-800 transition-all cursor-pointer shadow-sm shadow-emerald-800/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
      
    </div>
  );
}
