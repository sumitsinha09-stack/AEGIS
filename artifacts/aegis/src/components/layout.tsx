import { useEffect, useRef } from "react";
import {
  LayoutDashboard, Activity, Zap, Anchor, Droplets, Globe,
  Shield, RefreshCw, Clock,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useRefresh } from "@/hooks/use-refresh";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard, short: "OVR" },
  { href: "/risk", label: "Risk Intel", icon: Activity, short: "RSK" },
  { href: "/scenarios", label: "Scenarios", icon: Zap, short: "SCN" },
  { href: "/procurement", label: "Procurement", icon: Anchor, short: "PRC" },
  { href: "/reserve", label: "Reserve Opt.", icon: Droplets, short: "RES" },
  { href: "/digital-twin", label: "Digital Twin", icon: Globe, short: "DGT" },
];

function formatTime(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { lastRefreshed, isRefreshing, triggerRefresh } = useRefresh();
  const spinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const currentPage = NAV_ITEMS.find(n => n.href === location)?.label ?? "AEGIS";

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">

      {/* ── NARROW ICON SIDEBAR ─────────────────────────────────── */}
      <aside className="relative z-20 w-[72px] flex flex-col items-center py-0 shrink-0"
        style={{ background: "hsl(355 35% 3%)", borderRight: "1px solid rgba(217,64,52,0.12)" }}>

        {/* Logo */}
        <div className="flex flex-col items-center justify-center h-16 w-full border-b"
          style={{ borderColor: "rgba(217,64,52,0.12)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center relative"
            style={{ background: "linear-gradient(135deg, hsl(2 78% 57%) 0%, hsl(355 75% 45%) 100%)" }}>
            <Shield className="w-5 h-5 text-white" />
            <div className="absolute inset-0 rounded-xl"
              style={{ boxShadow: "0 0 20px rgba(217,64,52,0.5)" }} />
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col items-center pt-4 gap-1 w-full px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="w-full group relative">
                <div className={`
                  relative flex flex-col items-center justify-center gap-1 py-3 rounded-xl cursor-pointer
                  transition-all duration-200 text-center
                  ${isActive
                    ? "text-white"
                    : "text-[hsl(355_8%_50%)] hover:text-white"
                  }
                `}
                  style={isActive ? {
                    background: "linear-gradient(135deg, rgba(217,64,52,0.25) 0%, rgba(217,64,52,0.1) 100%)",
                    boxShadow: "0 0 16px rgba(217,64,52,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
                    border: "1px solid rgba(217,64,52,0.3)"
                  } : { border: "1px solid transparent" }}>
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                      style={{ background: "hsl(2 78% 57%)", boxShadow: "0 0 6px rgba(217,64,52,0.8)" }} />
                  )}
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-mono tracking-wider font-medium leading-none">
                    {item.short}
                  </span>
                </div>

                {/* Hover tooltip */}
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap
                  opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50"
                  style={{
                    background: "hsl(355 28% 9%)",
                    border: "1px solid rgba(217,64,52,0.25)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    color: "hsl(0 0% 90%)"
                  }}>
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom status */}
        <div className="pb-4 flex flex-col items-center gap-1">
          <div className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "hsl(142 68% 42%)", boxShadow: "0 0 8px rgba(34,197,94,0.6)" }} />
          <span className="text-[8px] font-mono tracking-widest"
            style={{ color: "hsl(355 8% 40%)" }}>LIVE</span>
        </div>
      </aside>

      {/* ── MAIN AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Control Bar */}
        <header className="shrink-0 h-16 flex items-center justify-between px-6 border-b"
          style={{
            background: "rgba(13,4,6,0.8)",
            backdropFilter: "blur(16px)",
            borderColor: "rgba(217,64,52,0.12)",
          }}>

          {/* Left: page name */}
          <div className="flex items-center gap-3">
            <div className="w-px h-6" style={{ background: "rgba(217,64,52,0.3)" }} />
            <div>
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase"
                style={{ color: "hsl(355 8% 50%)" }}>
                AEGIS / MODULE
              </div>
              <h1 className="text-base font-bold tracking-wide leading-tight">
                {currentPage.toUpperCase()}
              </h1>
            </div>
          </div>

          {/* Right: refresh + timestamp */}
          <div className="flex items-center gap-4">
            {/* Last refreshed */}
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono"
              style={{ color: "hsl(355 8% 50%)" }}>
              <Clock className="w-3.5 h-3.5" />
              <span>LAST SYNC {formatTime(lastRefreshed)}</span>
            </div>

            {/* Manual refresh button */}
            <motion.button
              onClick={() => triggerRefresh()}
              disabled={isRefreshing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all duration-200 disabled:opacity-60"
              style={{
                background: isRefreshing
                  ? "rgba(217,64,52,0.15)"
                  : "rgba(217,64,52,0.1)",
                border: "1px solid rgba(217,64,52,0.3)",
                color: "hsl(2 78% 65%)",
                boxShadow: isRefreshing ? "0 0 12px rgba(217,64,52,0.2)" : "none",
              }}>
              <div ref={spinRef}>
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              </div>
              <span className="hidden sm:inline">{isRefreshing ? "SYNCING..." : "REFRESH ALL"}</span>
            </motion.button>

            {/* Live dot */}
            <AnimatePresence>
              {isRefreshing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: "hsl(2 78% 57%)", boxShadow: "0 0 8px rgba(217,64,52,0.8)" }}
                />
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {/* Ambient background glows */}
          <div className="absolute top-0 right-0 w-[600px] h-[400px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(217,64,52,0.05) 0%, transparent 60%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 10% 90%, rgba(217,64,52,0.03) 0%, transparent 60%)" }} />

          <div className="relative z-10 p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
