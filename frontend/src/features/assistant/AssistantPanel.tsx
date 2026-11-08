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
    <div className="bg-surface rounded-3xl border border-border flex flex-col h-[650px] shadow-card overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 px-5 border-b border-border bg-surface flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center shadow-subtle">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-text-primary tracking-tight">
                ShopGenie Concierge
              </h3>
              <span className="w-2 h-2 rounded-full bg-status-success" />
            </div>
            <span className="text-[11px] text-text-secondary">
              Deterministic scoring • Explainable choices
            </span>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-surface-secondary border border-border text-[10px] font-medium text-text-secondary">
          Human-Approved
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-accent-tint text-accent flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-text-primary text-sm">How can ShopGenie help today?</h4>
            <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
              Describe your needs, budget, or preferred usage. We'll search our verified catalogue, rank options objectively, and explain trade-offs.
            </p>
            <div className="pt-2 flex flex-col gap-1.5 w-full max-w-xs">
              <button
                onClick={() => onQuickAction('Find me a laptop under ₹50,000 for programming with good battery life')}
                className="text-left p-2.5 rounded-xl border border-border bg-surface-secondary/50 hover:bg-surface-secondary text-xs text-text-primary transition-colors flex items-center justify-between group"
              >
                <span>"Laptop under ₹50,000 for coding"</span>
                <ArrowRight className="w-3.5 h-3.5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={() => onQuickAction('Find headphones with great battery and active noise cancellation')}
                className="text-left p-2.5 rounded-xl border border-border bg-surface-secondary/50 hover:bg-surface-secondary text-xs text-text-primary transition-colors flex items-center justify-between group"
              >
                <span>"Headphones with great battery"</span>
                <ArrowRight className="w-3.5 h-3.5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                      ? 'bg-text-primary text-white'
                      : 'bg-accent text-white'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                {/* Bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-accent text-white rounded-tr-sm'
                      : 'bg-surface-secondary text-text-primary border border-border/80 rounded-tl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>

              {/* Mode notice if in deterministic fallback */}
              {msg.mode === 'deterministic_fallback' && msg.unconfiguredReason && (
                <div className="ml-9 p-2 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5 max-w-[85%]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>{msg.unconfiguredReason}</span>
                </div>
              )}

              {/* Verified Product Cards Associated With Assistant Reply */}
              {msg.scoredProducts && msg.scoredProducts.length > 0 && (
                <div className="ml-9 w-[90%] space-y-2 mt-1">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
                    <span>Ranked Catalogue Picks ({msg.scoredProducts.length})</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {msg.scoredProducts.map((sp, idx) => (
                      <div
                        key={sp.product.id}
                        className="p-3 rounded-xl border border-border bg-surface hover:border-accent/40 transition-all flex items-center justify-between gap-3 shadow-subtle"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-surface-secondary p-1 shrink-0 border border-border/60">
                            <img
                              src={sp.product.image_url}
                              alt={sp.product.name}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-text-primary truncate">
                                {sp.product.name}
                              </span>
                              {idx === 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-accent-tint text-accent">
                                  Top Fit
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-text-secondary mt-0.5">
                              <span className="font-bold text-text-primary tabular-nums">
                                {formatInr(sp.product.price_inr)}
                              </span>
                              <span>•</span>
                              <span className="text-status-success font-medium">
                                {sp.overallScore}/100 match
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => onViewProduct(sp.product)}
                            className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                            title="Inspect specifications"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => onAddToCart(sp.product)}
                            className="px-2.5 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover flex items-center gap-1"
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
                      className="px-3 py-1 rounded-full border border-accent/30 bg-accent-tint/60 text-accent text-xs font-medium hover:bg-accent hover:text-white transition-colors"
                    >
                      {act}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {/* Real Loading Activity Label */}
        {loading && (
          <div className="flex items-center gap-2.5 text-xs text-text-secondary ml-2 py-2">
            <div className="w-5 h-5 rounded-lg bg-accent-tint text-accent flex items-center justify-center animate-spin">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="font-medium animate-pulse">
              {activeActivity || 'Consulting verified catalogue...'}
            </span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Composer */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-border bg-surface">
        <div className="flex items-center gap-2 p-1.5 pl-3.5 rounded-2xl border border-border bg-surface-secondary/40 focus-within:border-accent focus-within:bg-surface focus-within:ring-2 focus-within:ring-accent/20 transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="E.g. Laptop under ₹50,000 for coding or compare top two..."
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            aria-label="Send message to shopping assistant"
            className="p-2.5 rounded-xl bg-accent text-white hover:bg-accent-hover disabled:opacity-40 disabled:hover:bg-accent transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

