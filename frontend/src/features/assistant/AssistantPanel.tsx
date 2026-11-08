import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Check, Zap, ArrowRight, AlertTriangle, ShieldCheck, ShoppingBag } from 'lucide-react';
import { AgentResponse, Product, ScoredProduct } from '../../lib/api';
import { formatInr } from '../../lib/formatters';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  activities?: string[];
  productCards?: Product[];
  scoredProducts?: ScoredProduct[];
  actions?: string[];
  mode?: 'live_gemini' | 'live_openai' | 'deterministic_fallback';
  unconfiguredReason?: string;
  timestamp: string;
}

interface AssistantPanelProps {
  messages: ChatMessage[];
  loading: boolean;
  activeActivity: string | null;
  onSendMessage: (text: string) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onQuickAction: (actionText: string) => void;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  messages,
  loading,
  activeActivity,
  onSendMessage,
  onAddToCart,
  onViewProduct,
  onQuickAction,
}) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, activeActivity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="glass-panel rounded-3xl border border-white/10 flex flex-col h-[650px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden relative">
      {/* Background ambient glow inside assistant */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFB020]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Panel Header */}
      <div className="p-4 px-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFB020] to-[#FF7A1A] text-[#0B0906] flex items-center justify-center shadow-[0_0_12px_rgba(255,176,32,0.35)]">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-[#F5EFE6] tracking-tight">
                ShopGenie Concierge
              </h3>
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
            </div>
            <span className="text-[11px] font-mono text-[#A39A8C]">
              Deterministic scoring • Explainable choices
            </span>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono font-medium text-[#A39A8C]">
          Human-Approved
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 relative z-10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFB020]/15 text-[#FFB020] border border-[#FFB020]/25 flex items-center justify-center shadow-[0_0_20px_rgba(255,176,32,0.2)]">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="font-semibold font-serif text-lg text-[#F5EFE6]">How can ShopGenie help today?</h4>
            <p className="text-xs text-[#A39A8C] max-w-xs leading-relaxed">
              Describe your needs, budget, or preferred usage. We'll search our verified catalogue, rank options objectively, and explain trade-offs.
            </p>
            <div className="pt-2 flex flex-col gap-2 w-full max-w-xs">
              <button
                onClick={() => onQuickAction('Find me a laptop under ₹50,000 for programming with good battery life')}
                className="text-left p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-[#FFB020]/40 text-xs text-[#F5EFE6] transition-all flex items-center justify-between group"
              >
                <span>"Laptop under ₹50,000 for coding"</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FFB020] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={() => onQuickAction('Find headphones with great battery and active noise cancellation')}
                className="text-left p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-[#FFB020]/40 text-xs text-[#F5EFE6] transition-all flex items-center justify-between group"
              >
                <span>"Headphones with great battery"</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FFB020] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              } space-y-2`}
            >
              <div
                className={`flex gap-2.5 max-w-[90%] sm:max-w-[85%] ${
                  msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold ${
                    msg.sender === 'user'
                      ? 'bg-white/15 text-[#F5EFE6] border border-white/20'
                      : 'bg-gradient-to-br from-[#FFB020] to-[#FF7A1A] text-[#0B0906] shadow-sm'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 fill-current" />}
                </div>

                {/* Bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'btn-amber text-[#0B0906] rounded-tr-sm shadow-[0_0_15px_rgba(255,176,32,0.25)]'
                      : 'bg-white/[0.05] text-[#F5EFE6] border border-white/10 rounded-tl-sm backdrop-blur-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>

              {/* Mode notice if in deterministic fallback */}
              {msg.mode === 'deterministic_fallback' && msg.unconfiguredReason && (
                <div className="ml-9 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-[#FFB020] flex items-center gap-1.5 max-w-[85%] font-mono">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#FFB020]" />
                  <span>{msg.unconfiguredReason}</span>
                </div>
              )}

              {/* Verified Product Cards Associated With Assistant Reply */}
              {msg.scoredProducts && msg.scoredProducts.length > 0 && (
                <div className="ml-9 w-[90%] space-y-2 mt-1">
                  <div className="text-[11px] uppercase tracking-wider font-mono font-semibold text-[#A39A8C] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4ADE80]" />
                    <span>Ranked Catalogue Picks ({msg.scoredProducts.length})</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {msg.scoredProducts.map((sp, idx) => (
                      <div
                        key={sp.product.id}
                        className="p-3 rounded-2xl border border-white/10 bg-white/[0.04] hover:border-[#FFB020]/40 transition-all flex items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.04] p-1 shrink-0 border border-white/5 flex items-center justify-center">
                            <img
                              src={sp.product.image_url}
                              alt={sp.product.name}
                              className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(255,176,32,0.15)]"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-[#F5EFE6] truncate">
                                {sp.product.name}
                              </span>
                              {idx === 0 && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/30">
                                  Top Fit
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#A39A8C] mt-0.5 font-mono">
                              <span className="font-bold text-[#F5EFE6] tabular-nums">
                                {formatInr(sp.product.price_inr)}
                              </span>
                              <span>•</span>
                              <span className="text-[#4ADE80] font-medium">
                                {sp.overallScore}/100 match
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => onViewProduct(sp.product)}
                            className="p-1.5 px-2.5 rounded-lg border border-white/10 text-xs font-mono text-[#A39A8C] hover:text-[#F5EFE6] hover:bg-white/[0.06]"
                            title="Inspect specifications"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => onAddToCart(sp.product)}
                            className="px-2.5 py-1.5 rounded-lg btn-amber text-xs font-semibold flex items-center gap-1 active:scale-95"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Suggestion Chips */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="ml-9 flex flex-wrap gap-1.5 pt-1">
                  {msg.actions.map((act, i) => (
                    <button
                      key={i}
                      onClick={() => onQuickAction(act)}
                      className="px-3 py-1 rounded-full border border-[#FFB020]/30 bg-[#FFB020]/10 text-[#FFB020] text-xs font-medium hover:bg-[#FFB020] hover:text-[#0B0906] transition-all"
                    >
                      {act}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {/* Real Loading Activity Label with tool chips (Searching, Filtering, Ranking) */}
        {loading && (
          <div className="flex items-center gap-2.5 text-xs text-[#FFB020] ml-2 py-2 font-mono">
            <div className="w-5 h-5 rounded-lg bg-[#FFB020]/20 text-[#FFB020] flex items-center justify-center animate-spin">
              <Sparkles className="w-3 h-3 fill-current" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-[#FFB020]/15 border border-[#FFB020]/30 text-[10px] font-mono animate-pulse">
                {activeActivity?.toLowerCase().includes('search') ? 'Searching' : activeActivity?.toLowerCase().includes('rank') ? 'Ranking' : 'Filtering'}
              </span>
              <span className="text-xs text-[#A39A8C] font-sans">
                {activeActivity || 'Consulting verified catalogue...'}
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Composer */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-white/10 bg-white/[0.02] relative z-10">
        <div className="flex items-center gap-2 p-1.5 pl-3.5 rounded-2xl border border-white/10 bg-white/[0.04] focus-within:border-[#FFB020] focus-within:bg-white/[0.06] focus-within:ring-2 focus-within:ring-[#FFB020]/30 transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="E.g. Laptop under ₹50,000 for coding or compare top two..."
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-[#F5EFE6] placeholder:text-[#A39A8C] focus:outline-none"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            aria-label="Send message to shopping assistant"
            className="p-2.5 rounded-xl btn-amber disabled:opacity-30 disabled:hover:filter-none transition-all shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
