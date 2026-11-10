import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Check,
  Zap,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  ShoppingBag,
  RotateCcw,
  Scale,
} from 'lucide-react';
import { AgentResponse, Product, ScoredProduct, ComparisonResult } from '../../lib/api';
import { formatInr } from '../../lib/formatters';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  activities?: string[];
  productCards?: Product[];
  scoredProducts?: ScoredProduct[];
  comparison?: ComparisonResult;
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
  onNewChat: () => void;
  onOpenFullComparison?: (comparison: ComparisonResult) => void;
  cartHint?: string | null;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  messages,
  loading,
  activeActivity,
  onSendMessage,
  onAddToCart,
  onViewProduct,
  onQuickAction,
  onNewChat,
  onOpenFullComparison,
  cartHint,
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
      <div className="p-3.5 px-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between relative z-10">
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNewChat}
            aria-label="Start a new conversation"
            className="px-3 py-2 min-h-[44px] rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-[#F5EFE6] hover:text-[#FFB020] hover:border-[#FFB020]/40 flex items-center gap-1.5 transition-all shadow-sm active:scale-95 group"
            title="Start a new conversation (keeps your cart intact)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FFB020] group-hover:-rotate-45 transition-transform" />
            <span className="font-medium">New Chat</span>
          </button>

          <div className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono font-medium text-[#A39A8C] hidden sm:block">
            Human-Approved
          </div>
        </div>
      </div>

      {/* Cart Preservation Notice / Hint */}
      {cartHint && (
        <div className="mx-4 mt-2 px-3 py-1.5 rounded-xl bg-[#4ADE80]/10 border border-[#4ADE80]/20 text-[11px] text-[#4ADE80] font-mono flex items-center justify-between animate-fadeIn z-10">
          <span>✓ {cartHint}</span>
        </div>
      )}

      {/* Messages Scroll Area with ARIA live region */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Chat messages with ShopGenie assistant"
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 relative z-10"
      >
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
                onClick={() => onQuickAction('Find me a laptop under ₹50,000 for coding')}
                aria-label="Ask for laptop under 50,000 for coding"
                className="text-left p-2.5 min-h-[44px] rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-[#FFB020]/40 text-xs text-[#F5EFE6] transition-all flex items-center justify-between group"
              >
                <span>"Laptop under ₹50,000 for coding"</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FFB020] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={() => onQuickAction('Gaming headphones under ₹5,000')}
                aria-label="Ask for gaming headphones under 5,000"
                className="text-left p-2.5 min-h-[44px] rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-[#FFB020]/40 text-xs text-[#F5EFE6] transition-all flex items-center justify-between group"
              >
                <span>"Gaming headphones under ₹5,000"</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FFB020] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={() => onQuickAction('Phone with best camera under ₹25,000')}
                aria-label="Ask for phone with best camera under 25,000"
                className="text-left p-2.5 min-h-[44px] rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-[#FFB020]/40 text-xs text-[#F5EFE6] transition-all flex items-center justify-between group"
              >
                <span>"Phone with best camera under ₹25,000"</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FFB020] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={() => onQuickAction('Compare my top 2 options')}
                aria-label="Ask to compare top 2 options"
                className="text-left p-2.5 min-h-[44px] rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-[#FFB020]/40 text-xs text-[#F5EFE6] transition-all flex items-center justify-between group"
              >
                <span>"Compare my top 2 options"</span>
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

              {/* Verified Product Cards Associated With Assistant Reply with Structured Explanations */}
              {msg.scoredProducts && msg.scoredProducts.length > 0 && (
                <div className="ml-9 w-[92%] space-y-2 mt-1">
                  <div className="text-[11px] uppercase tracking-wider font-mono font-semibold text-[#A39A8C] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4ADE80]" />
                    <span>Ranked Catalogue Picks ({msg.scoredProducts.length})</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {msg.scoredProducts.map((sp, idx) => (
                      <div
                        key={sp.product.id}
                        className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.04] hover:border-[#FFB020]/40 transition-all space-y-2.5 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.04] p-1 shrink-0 border border-white/5 flex items-center justify-center">
                              <img
                                src={sp.product.image_url}
                                alt={sp.product.name}
                                className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(255,176,32,0.15)]"
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-xs text-[#F5EFE6] truncate">
                                  {sp.product.name}
                                </span>
                                {idx === 0 && (
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/30">
                                    Top Match
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
                              Specs
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

                        {/* Structured Ranking Explanations: Why Chosen, Green Tags, Amber Trade-offs */}
                        <div className="space-y-1.5 pt-1.5 border-t border-white/5 text-[11px]">
                          {sp.rankingReason && (
                            <p className="text-[#F5EFE6]/80 text-xs italic">
                              "{sp.rankingReason}"
                            </p>
                          )}

                          {/* Matched Requirements (Green tags) */}
                          {sp.matchedRequirements && sp.matchedRequirements.length > 0 && (
                            <div className="flex flex-wrap gap-1 items-center">
                              {sp.matchedRequirements.map((req, rIdx) => (
                                <span
                                  key={rIdx}
                                  className="px-2 py-0.5 rounded-md bg-[#4ADE80]/15 text-[#4ADE80] text-[10px] font-mono border border-[#4ADE80]/25"
                                >
                                  ✓ {req}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Trade-offs (Amber tags) */}
                          {sp.tradeoffs && sp.tradeoffs.length > 0 && (
                            <div className="flex flex-wrap gap-1 items-center">
                              {sp.tradeoffs.map((to, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-2 py-0.5 rounded-md bg-amber-500/10 text-[#FFB020] text-[10px] font-mono border border-amber-500/20"
                                >
                                  ⚠ {to}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Side-by-Side Comparison Card Directly in Chat */}
              {msg.comparison && msg.comparison.products && msg.comparison.products.length >= 2 && (
                <div className="ml-9 w-[92%] p-3.5 rounded-2xl border border-[#FFB020]/30 bg-white/[0.03] backdrop-blur-md space-y-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-[#FFB020]" />
                      <span className="font-semibold text-xs text-[#F5EFE6]">Side-by-Side Comparison</span>
                    </div>
                    {msg.comparison.bestValuePick && (
                      <span className="px-2 py-0.5 rounded-full bg-[#4ADE80]/15 border border-[#4ADE80]/30 text-[10px] font-mono text-[#4ADE80] font-semibold truncate max-w-[160px]">
                        Value: {msg.comparison.bestValuePick.productName}
                      </span>
                    )}
                  </div>

                  {/* 2 Products Side-by-Side */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {msg.comparison.products.slice(0, 2).map((prod) => (
                      <div key={prod.id} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-2 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="w-full h-14 rounded-lg bg-black/30 p-1 flex items-center justify-center">
                            <img src={prod.image_url} alt={prod.name} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-xs text-[#F5EFE6] truncate">{prod.name}</h5>
                            <div className="text-xs font-bold text-[#FFB020] tabular-nums mt-0.5">{formatInr(prod.price_inr)}</div>
                          </div>
                          <div className="text-[10px] text-[#A39A8C] font-mono space-y-0.5 pt-1 border-t border-white/5">
                            {prod.specs?.ram_gb && <div>RAM: {prod.specs.ram_gb}GB</div>}
                            {prod.specs?.storage_gb && <div>Storage: {prod.specs.storage_gb}GB</div>}
                            {prod.specs?.battery_hours && <div>Battery: {prod.specs.battery_hours}h</div>}
                            {prod.specs?.battery_life_hours && <div>Battery: {prod.specs.battery_life_hours}h</div>}
                          </div>
                        </div>

                        <button
                          onClick={() => onAddToCart(prod)}
                          className="w-full mt-2 py-1 rounded-lg btn-amber text-[10px] font-semibold flex items-center justify-center gap-1 active:scale-95"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* View Full Comparison Button */}
                  <button
                    onClick={() => onOpenFullComparison ? onOpenFullComparison(msg.comparison!) : onQuickAction('View Full Comparison')}
                    className="w-full py-2 rounded-xl bg-white/[0.05] hover:bg-[#FFB020]/20 border border-white/10 hover:border-[#FFB020]/40 text-xs text-[#F5EFE6] hover:text-[#FFB020] font-medium flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>View Full Spec Comparison Matrix</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
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

        {/* Real Loading Activity Label with tool steps (Searching, Filtering, Ranking) */}
        {loading && (
          <div className="flex items-center gap-2.5 text-xs text-[#FFB020] ml-2 py-2 font-mono">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB020] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB020] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB020] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-[#FFB020]/15 border border-[#FFB020]/30 text-[10px] font-mono animate-pulse font-semibold">
                {activeActivity?.toLowerCase().includes('search')
                  ? 'Searching catalogue...'
                  : activeActivity?.toLowerCase().includes('rank')
                  ? 'Ranking options...'
                  : activeActivity?.toLowerCase().includes('filter')
                  ? 'Filtering by specifications...'
                  : 'Evaluating products...'}
              </span>
              <span className="text-xs text-[#A39A8C] font-sans">
                {activeActivity || 'Consulting verified catalogue...'}
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Composer with 500-character limit and live counter */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-white/10 bg-white/[0.02] relative z-10 space-y-1">
        <div className="flex items-center gap-2 p-1.5 pl-3.5 rounded-2xl border border-white/10 bg-white/[0.04] focus-within:border-[#FFB020] focus-within:bg-white/[0.06] focus-within:ring-2 focus-within:ring-[#FFB020]/30 transition-all">
          <input
            type="text"
            value={inputText}
            maxLength={500}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="E.g. Laptop under ₹50,000 for coding or compare my top 2..."
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-[#F5EFE6] placeholder:text-[#A39A8C] focus:outline-none"
            disabled={loading}
          />

          <span
            className={`text-[10px] font-mono shrink-0 pr-1 ${
              inputText.length >= 480
                ? 'text-[#F87171] font-bold'
                : inputText.length >= 400
                ? 'text-[#FFB020]'
                : 'text-[#A39A8C]'
            }`}
          >
            {inputText.length}/500
          </span>

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            aria-label="Send message to shopping assistant"
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl btn-amber disabled:opacity-30 disabled:hover:filter-none transition-all shrink-0 active:scale-95 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
