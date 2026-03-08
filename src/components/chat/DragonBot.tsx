import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Bot, User, Flame, Loader2, ArrowRightLeft, ExternalLink, Trash2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChatMessage, streamChat } from '@/lib/chatStream';
import { useToast } from '@/hooks/use-toast';

const QUICK_PROMPTS = [
  { emoji: "🔄", text: "How do I swap tokens?" },
  { emoji: "💧", text: "How to add liquidity?" },
  { emoji: "🥩", text: "How does staking work?" },
  { emoji: "📊", text: "Show me token prices" },
  { emoji: "🐉", text: "What is DRAGON token?" },
  { emoji: "🚰", text: "How to get testnet tokens?" },
];

type ChatAction = {
  label: string;
  action: 'swap' | 'navigate';
  from?: string;
  to?: string;
  path?: string;
};

function parseContent(content: string): { text: string; actions: ChatAction[]; suggestions: string[] } {
  let remaining = content;
  let actions: ChatAction[] = [];
  let suggestions: string[] = [];

  const actionsMatch = remaining.match(/\[ACTIONS\]\n?([\s\S]*?)\n?\[\/ACTIONS\]/);
  if (actionsMatch) {
    remaining = remaining.slice(0, actionsMatch.index).trimEnd() + remaining.slice(actionsMatch.index! + actionsMatch[0].length);
    actions = actionsMatch[1].split('\n').map(l => l.trim()).filter(Boolean).map(line => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  }

  const sugMatch = remaining.match(/\[SUGGESTIONS\]\n?([\s\S]*?)\n?\[\/SUGGESTIONS\]/);
  if (sugMatch) {
    remaining = remaining.slice(0, sugMatch.index).trimEnd();
    suggestions = sugMatch[1].split('\n').map(s => s.trim()).filter(Boolean).slice(0, 3);
  }

  return { text: remaining, actions, suggestions };
}

const STORAGE_KEY = 'dragonbot-messages';

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMessages(msgs: ChatMessage[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-50))); } catch {}
}

export function DragonBot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Persist messages
  useEffect(() => { saveMessages(messages); }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: allMessages,
      onDelta: upsertAssistant,
      onDone: () => {
        setIsLoading(false);
        if (!isOpen) setHasNewMessage(true);
      },
      onError: (err) => {
        setIsLoading(false);
        toast({ title: 'DragonBot Error', description: err, variant: 'destructive' });
      },
    });
  }, [messages, isLoading, toast, isOpen]);

  const lastParsed = useMemo(() => {
    if (isLoading) return { actions: [] as ChatAction[], suggestions: [] as string[] };
    const lastMsg = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastMsg) return { actions: [] as ChatAction[], suggestions: [] as string[] };
    const p = parseContent(lastMsg.content);
    return { actions: p.actions, suggestions: p.suggestions };
  }, [messages, isLoading]);

  const handleAction = useCallback((action: ChatAction) => {
    if (action.action === 'swap' && action.from && action.to) {
      navigate(`/swap?from=${action.from}&to=${action.to}`);
      setIsOpen(false);
    } else if (action.action === 'navigate' && action.path) {
      navigate(action.path);
      setIsOpen(false);
    }
  }, [navigate]);

  const messageCount = messages.length;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[100] h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary shadow-[0_0_40px_hsl(var(--primary)/0.5),0_0_80px_hsl(var(--primary)/0.2)] flex items-center justify-center group overflow-hidden"
          >
            {/* Animated background shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
            <Flame className="w-7 h-7 text-primary-foreground relative z-10 drop-shadow-lg" />
            {/* Notification badge */}
            <motion.span
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {hasNewMessage ? (
                <span className="text-[10px] font-bold text-accent-foreground">!</span>
              ) : (
                <Sparkles className="w-2.5 h-2.5 text-accent-foreground" />
              )}
            </motion.span>
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-primary" style={{ animationDuration: '3s' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed bottom-6 right-6 z-[100] w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-4rem)] rounded-3xl overflow-hidden flex flex-col border border-border/40 shadow-[0_0_80px_hsl(var(--primary)/0.15),0_25px_50px_-12px_rgba(0,0,0,0.5)]"
            style={{ background: 'hsl(var(--background)/0.95)', backdropFilter: 'blur(20px)' }}
          >
            {/* Header */}
            <div className="relative px-4 py-3.5 flex items-center gap-3 border-b border-border/20">
              {/* Header gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-secondary/5 to-accent/5" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              
              <div className="relative">
                <motion.div
                  className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25"
                  whileHover={{ rotate: 15 }}
                  transition={{ type: 'spring' }}
                >
                  <Bot className="w-5.5 h-5.5 text-primary-foreground" />
                </motion.div>
                <motion.span
                  className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="flex-1 min-w-0 relative">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  DragonBot
                  <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                  </motion.span>
                </h3>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  AI Assistant • Always online
                </p>
              </div>
              <div className="flex items-center gap-1 relative">
                {messageCount > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                    onClick={clearChat}
                    title="Clear chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-border/50">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center text-center pt-4 gap-5"
                >
                  {/* Animated dragon icon */}
                  <motion.div
                    className="relative"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
                      <Flame className="w-10 h-10 text-primary" />
                    </div>
                    <motion.div
                      className="absolute -inset-2 rounded-3xl bg-primary/10 blur-xl"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </motion.div>

                  <div>
                    <motion.h4
                      className="font-bold text-foreground text-base"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Welcome, Dragon Rider! 🐉
                    </motion.h4>
                    <motion.p
                      className="text-xs text-muted-foreground mt-1.5 max-w-[250px]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      I'm your AI guide through DragonDEX. Ask me about swaps, pools, staking, and more!
                    </motion.p>
                  </div>

                  {/* Quick prompts grid */}
                  <div className="grid grid-cols-2 gap-2 w-full mt-1">
                    {QUICK_PROMPTS.map((q, idx) => (
                      <motion.button
                        key={q.text}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + idx * 0.05 }}
                        onClick={() => send(q.text)}
                        className="text-[11px] px-3 py-2.5 rounded-xl border border-border/50 bg-card/50 text-foreground hover:bg-primary/10 hover:border-primary/30 transition-all text-left flex items-center gap-2 group"
                      >
                        <span className="text-sm group-hover:scale-110 transition-transform">{q.emoji}</span>
                        <span className="truncate">{q.text}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.map((msg, i) => {
                const isLast = i === messages.length - 1;
                const parsed = msg.role === 'assistant' ? parseContent(msg.content) : null;
                const displayContent = parsed ? parsed.text : msg.content;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <motion.div
                      className={`h-7 w-7 shrink-0 rounded-lg flex items-center justify-center ${
                        msg.role === 'user'
                          ? 'bg-primary/20 text-primary'
                          : 'bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm shadow-primary/20'
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </motion.div>
                    <div className="max-w-[80%] space-y-2">
                      <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-md shadow-sm shadow-primary/20'
                          : 'bg-muted/80 text-foreground rounded-tl-md border border-border/30'
                      }`}>
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1 [&>h1]:text-sm [&>h2]:text-sm [&>h3]:text-xs [&_strong]:text-primary [&_code]:text-accent [&_code]:bg-accent/10 [&_code]:px-1 [&_code]:rounded">
                            <ReactMarkdown>{displayContent}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>

                      {/* Action buttons */}
                      {msg.role === 'assistant' && isLast && !isLoading && parsed && parsed.actions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                          className="flex flex-wrap gap-1.5 pl-1"
                        >
                          {parsed.actions.map((act, ai) => (
                            <motion.button
                              key={ai}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleAction(act)}
                              className="text-[11px] px-3 py-2 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary hover:from-primary/20 hover:to-secondary/20 hover:border-primary/50 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                            >
                              {act.action === 'swap' ? (
                                <ArrowRightLeft className="w-3 h-3" />
                              ) : (
                                <ExternalLink className="w-3 h-3" />
                              )}
                              {act.label}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}

                      {/* Follow-up suggestions */}
                      {msg.role === 'assistant' && isLast && !isLoading && lastParsed.suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.3 }}
                          className="flex flex-wrap gap-1.5 pl-1"
                        >
                          {lastParsed.suggestions.map((s, si) => (
                            <motion.button
                              key={si}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => send(s)}
                              className="text-[11px] px-2.5 py-1.5 rounded-full border border-accent/30 bg-accent/5 text-accent-foreground/80 hover:bg-accent/15 hover:border-accent/50 transition-all leading-tight"
                            >
                              {s}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5"
                >
                  <div className="h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm shadow-primary/20">
                    <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <div className="bg-muted/80 rounded-2xl rounded-tl-md px-4 py-3 border border-border/30">
                    <div className="flex gap-1.5 items-center">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="h-2 w-2 rounded-full bg-primary/50"
                          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-1.5">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="relative p-3 border-t border-border/20">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <form
                onSubmit={(e) => { e.preventDefault(); send(input); }}
                className="flex gap-2 items-center"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask DragonBot anything..."
                  disabled={isLoading}
                  className="flex-1 bg-muted/40 border border-border/40 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 disabled:opacity-50 transition-all"
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)] transition-all disabled:shadow-none"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </motion.div>
              </form>
              <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
                Powered by DragonDEX AI • {messageCount} messages
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
