import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Bot, User, Flame, Loader2, ArrowRightLeft, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChatMessage, streamChat } from '@/lib/chatStream';
import { useToast } from '@/hooks/use-toast';

const QUICK_PROMPTS = [
  "How do I swap tokens?",
  "What is impermanent loss?",
  "How does staking work?",
  "How to add liquidity?",
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

  // Parse actions
  const actionsMatch = remaining.match(/\[ACTIONS\]\n?([\s\S]*?)\n?\[\/ACTIONS\]/);
  if (actionsMatch) {
    remaining = remaining.slice(0, actionsMatch.index).trimEnd() + remaining.slice(actionsMatch.index! + actionsMatch[0].length);
    actions = actionsMatch[1].split('\n').map(l => l.trim()).filter(Boolean).map(line => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  }

  // Parse suggestions
  const sugMatch = remaining.match(/\[SUGGESTIONS\]\n?([\s\S]*?)\n?\[\/SUGGESTIONS\]/);
  if (sugMatch) {
    remaining = remaining.slice(0, sugMatch.index).trimEnd();
    suggestions = sugMatch[1].split('\n').map(s => s.trim()).filter(Boolean).slice(0, 3);
  }

  return { text: remaining, actions, suggestions };
}

export function DragonBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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
      onDone: () => setIsLoading(false),
      onError: (err) => {
        setIsLoading(false);
        toast({ title: 'DragonBot Error', description: err, variant: 'destructive' });
      },
    });
  }, [messages, isLoading, toast]);

  // Parse suggestions from the last assistant message
  const lastAssistantSuggestions = useMemo(() => {
    if (isLoading) return [];
    const lastMsg = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastMsg) return [];
    return parseSuggestions(lastMsg.content).suggestions;
  }, [messages, isLoading]);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[100] h-14 w-14 rounded-full bg-gradient-to-br from-primary to-secondary shadow-[0_0_30px_hsl(var(--primary)/0.5)] flex items-center justify-center group"
          >
            <Flame className="w-6 h-6 text-primary-foreground group-hover:animate-pulse" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <Sparkles className="w-2.5 h-2.5 text-accent-foreground relative" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-[100] w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-4rem)] rounded-2xl overflow-hidden flex flex-col border border-border/50 shadow-[0_0_60px_hsl(var(--primary)/0.2)]"
            style={{ background: 'hsl(var(--background))' }}
          >
            {/* Header */}
            <div className="relative px-4 py-3 flex items-center gap-3 border-b border-border/30 bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-background" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  DragonBot
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                </h3>
                <p className="text-xs text-muted-foreground">AI Assistant • Always online</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center text-center pt-6 gap-4"
                >
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20">
                    <Flame className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Welcome, Dragon Rider! 🐉</h4>
                    <p className="text-xs text-muted-foreground mt-1">Ask me anything about DragonDEX</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {QUICK_PROMPTS.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="text-xs px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.map((msg, i) => {
                const isLast = i === messages.length - 1;
                const parsed = msg.role === 'assistant' ? parseSuggestions(msg.content) : null;
                const displayContent = parsed ? parsed.text : msg.content;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`h-7 w-7 shrink-0 rounded-lg flex items-center justify-center ${
                      msg.role === 'user'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-gradient-to-br from-primary to-secondary text-primary-foreground'
                    }`}>
                      {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                    <div className="max-w-[80%] space-y-2">
                      <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-md'
                          : 'bg-muted text-foreground rounded-tl-md'
                      }`}>
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                            <ReactMarkdown>{displayContent}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                      {/* Follow-up suggestions */}
                      {msg.role === 'assistant' && isLast && !isLoading && lastAssistantSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.3 }}
                          className="flex flex-wrap gap-1.5 pl-1"
                        >
                          {lastAssistantSuggestions.map((s, si) => (
                            <button
                              key={si}
                              onClick={() => send(s)}
                              className="text-[11px] px-2.5 py-1 rounded-full border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 transition-colors leading-tight"
                            >
                              {s}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5"
                >
                  <div className="h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="h-2 w-2 rounded-full bg-primary/60"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/30 bg-card/50">
              <form
                onSubmit={(e) => { e.preventDefault(); send(input); }}
                className="flex gap-2 items-center"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask DragonBot..."
                  disabled={isLoading}
                  className="flex-1 bg-muted/50 border border-border/50 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-shadow"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
              <p className="text-[10px] text-muted-foreground text-center mt-2 opacity-60">
                Powered by DragonDEX AI • May produce inaccurate info
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}