import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Send, Cpu, Sparkles, MessageSquare, Database, ArrowRight, ShieldCheck, RefreshCw, Command } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function AICommand() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "AEGIS Neural Agent online. Systems diagnostic normal. Ready to process natural language operational commands.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Assess current Strait of Hormuz threat score",
    "List critical vulnerabilities in supply chain",
    "Run strategic reserve optimizer recommendation",
    "Check connected database records health"
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate response based on keywords
    setTimeout(() => {
      let reply = "I've analyzed the telemetry streams. Everything appears nominal.";
      const query = text.toLowerCase();
      
      if (query.includes("hormuz") || query.includes("threat") || query.includes("score")) {
        reply = "⚠️ Strait of Hormuz threat score is currently at **74.6/100 (HIGH)** due to regional maritime exercises. The recommended action is pre-allocating spot purchases and maintaining +1.2 days of strategic buffers.";
      } else if (query.includes("vulnerabilit") || query.includes("supply") || query.includes("supplier")) {
        reply = "🔍 Supply chain analysis indicates **High Vulnerability** for suppliers transiting the Red Sea route (current reliability index down to 40%). Recommend switching 12% allocation to ADNOC Group or domestic alternatives.";
      } else if (query.includes("reserve") || query.includes("optimizer") || query.includes("spr")) {
        reply = "🔋 Strategic Petroleum Reserve optimizer recommends a **9.5 day** supply coverage. Baseline drawdown simulation shows high protection levels for up to a 30-day moderate corridor embargo.";
      } else if (query.includes("database") || query.includes("records") || query.includes("health")) {
        reply = "⚙️ Connected database diagnostics:\n- Postgres: **Connected** (7/7 tables active)\n- API Latency: **42ms**\n- Mapped Models: SQLAlchemy ORM layer synchronized.";
      }

      const assistantMsg: Message = {
        role: "assistant",
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1000);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ height: "calc(100vh - 10rem)" }}>
      
      {/* AI System Diagnostics Card */}
      <div className="rounded-2xl p-5 border border-border/5 flex flex-col justify-between"
        style={{ background: "rgba(20,6,8,0.7)" }}>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" /> Neural Diagnostics
            </h3>
            <p className="text-[10px] text-muted-foreground font-mono mt-1">
              Active parameters of the AEGIS assistant model.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { label: "CONNECTED AGENT", value: "DeepMind-AEGIS-v2.5" },
              { label: "MODEL TEMPERATURE", value: "0.15 (Deterministic)" },
              { label: "TELEMETRY LATENCY", value: "42 ms" },
              { label: "LAST RETRAINING", value: "July 2, 2026" },
            ].map(param => (
              <div key={param.label} className="border-b border-border/5 pb-2.5">
                <div className="text-[8px] font-mono tracking-widest text-muted-foreground">{param.label}</div>
                <div className="text-xs font-mono font-bold text-white mt-1">{param.value}</div>
              </div>
            ))}
          </div>

          {/* Connected databases */}
          <div className="rounded-xl p-3 border border-border/5" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="flex items-center gap-2 mb-2 font-mono text-[9px] font-bold text-primary">
              <Database className="w-3.5 h-3.5" /> DB ORM SCHEMA SYNC
            </div>
            <div className="text-[10px] font-mono text-muted-foreground leading-relaxed">
              7 main database tables are connected and automatically cached inside the AI command context.
            </div>
          </div>
        </div>

        {/* Action Status */}
        <div className="flex items-center gap-3 pt-4 border-t border-border/5 text-[9px] font-mono">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-400 font-bold">ALL COGNITIVE CORES OPERATIONAL</span>
        </div>
      </div>

      {/* Interactive AI Chat Panel */}
      <div className="lg:col-span-2 rounded-2xl border border-border/5 flex flex-col overflow-hidden"
        style={{ background: "rgba(10,3,4,0.85)" }}>
        
        {/* Terminal Header */}
        <div className="px-4 py-3 border-b border-border/5 flex items-center justify-between"
          style={{ background: "rgba(217,64,52,0.05)" }}>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-primary">AEGIS NEURAL CONSOLE</span>
          </div>
          <span className="text-[8px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted/40">SECURE SHELL</span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-2xl p-4 max-w-[85%] text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-white"
                      : "bg-muted/40 border border-border/5 text-slate-200"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1.5 mb-1.5 font-mono text-[9px] font-bold text-primary">
                      <Sparkles className="w-3.5 h-3.5" /> AEGIS CORES
                    </div>
                  )}
                  <p className="whitespace-pre-line font-mono">{msg.content}</p>
                  <div className="text-[8px] font-mono text-muted-foreground/60 text-right mt-2">
                    {msg.timestamp}
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="rounded-2xl p-4 bg-muted/40 border border-border/5 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts Dock */}
        <div className="p-3 border-t border-border/5 flex gap-2 overflow-x-auto" style={{ background: "rgba(255,255,255,0.01)" }}>
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              className="px-3 py-1.5 rounded-lg border border-border/10 hover:border-primary/30 hover:bg-primary/5 text-[9px] font-mono text-muted-foreground hover:text-white transition-all whitespace-nowrap"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Send Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="p-3 border-t border-border/5 flex gap-2"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Query model for risk matrices, price shifts or system diagnostics..."
            className="flex-1 bg-muted border border-border/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none focus:border-primary transition-all"
          />
          <button
            type="submit"
            className="p-2.5 bg-primary rounded-xl text-white hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
