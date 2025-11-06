'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/shared/types';
import { presetPrompts } from '@/shared/constants/properties';

interface ChatSidebarProps {
  onPromptClick: (promptId: string) => void;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export default function ChatSidebar({
  onPromptClick,
  messages,
  onSendMessage,
  isLoading = false,
}: ChatSidebarProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white via-stone-50/50 to-amber-50/30 backdrop-blur-xl border-l border-stone-200/30">
      {/* Header - Elegant and refined */}
      <div className="px-6 py-5 border-b border-stone-200/20 bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-200/80 via-amber-300/60 to-orange-200/80 flex items-center justify-center shadow-sm ring-1 ring-amber-200/30">
            <svg className="w-5 h-5 text-amber-700/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-light tracking-wide text-stone-800 mb-0.5" style={{ fontFamily: 'Georgia, serif' }}>ARLook</h2>
            <p className="text-xs text-stone-500/80 font-light tracking-wide">Your intelligent rental companion</p>
          </div>
        </div>
      </div>

      {/* Preset Prompts - Elegant pill buttons */}
      <div className="px-6 py-4 border-b border-stone-200/20 bg-white/30 backdrop-blur-sm">
        <p className="text-[10px] font-light text-stone-500/70 mb-3.5 uppercase tracking-[0.2em]">Quick Search</p>
        <div className="flex flex-wrap gap-2">
          {presetPrompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => onPromptClick(prompt.id)}
              className="px-3.5 py-2 text-xs bg-white/70 border border-stone-200/50 rounded-full hover:bg-gradient-to-r hover:from-amber-50/60 hover:via-orange-50/40 hover:to-amber-50/60 hover:border-amber-200/60 hover:shadow-sm transition-all duration-300 text-stone-600 font-light tracking-wide hover:text-amber-700 hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
            >
              {prompt.text}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-stone-400/60 mt-3 font-light italic">Or type your question below</p>
      </div>

      {/* Messages Container - Refined chat interface */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-transparent via-stone-50/10 to-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col h-full justify-start pt-6">
            {/* Marketing Hero Section */}
            <div className="mb-6 animate-fadeIn">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-light text-stone-800 mb-2 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  Find Your Perfect Home
                </h1>
                <p className="text-sm text-stone-600/80 font-light leading-relaxed max-w-xs mx-auto">
                  AI-powered rental assistant designed for international students at Wharton
                </p>
              </div>
              
              {/* Value Propositions */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-4 bg-white/50 rounded-2xl border border-stone-200/40 backdrop-blur-sm hover:bg-white/60 transition-colors duration-300">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-100/80 to-orange-100/60 flex items-center justify-center flex-shrink-0 mt-0.5 ring-1 ring-amber-200/30">
                    <svg className="w-4 h-4 text-amber-700/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-stone-800 mb-1">AI-Powered Search</h3>
                    <p className="text-xs text-stone-600/80 font-light leading-relaxed">Ask in natural language - &quot;apartments near Wharton with gym&quot; - and get instant, intelligent matches</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-white/50 rounded-2xl border border-stone-200/40 backdrop-blur-sm hover:bg-white/60 transition-colors duration-300">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-100/80 to-cyan-100/60 flex items-center justify-center flex-shrink-0 mt-0.5 ring-1 ring-blue-200/30">
                    <svg className="w-4 h-4 text-blue-700/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-stone-800 mb-1">Interactive Map</h3>
                    <p className="text-xs text-stone-600/80 font-light leading-relaxed">Visualize properties on an interactive map with walking distance circles and smart filters</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-white/50 rounded-2xl border border-stone-200/40 backdrop-blur-sm hover:bg-white/60 transition-colors duration-300">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-100/80 to-pink-100/60 flex items-center justify-center flex-shrink-0 mt-0.5 ring-1 ring-purple-200/30">
                    <svg className="w-4 h-4 text-purple-700/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-stone-800 mb-1">Personalized Recommendations</h3>
                    <p className="text-xs text-stone-600/80 font-light leading-relaxed">Get tailored suggestions based on your budget, preferences, and lifestyle needs</p>
                  </div>
                </div>
              </div>
              
              {/* How to Use */}
              <div className="bg-gradient-to-br from-amber-50/40 to-orange-50/30 rounded-2xl p-5 border border-amber-200/30 backdrop-blur-sm">
                <h3 className="text-sm font-medium text-stone-800 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-700/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How to Get Started
                </h3>
                <ol className="space-y-2 text-xs text-stone-700/80 font-light">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-700/70 font-medium flex-shrink-0">1.</span>
                    <span>Click a quick search button above or type your question in the chat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-700/70 font-medium flex-shrink-0">2.</span>
                    <span>Explore properties on the map - click markers for details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-700/70 font-medium flex-shrink-0">3.</span>
                    <span>Use filters to refine your search by price or amenities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-700/70 font-medium flex-shrink-0">4.</span>
                    <span>Ask follow-up questions to compare or learn more</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 animate-slideIn ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar - Elegant circular avatars */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-light flex-shrink-0 backdrop-blur-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-amber-200/80 to-orange-200/60 text-amber-900/80 shadow-sm border border-amber-200/40'
                    : 'bg-gradient-to-br from-stone-100/80 to-stone-200/60 text-stone-600/80 shadow-sm border border-stone-200/40'
                }`}
              >
                {message.role === 'user' ? 'You' : 'AR'}
              </div>

              {/* Message Bubble - Refined, literary style */}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm backdrop-blur-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-amber-100/90 via-orange-50/80 to-stone-50/90 text-stone-800 border border-amber-200/40 rounded-tr-sm'
                    : 'bg-white/90 text-stone-700 border border-stone-200/60 rounded-tl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed font-light tracking-wide">{message.content}</p>
                <p
                  className={`text-[10px] mt-2.5 font-light tracking-wider ${
                    message.role === 'user'
                      ? 'text-amber-700/50'
                      : 'text-stone-400/60'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-light flex-shrink-0 bg-gradient-to-br from-stone-100/80 to-stone-200/60 text-stone-600/80 shadow-sm border border-stone-200/40 backdrop-blur-sm">
              AR
            </div>
            <div className="bg-white/90 border border-stone-200/60 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm backdrop-blur-sm">
              <div className="flex space-x-1.5">
                <div className="w-1.5 h-1.5 bg-amber-400/60 rounded-full animate-bounce"></div>
                <div
                  className="w-1.5 h-1.5 bg-orange-400/60 rounded-full animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                ></div>
                <div
                  className="w-1.5 h-1.5 bg-stone-400/60 rounded-full animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Sophisticated input with literary flair */}
      <div className="px-6 py-5 border-t border-stone-200/30 bg-white/40 backdrop-blur-md">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about properties..."
              disabled={isLoading}
              className="w-full px-4 py-3 pr-12 bg-white/90 border border-stone-200/60 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-300/30 focus:border-amber-300/50 disabled:bg-stone-50/50 disabled:cursor-not-allowed text-sm placeholder-stone-400/60 shadow-sm transition-all duration-300 font-light tracking-wide backdrop-blur-sm"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300/60 text-[10px] font-light">
              ⏎
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="px-5 py-3 bg-gradient-to-br from-amber-200/90 via-orange-200/80 to-amber-300/90 text-stone-800 rounded-full hover:from-amber-300/90 hover:via-orange-300/80 hover:to-amber-400/90 disabled:from-stone-200/50 disabled:to-stone-200/50 disabled:text-stone-400 disabled:cursor-not-allowed transition-all duration-300 font-light text-xs shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 flex items-center gap-2 backdrop-blur-sm border border-amber-200/30"
          >
            <span className="tracking-wide">Send</span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
