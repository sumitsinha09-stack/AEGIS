import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard, Activity, Zap, Anchor, Droplets, Globe,
  Shield, RefreshCw, Clock, Settings, Search, Bell, User,
  Command as CommandIcon, Sparkles, BarChart2,
  Terminal, ChevronDown, LogOut, Info, ShieldAlert, Settings2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useRefresh } from "@/hooks/use-refresh";
import { motion, AnimatePresence } from "framer-motion";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem
} from "@/components/ui/command";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const NAV_ITEMS = [
  { href: "/", label: "Mission Control", icon: Shield, short: "MSN" },
  { href: "/risk", label: "Risk Intelligence", icon: Activity, short: "RSK" },
  { href: "/scenarios", label: "Scenario Simulation", icon: Zap, short: "SIM" },
  { href: "/procurement", label: "Procurement Intel", icon: Anchor, short: "PRC" },
  { href: "/reserve", label: "Reserve Optimizer", icon: Droplets, short: "RES" },
  { href: "/digital-twin", label: "Digital Twin", icon: Globe, short: "TWN" },
  { href: "/analytics", label: "Analytics & Reports", icon: BarChart2, short: "ANL" },
  { href: "/ai-command", label: "AI Command Center", icon: Terminal, short: "AIC" },
  { href: "/settings", label: "System Management", icon: Settings, short: "SET" },
];

function formatTime(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { lastRefreshed, isRefreshing, triggerRefresh } = useRefresh();
  const { toast } = useToast();
  const spinRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [openCmdPalette, setOpenCmdPalette] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Cmd+K shortcut listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenCmdPalette((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const currentItem = NAV_ITEMS.find(n => n.href === location);
  const currentPage = currentItem?.label ?? "AEGIS";

  const notifications = [
    { id: 1, text: "⚠️ Strait of Hormuz threat score elevated to 74.6", time: "5m ago", type: "high" },
    { id: 2, text: "🚢 Rerouting Suez tankers to Cape adds 12 days latency", time: "18m ago", type: "mod" },
    { id: 3, text: "🔋 SPR reserves optimized to 9.5 cover days", time: "1h ago", type: "info" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">

      {/* ── COLLAPSIBLE HOVER-EXPANDABLE SIDEBAR ────────────────── */}
      <aside 
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="relative z-20 flex flex-col items-center py-0 shrink-0 transition-all duration-300 ease-out border-r"
        style={{ 
          width: isExpanded ? "230px" : "72px",
          background: "hsl(355 35% 3%)", 
          borderColor: "rgba(217,64,52,0.12)" 
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-start h-16 w-full border-b px-4 gap-3 overflow-hidden"
          style={{ borderColor: "rgba(217,64,52,0.12)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center relative shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(2 78% 57%) 0%, hsl(355 75% 45%) 100%)" }}>
            <Shield className="w-5 h-5 text-white" />
            <div className="absolute inset-0 rounded-xl"
              style={{ boxShadow: "0 0 20px rgba(217,64,52,0.5)" }} />
          </div>
          {isExpanded && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white font-display font-extrabold text-xs tracking-[0.2em]"
            >
              AEGIS CONTROL
            </motion.span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col items-center pt-4 gap-1.5 w-full px-2 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="w-full group relative">
                <div className={`
                  relative flex items-center justify-start gap-3 py-3 px-3 rounded-xl cursor-pointer
                  transition-all duration-200
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
                  <Icon className="w-5 h-5 shrink-0" />
                  
                  {isExpanded ? (
                    <motion.span 
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs font-semibold tracking-wide font-display whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  ) : (
                    <span className="text-[9px] font-mono tracking-wider font-medium leading-none ml-auto mr-auto">
                      {item.short}
                    </span>
                  )}

                  {/* Warning Dot next to Risk Intel */}
                  {!isExpanded && item.href === "/risk" && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border border-black animate-pulse" />
                  )}
                </div>

                {/* Hover tooltip - only show when collapsed */}
                {!isExpanded && (
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
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom status */}
        <div className="pb-6 pt-4 w-full flex items-center justify-center px-4 gap-2">
          <div className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0"
            style={{ background: "hsl(142 68% 42%)", boxShadow: "0 0 8px rgba(34,197,94,0.6)" }} />
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[9px] font-mono tracking-widest text-green-400 font-bold"
            >
              SYSTEM ONLINE
            </motion.span>
          )}
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

          {/* Left: breadcrumbs & Page Title */}
          <div className="flex items-center gap-3">
            <div className="w-px h-6" style={{ background: "rgba(217,64,52,0.3)" }} />
            <div>
              <div className="text-[9px] font-mono tracking-[0.25em] uppercase text-muted-foreground">
                AEGIS / {currentPage}
              </div>
              <h1 className="text-sm font-bold tracking-wider leading-tight text-white">
                {currentPage.toUpperCase()} WORKSPACE
              </h1>
            </div>
          </div>

          {/* Center Search / Cmd+K Command Palette Trigger */}
          <button 
            onClick={() => setOpenCmdPalette(true)}
            className="hidden md:flex items-center gap-2.5 px-4 py-2 bg-muted/40 hover:bg-muted/70 border border-border/10 rounded-xl text-left w-64 text-xs font-mono text-muted-foreground transition-all"
          >
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Search console...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border/15 bg-muted/50 px-1.5 font-mono text-[9px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>

          {/* Right Area Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 border border-border/10 bg-muted/20 hover:bg-muted/40 rounded-xl text-xs font-mono text-white outline-none">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Quick Actions</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 font-mono text-xs" style={{ background: "hsl(355 28% 8%)", border: "1px solid rgba(217,64,52,0.2)" }}>
                <DropdownMenuLabel>Simulation Cores</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/10" />
                <DropdownMenuItem className="hover:bg-muted/50 cursor-pointer" onSelect={() => setLocation("/scenarios")}>
                  Run Geopolitical Disruption
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-muted/50 cursor-pointer" onSelect={() => setLocation("/reserve")}>
                  Optimize Strategic Reserves
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/10" />
                <DropdownMenuItem className="hover:bg-muted/50 cursor-pointer" onSelect={() => {
                  triggerRefresh();
                  toast({ title: "Cache Synchronized", description: "All database buffers updated." });
                }}>
                  Clear Diagnostics Cache
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notification trigger popover */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 border border-border/10 bg-muted/20 hover:bg-muted/40 rounded-xl text-white relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2.5 w-80 bg-popover border border-border/15 rounded-2xl p-4 shadow-2xl z-50 space-y-3 font-mono"
                      style={{ background: "hsl(355 28% 8%)", borderColor: "rgba(217,64,52,0.2)" }}
                    >
                      <div className="text-[10px] font-bold text-primary tracking-widest uppercase border-b border-border/5 pb-2">
                        System Alerts Feed
                      </div>
                      <div className="space-y-2">
                        {notifications.map((n) => (
                          <div key={n.id} className="p-2.5 rounded-xl bg-muted/30 border border-border/5 text-[10px]">
                            <div className="text-white leading-normal">{n.text}</div>
                            <div className="text-[8px] text-muted-foreground mt-1.5 text-right">{n.time}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 p-1 border border-border/10 bg-muted/20 hover:bg-muted/40 rounded-xl text-white outline-none">
                <div className="w-7 h-7 rounded-lg bg-primary/25 border border-primary/40 flex items-center justify-center font-bold text-xs text-white">
                  OP
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 font-mono text-xs" style={{ background: "hsl(355 28% 8%)", border: "1px solid rgba(217,64,52,0.2)" }}>
                <DropdownMenuLabel>System Operator</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/10" />
                <DropdownMenuItem className="hover:bg-muted/50 cursor-pointer" onSelect={() => setLocation("/settings")}>
                  Settings & preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/10" />
                <DropdownMenuItem className="hover:bg-muted/50 cursor-pointer text-red-400" onSelect={() => toast({ title: "Sign Out", description: "Operator credentials cleared." })}>
                  <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh timestamp indicator */}
            <div className="hidden xl:flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground border-l border-border/10 pl-3">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span>SYNC {formatTime(lastRefreshed)}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <div className="absolute top-0 right-0 w-[600px] h-[400px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(217,64,52,0.05) 0%, transparent 60%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 10% 90%, rgba(217,64,52,0.03) 0%, transparent 60%)" }} />

          <div className="relative z-10 p-6 lg:p-8 pb-16">
            {children}
          </div>
        </main>

        {/* OPERATIONS scrolling Ticker Footer Feed */}
        <footer className="shrink-0 h-10 border-t flex items-center justify-between overflow-hidden relative z-10"
          style={{
            background: "rgba(13,4,6,0.9)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(217,64,52,0.12)",
          }}>
          <div className="flex items-center h-full px-4 border-r shrink-0 gap-2 font-mono text-[9px] font-bold z-10"
            style={{
              background: "rgba(18,6,8,0.95)",
              borderColor: "rgba(217,64,52,0.12)",
              color: "hsl(2 78% 65%)"
            }}>
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping shrink-0" />
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full absolute left-4 shrink-0" />
            <span>LIVE INTEL FEED</span>
          </div>
          
          {/* Scrolling ticker */}
          <div className="flex-1 overflow-hidden relative h-full flex items-center">
            <div className="animate-marquee whitespace-nowrap flex items-center font-mono text-[9px] text-[hsl(355_8%_65%)]">
              <span>⚠️ Strait of Hormuz threat score elevated to 74.6 · Alert Level: HIGH</span>
              <span className="mx-6">·</span>
              <span>🚢 Rerouting Russian Urals tankers via Suez Cape of Good Hope adds 12 days transit</span>
              <span className="mx-6">·</span>
              <span>🔋 Strategic Petroleum Reserve (SPR) cover stable at 9.5 days</span>
              <span className="mx-6">·</span>
              <span>📈 OPEC+ announced production cuts trigger 15% spot price spike in Brent Crude</span>
              <span className="mx-6">·</span>
              <span>⚓ Chennai and Paradip ports report minor congestion delays due to monsoon anchorage</span>
              <span className="mx-6">·</span>
              <span>💡 Digital Twin simulation active: what-if disruption modelling Strait of Malacca</span>
              <span className="mx-6">·</span>
              
              {/* Duplicate copy for infinite scroll loop */}
              <span>⚠️ Strait of Hormuz threat score elevated to 74.6 · Alert Level: HIGH</span>
              <span className="mx-6">·</span>
              <span>🚢 Rerouting Russian Urals tankers via Suez Cape of Good Hope adds 12 days transit</span>
              <span className="mx-6">·</span>
              <span>🔋 Strategic Petroleum Reserve (SPR) cover stable at 9.5 days</span>
              <span className="mx-6">·</span>
              <span>📈 OPEC+ announced production cuts trigger 15% spot price spike in Brent Crude</span>
              <span className="mx-6">·</span>
              <span>⚓ Chennai and Paradip ports report minor congestion delays due to monsoon anchorage</span>
              <span className="mx-6">·</span>
              <span>💡 Digital Twin simulation active: what-if disruption modelling Strait of Malacca</span>
            </div>
          </div>
        </footer>
      </div>

      {/* GLOBAL COMMAND PALETTE CMD+K */}
      <CommandDialog open={openCmdPalette} onOpenChange={setOpenCmdPalette}>
        <CommandInput placeholder="Type a command or search workspaces..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Workspaces">
            {NAV_ITEMS.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => {
                  setOpenCmdPalette(false);
                  setLocation(item.href);
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Quick Operations">
            <CommandItem
              onSelect={() => {
                setOpenCmdPalette(false);
                triggerRefresh();
                toast({ title: "Cores Synced", description: "All database caches updated successfully." });
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Synchronize Database Telemetry Cores</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCmdPalette(false);
                setLocation("/settings");
              }}
            >
              <Settings2 className="mr-2 h-4 w-4" />
              <span>Open Diagnostics Console</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

    </div>
  );
}
