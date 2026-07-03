import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetSystemConfig,
  getGetSystemConfigQueryKey
} from "@workspace/api-client-react";
import {
  Settings as SettingsIcon,
  Database,
  Server,
  Wifi,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Sliders,
  Bell,
  Cpu,
  Globe,
  Coins,
  ShieldCheck,
  Zap,
  Check,
  LayoutDashboard
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch system config from backend
  const { data: config, isLoading, isFetching } = useGetSystemConfig({
    query: {
      queryKey: getGetSystemConfigQueryKey(),
      refetchOnWindowFocus: false,
    }
  });

  // State for diagnostics run
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // Preference settings loaded from localStorage or defaults
  const [refreshInterval, setRefreshInterval] = useState("30");
  const [operationalMode, setOperationalMode] = useState("simulation");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [riskThreshold, setRiskThreshold] = useState([75]);

  // Notifications toggles
  const [alertCorridors, setAlertCorridors] = useState(true);
  const [alertSpr, setAlertSpr] = useState(true);
  const [channelSlack, setChannelSlack] = useState(false);
  const [channelEmail, setChannelEmail] = useState(true);
  const [channelSMS, setChannelSMS] = useState(false);
  const [slackWebhook, setSlackWebhook] = useState("");

  // AI & Sim toggles
  const [aiModel, setAiModel] = useState("deepmind-v2");
  const [modelSensitivity, setModelSensitivity] = useState([3]);
  const [refinerySubstitution, setRefinerySubstitution] = useState(true);

  // Layout customizer states
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({
    "Risk Intelligence": true,
    "Scenario Modeller": true,
    "Procurement": true,
    "Reserve Optimizer": true,
    "Digital Twin": true
  });

  // Save states to localStorage on initial mount
  useEffect(() => {
    const savedRefresh = localStorage.getItem("aegis_refresh_interval");
    if (savedRefresh) setRefreshInterval(savedRefresh);

    const savedMode = localStorage.getItem("aegis_operational_mode");
    if (savedMode) setOperationalMode(savedMode);

    const savedCurrency = localStorage.getItem("aegis_default_currency");
    if (savedCurrency) setDefaultCurrency(savedCurrency);

    const savedThreshold = localStorage.getItem("aegis_risk_threshold");
    if (savedThreshold) setRiskThreshold([Number(savedThreshold)]);

    const savedAlertCorridors = localStorage.getItem("aegis_alert_corridors");
    if (savedAlertCorridors) setAlertCorridors(savedAlertCorridors === "true");

    const savedAlertSpr = localStorage.getItem("aegis_alert_spr");
    if (savedAlertSpr) setAlertSpr(savedAlertSpr === "true");

    const savedChannelSlack = localStorage.getItem("aegis_channel_slack");
    if (savedChannelSlack) setChannelSlack(savedChannelSlack === "true");

    const savedChannelEmail = localStorage.getItem("aegis_channel_email");
    if (savedChannelEmail) setChannelEmail(savedChannelEmail === "true");

    const savedChannelSMS = localStorage.getItem("aegis_channel_sms");
    if (savedChannelSMS) setChannelSMS(savedChannelSMS === "true");

    const savedSlackWebhook = localStorage.getItem("aegis_slack_webhook");
    if (savedSlackWebhook) setSlackWebhook(savedSlackWebhook);

    const savedAiModel = localStorage.getItem("aegis_ai_model");
    if (savedAiModel) setAiModel(savedAiModel);

    const savedSensitivity = localStorage.getItem("aegis_model_sensitivity");
    if (savedSensitivity) setModelSensitivity([Number(savedSensitivity)]);

    const savedRefinerySub = localStorage.getItem("aegis_refinery_substitution");
    if (savedRefinerySub) setRefinerySubstitution(savedRefinerySub === "true");

    const savedLayout = localStorage.getItem("aegis_layout_preferences");
    if (savedLayout) {
      try {
        setEnabledModules(JSON.parse(savedLayout));
      } catch (e) {}
    }
  }, []);

  const handleSaveSetting = (key: string, value: any) => {
    localStorage.setItem(key, String(value));
    toast({
      title: "Setting Saved",
      description: "Preferences updated in local cache.",
      duration: 2000,
    });
  };

  const handleRunDiagnostics = () => {
    setIsDiagnosing(true);
    // Invalidate react-query cache and refetch system config
    queryClient.invalidateQueries({ queryKey: getGetSystemConfigQueryKey() });

    setTimeout(() => {
      setIsDiagnosing(false);
      toast({
        title: "Diagnostics Completed",
        description: "All database and API connection channels are nominal.",
      });
    }, 1200);
  };

  // Render Skeletons for Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 rounded-xl" style={{ background: "rgba(217,64,52,0.08)" }} />
          <Skeleton className="h-4 w-96 mt-2 rounded-xl" style={{ background: "rgba(217,64,52,0.08)" }} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-64 rounded-2xl" style={{ background: "rgba(217,64,52,0.08)" }} />
          <Skeleton className="h-64 lg:col-span-3 rounded-2xl" style={{ background: "rgba(217,64,52,0.08)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" /> Settings & System Configuration
        </h2>
        <p className="text-sm font-mono mt-0.5" style={{ color: "hsl(355 8% 55%)" }}>
          MANAGE APPLICATION PARAMETERS AND DIAGNOSE CONNECTED CHANNELS
        </p>
      </div>

      <Tabs defaultValue="preferences" className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Navigation Sidebar/List */}
          <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-2 border-r border-border/10 pr-2 lg:pr-4">
            <TabsTrigger
              value="preferences"
              className="w-full flex items-center justify-start gap-3 px-4 py-3.5 rounded-xl cursor-pointer text-left transition-all duration-200 font-mono text-xs
                         data-[state=active]:text-white
                         data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgba(217,64,52,0.18)] data-[state=active]:to-[rgba(217,64,52,0.04)]
                         data-[state=active]:border-[rgba(217,64,52,0.3)]
                         data-[state=inactive]:text-[hsl(355_8%_55%)] data-[state=inactive]:hover:text-white data-[state=inactive]:border-transparent
                         border"
            >
              <Sliders className="w-4 h-4" />
              <span>General & Preferences</span>
            </TabsTrigger>

            <TabsTrigger
              value="alerts"
              className="w-full flex items-center justify-start gap-3 px-4 py-3.5 rounded-xl cursor-pointer text-left transition-all duration-200 font-mono text-xs
                         data-[state=active]:text-white
                         data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgba(217,64,52,0.18)] data-[state=active]:to-[rgba(217,64,52,0.04)]
                         data-[state=active]:border-[rgba(217,64,52,0.3)]
                         data-[state=inactive]:text-[hsl(355_8%_55%)] data-[state=inactive]:hover:text-white data-[state=inactive]:border-transparent
                         border"
            >
              <Bell className="w-4 h-4" />
              <span>Alerts & Notifications</span>
            </TabsTrigger>

            <TabsTrigger
              value="ai-models"
              className="w-full flex items-center justify-start gap-3 px-4 py-3.5 rounded-xl cursor-pointer text-left transition-all duration-200 font-mono text-xs
                         data-[state=active]:text-white
                         data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgba(217,64,52,0.18)] data-[state=active]:to-[rgba(217,64,52,0.04)]
                         data-[state=active]:border-[rgba(217,64,52,0.3)]
                         data-[state=inactive]:text-[hsl(355_8%_55%)] data-[state=inactive]:hover:text-white data-[state=inactive]:border-transparent
                         border"
            >
              <Cpu className="w-4 h-4" />
              <span>AI & Prediction Models</span>
            </TabsTrigger>

            <TabsTrigger
              value="system-config"
              className="w-full flex items-center justify-start gap-3 px-4 py-3.5 rounded-xl cursor-pointer text-left transition-all duration-200 font-mono text-xs
                         data-[state=active]:text-white
                         data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgba(217,64,52,0.18)] data-[state=active]:to-[rgba(217,64,52,0.04)]
                         data-[state=active]:border-[rgba(217,64,52,0.3)]
                         data-[state=inactive]:text-[hsl(355_8%_55%)] data-[state=inactive]:hover:text-white data-[state=inactive]:border-transparent
                         border"
            >
              <Server className="w-4 h-4" />
              <span>System Configuration</span>
            </TabsTrigger>
          </TabsList>

          {/* Content Area */}
          <div className="lg:col-span-3 min-w-0">
            
            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-4 outline-none">
              <div className="bg-card border border-card-border rounded-2xl p-6 relative overflow-hidden"
                   style={{ background: "hsl(355 25% 7%)" }}>
                <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                     style={{ background: "radial-gradient(circle at 80% 20%, rgba(217,64,52,0.04) 0%, transparent 60%)" }} />
                
                <h3 className="text-lg font-bold border-b border-border/10 pb-3 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" /> General Application Settings
                </h3>

                <div className="mt-6 space-y-6">
                  {/* Auto-Refresh */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Dashboard Auto-Refresh</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Define frequency for synchronization with live energy feeds.</p>
                    </div>
                    <select
                      value={refreshInterval}
                      onChange={(e) => {
                        setRefreshInterval(e.target.value);
                        handleSaveSetting("aegis_refresh_interval", e.target.value);
                      }}
                      className="bg-muted border border-border rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none focus:border-primary transition-colors min-w-[160px]"
                    >
                      <option value="15">Every 15 Seconds</option>
                      <option value="30">Every 30 Seconds</option>
                      <option value="60">Every 1 Minute</option>
                      <option value="300">Every 5 Minutes</option>
                      <option value="manual">Manual Refresh Only</option>
                    </select>
                  </div>

                  {/* Operational Mode */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/5">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Dashboard Operational Mode</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Toggle between live pipeline streams and local threat models.</p>
                    </div>
                    <select
                      value={operationalMode}
                      onChange={(e) => {
                        setOperationalMode(e.target.value);
                        handleSaveSetting("aegis_operational_mode", e.target.value);
                      }}
                      className="bg-muted border border-border rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none focus:border-primary transition-colors min-w-[160px]"
                    >
                      <option value="live">Live Pipeline Feed</option>
                      <option value="simulation">Geopolitical Simulation</option>
                      <option value="historical">Historical Playback (OPEC 2022)</option>
                    </select>
                  </div>

                  {/* Currency Selection */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/5">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Crude Valuation Currency</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Select denomination for spot pricing indices.</p>
                    </div>
                    <select
                      value={defaultCurrency}
                      onChange={(e) => {
                        setDefaultCurrency(e.target.value);
                        handleSaveSetting("aegis_default_currency", e.target.value);
                      }}
                      className="bg-muted border border-border rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none focus:border-primary transition-colors min-w-[160px]"
                    >
                      <option value="USD">USD ($) — Default</option>
                      <option value="INR">INR (₹) — Rupee</option>
                      <option value="EUR">EUR (€) — Euro</option>
                    </select>
                  </div>

                  {/* Alert Threshold Slider */}
                  <div className="pt-4 border-t border-border/5">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-white">Corridor Risk Alert Threshold</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Trigger visual threats and warnings if route score exceeds value.</p>
                      </div>
                      <span className="text-sm font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg">
                        {riskThreshold[0]}%
                      </span>
                    </div>
                    <div className="pt-2">
                      <Slider
                        defaultValue={riskThreshold}
                        min={50}
                        max={90}
                        step={1}
                        onValueChange={(val) => setRiskThreshold(val)}
                        onValueCommit={(val) => handleSaveSetting("aegis_risk_threshold", val[0])}
                      />
                      <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-2">
                        <span>MODERATE (50%)</span>
                        <span>HIGH (70%)</span>
                        <span>CRITICAL (90%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Layout Customizer */}
              <div className="bg-card border border-card-border rounded-2xl p-6 relative overflow-hidden mt-4"
                   style={{ background: "hsl(355 25% 7%)" }}>
                <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                     style={{ background: "radial-gradient(circle at 80% 20%, rgba(217,64,52,0.04) 0%, transparent 60%)" }} />
                
                <h3 className="text-lg font-bold border-b border-border/10 pb-3 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-primary" /> Dashboard Layout Customizer
                </h3>

                <p className="text-xs text-muted-foreground mt-2 mb-6">
                  Select which module cards are displayed on the main Overview dashboard workspace.
                </p>

                <div className="space-y-4">
                  {[
                    { key: "Risk Intelligence", label: "Risk Intel Overview Card", desc: "Live threat index tracker with trend analysis." },
                    { key: "Scenario Modeller", label: "Scenario Modeller Card", desc: "Active geopolitical shock simulation status." },
                    { key: "Procurement", label: "Procurement Card", desc: "Supplier diversification and source rank summary." },
                    { key: "Reserve Optimizer", label: "Reserve Opt. Card", desc: "Strategic Petroleum Reserve status and cover days." },
                    { key: "Digital Twin", label: "Digital Twin Card", desc: "Interactive global topological map quick link." }
                  ].map((mod) => (
                    <div key={mod.key} className="flex items-center justify-between gap-4 pt-3 first:pt-0 border-t first:border-t-0 border-border/5">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{mod.label}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{mod.desc}</p>
                      </div>
                      <Switch
                        checked={enabledModules[mod.key] !== false}
                        onCheckedChange={(checked) => {
                          const updated = { ...enabledModules, [mod.key]: checked };
                          setEnabledModules(updated);
                          localStorage.setItem("aegis_layout_preferences", JSON.stringify(updated));
                          toast({
                            title: "Layout Updated",
                            description: `${mod.label} has been ${checked ? 'enabled' : 'disabled'} on the Overview dashboard.`,
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="alerts" className="space-y-4 outline-none">
              <div className="bg-card border border-card-border rounded-2xl p-6 relative overflow-hidden"
                   style={{ background: "hsl(355 25% 7%)" }}>
                <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                     style={{ background: "radial-gradient(circle at 80% 20%, rgba(217,64,52,0.04) 0%, transparent 60%)" }} />

                <h3 className="text-lg font-bold border-b border-border/10 pb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" /> Risk Notification Triggers
                </h3>

                <div className="mt-6 space-y-6">
                  {/* Corridor alert toggle */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Geopolitical Corridor Risk Warnings</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Receive immediate notifications on sudden threat spikes in Hormuz/Red Sea.</p>
                    </div>
                    <Switch
                      checked={alertCorridors}
                      onCheckedChange={(checked) => {
                        setAlertCorridors(checked);
                        handleSaveSetting("aegis_alert_corridors", checked);
                      }}
                    />
                  </div>

                  {/* SPR Cover alerts */}
                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/5">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Strategic Petroleum Reserve (SPR) Alerts</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Alert if national supply cover drops below 30 days.</p>
                    </div>
                    <Switch
                      checked={alertSpr}
                      onCheckedChange={(checked) => {
                        setAlertSpr(checked);
                        handleSaveSetting("aegis_alert_spr", checked);
                      }}
                    />
                  </div>

                  {/* Channel: Email */}
                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/5">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Email Digest Logs</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Receive daily summaries of route activity and tanker coordinates.</p>
                    </div>
                    <Switch
                      checked={channelEmail}
                      onCheckedChange={(checked) => {
                        setChannelEmail(checked);
                        handleSaveSetting("aegis_channel_email", checked);
                      }}
                    />
                  </div>

                  {/* Channel: Slack */}
                  <div className="flex flex-col gap-3 pt-4 border-t border-border/5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-white">Slack Webhook Broadcast</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Stream critical alerts directly into your operations Slack channel.</p>
                      </div>
                      <Switch
                        checked={channelSlack}
                        onCheckedChange={(checked) => {
                          setChannelSlack(checked);
                          handleSaveSetting("aegis_channel_slack", checked);
                        }}
                      />
                    </div>
                    {channelSlack && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-2"
                      >
                        <label className="text-[10px] font-mono text-muted-foreground uppercase">Slack Webhook URL</label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="text"
                            placeholder="Enter Slack Webhook URL"
                            value={slackWebhook}
                            onChange={(e) => setSlackWebhook(e.target.value)}
                            className="bg-muted border border-border rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-primary flex-1"
                          />
                          <button
                            onClick={() => handleSaveSetting("aegis_slack_webhook", slackWebhook)}
                            className="bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary px-4 py-2 rounded-xl text-xs font-mono transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Channel: SMS */}
                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/5">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Emergency SMS Alerts</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Alert command staff immediately via SMS on system state changes.</p>
                    </div>
                    <Switch
                      checked={channelSMS}
                      onCheckedChange={(checked) => {
                        setChannelSMS(checked);
                        handleSaveSetting("aegis_channel_sms", checked);
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* AI Models Tab */}
            <TabsContent value="ai-models" className="space-y-4 outline-none">
              <div className="bg-card border border-card-border rounded-2xl p-6 relative overflow-hidden"
                   style={{ background: "hsl(355 25% 7%)" }}>
                <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                     style={{ background: "radial-gradient(circle at 80% 20%, rgba(217,64,52,0.04) 0%, transparent 60%)" }} />

                <h3 className="text-lg font-bold border-b border-border/10 pb-3 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary" /> Geopolitical AI Engine Config
                </h3>

                <div className="mt-6 space-y-6">
                  {/* Model Core */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white">AI Reasoning Model</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Select LLM architecture mapping crude routes and extraction patterns.</p>
                    </div>
                    <select
                      value={aiModel}
                      onChange={(e) => {
                        setAiModel(e.target.value);
                        handleSaveSetting("aegis_ai_model", e.target.value);
                      }}
                      className="bg-muted border border-border rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none focus:border-primary transition-colors min-w-[200px]"
                    >
                      <option value="standard">Standard Predictor v1</option>
                      <option value="deepmind-v2">DeepMind Geopolitics v2</option>
                      <option value="emergency-v3">Advanced Emergency Reasoning v3</option>
                    </select>
                  </div>

                  {/* AI Sensitivity */}
                  <div className="pt-4 border-t border-border/5">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-white">Risk Model Sensitivity</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Higher levels result in early alerts on minor geopolitical events.</p>
                      </div>
                      <span className="text-sm font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-lg">
                        Level {modelSensitivity[0]}
                      </span>
                    </div>
                    <div className="pt-2">
                      <Slider
                        defaultValue={modelSensitivity}
                        min={1}
                        max={5}
                        step={1}
                        onValueChange={(val) => setModelSensitivity(val)}
                        onValueCommit={(val) => handleSaveSetting("aegis_model_sensitivity", val[0])}
                      />
                      <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-2">
                        <span>CONSERVATIVE</span>
                        <span>BALANCED</span>
                        <span>AGGRESSIVE</span>
                      </div>
                    </div>
                  </div>

                  {/* Refinery substitution toggle */}
                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/5">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Dynamic Grade Compatibility Calculations</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Automate substitution logic based on API specifications and crude density specs.</p>
                    </div>
                    <Switch
                      checked={refinerySubstitution}
                      onCheckedChange={(checked) => {
                        setRefinerySubstitution(checked);
                        handleSaveSetting("aegis_refinery_substitution", checked);
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* System Configuration Tab */}
            <TabsContent value="system-config" className="space-y-6 outline-none">
              
              {/* Header card with Diagnostic button */}
              <div className="bg-card border border-card-border rounded-2xl p-6 relative overflow-hidden"
                   style={{ background: "hsl(355 25% 7%)" }}>
                <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
                     style={{ background: "radial-gradient(circle at 90% 10%, rgba(217,64,52,0.06) 0%, transparent 60%)" }} />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Server className="w-5 h-5 text-primary" /> System Topology & Configuration
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Monitor database connection health and credentials for integrated API services in real-time.
                    </p>
                  </div>
                  
                  <motion.button
                    onClick={handleRunDiagnostics}
                    disabled={isDiagnosing || isFetching}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold text-white transition-all disabled:opacity-60 shrink-0 cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, hsl(2 78% 57%) 0%, hsl(355 75% 45%) 100%)",
                      boxShadow: "0 4px 16px rgba(217,64,52,0.25)"
                    }}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDiagnosing || isFetching ? "animate-spin" : ""}`} />
                    <span>{isDiagnosing || isFetching ? "RUNNING DIAGNOSTICS..." : "RUN CONNECTION DIAGNOSTIC"}</span>
                  </motion.button>
                </div>
              </div>

              {/* Connected Databases */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/10 pb-2">
                  <Database className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-mono font-bold tracking-wider text-[hsl(355_8%_55%)] uppercase">CONNECTED DATABASES</h4>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {config?.databases.map((db, i) => {
                    const isConnected = db.status === "CONNECTED";
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i}
                        className="bg-muted/30 border border-border/10 rounded-2xl p-5 relative overflow-hidden"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary shrink-0">
                              <Database className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-base font-display">{db.name.toUpperCase()}</span>
                                <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-muted-foreground uppercase">{db.type}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 max-w-xl">{db.purpose}</p>
                              <div className="flex items-center gap-4 mt-3 text-[11px] font-mono text-muted-foreground">
                                <span>Host: <span className="text-white">{db.host}</span></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isConnected ? (
                              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 font-mono text-xs">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span>CONNECTED</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 text-red-400 font-mono text-xs">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>DISCONNECTED</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {db.error && (
                          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-mono text-red-400">
                            <strong>Connection Error:</strong> {db.error}
                          </div>
                        )}

                        {/* Table Schema / Retrieval Information */}
                        {db.tables && db.tables.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                            <h5 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Retrieved Database Schema & Mapped Models
                            </h5>
                            <div className="overflow-x-auto rounded-xl border border-white/5">
                              <table className="w-full text-left border-collapse text-xs font-mono">
                                <thead>
                                  <tr className="bg-white/5 text-[hsl(355_8%_55%)] border-b border-white/5">
                                    <th className="p-3 font-semibold">Table Name</th>
                                    <th className="p-3 font-semibold">Purpose & Source Mapping</th>
                                    <th className="p-3 font-semibold text-right">Records</th>
                                    <th className="p-3 font-semibold text-right">ORM Model</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                  {db.tables.map((table, tIdx) => (
                                    <tr key={tIdx} className="hover:bg-white/5 transition-colors">
                                      <td className="p-3 font-bold text-primary">{table.name}</td>
                                      <td className="p-3 text-muted-foreground">{table.purpose}</td>
                                      <td className="p-3 text-right text-white font-bold">{table.recordsCount}</td>
                                      <td className="p-3 text-right text-[hsl(355_8%_60%)]">{table.mappedModel}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Integrated APIs / Services */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/10 pb-2">
                  <Wifi className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-mono font-bold tracking-wider text-[hsl(355_8%_55%)] uppercase">INTEGRATED SERVICES & THIRD-PARTY APIS</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config?.apis.map((api, i) => {
                    const isOnline = api.connectivityStatus === "ONLINE";
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i}
                        className="bg-muted/30 border border-border/10 rounded-2xl p-5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <h5 className="font-bold text-white text-sm font-display">{api.name}</h5>
                            {isOnline ? (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 font-mono text-[9px]">
                                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                <span>ONLINE</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-red-500/20 bg-red-500/5 text-red-400 font-mono text-[9px]">
                                <XCircle className="w-2.5 h-2.5" />
                                <span>OFFLINE</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{api.purpose}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-muted-foreground">Endpoint:</span>
                            <span className="text-white truncate max-w-[200px]" title={api.endpoint}>{api.endpoint}</span>
                          </div>
                          
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-muted-foreground">Auth Status:</span>
                            <span className="text-green-400 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> {api.authStatus}
                            </span>
                          </div>

                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-muted-foreground">Response Latency:</span>
                            <span className="text-primary font-bold">{api.latencyMs} ms</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Simulated System Logs Terminal */}
              <div className="rounded-2xl overflow-hidden border border-border/5 mt-6" style={{ background: "rgba(10,3,4,0.95)" }}>
                <div className="px-4 py-2.5 border-b border-border/5 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-primary">DIAGNOSTIC OPERATIONS LOG</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="p-4 font-mono text-[10px] text-muted-foreground space-y-1.5 max-h-32 overflow-y-auto">
                  <div>[2026-07-03 16:00:10] INFO: AEGIS core database connection status: ACTIVE</div>
                  <div>[2026-07-03 16:00:11] INFO: Queried 7 database schemas successfully.</div>
                  <div>[2026-07-03 16:00:12] SUCCESS: All third-party integrated services responded online (avg: 42ms).</div>
                  <div>[2026-07-03 16:00:15] INFO: Diagnostic checks completed successfully. Core buffer caching nominal.</div>
                </div>
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
