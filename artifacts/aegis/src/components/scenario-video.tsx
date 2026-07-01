import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, X, Download, Play, Pause, RotateCcw,
  Loader2, Maximize2, AlertTriangle, Clapperboard,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ScenarioVideoProps {
  scenarioName: string;
  scenarioId: string;
  impacts: Array<{
    metric: string;
    before: number;
    after: number;
    unit: string;
    direction: string;
  }>;
  onClose: () => void;
}

type VideoPhase = "preview" | "recording" | "done" | "error";

// ─── Animation constants ─────────────────────────────────────────────────────

const W = 800;
const H = 450;
const TOTAL_FRAMES = 360; // 12s at 30fps
const FPS = 30;
const MS_PER_FRAME = 1000 / FPS; // 33.3ms

const CORRIDORS = [
  { name: "Hormuz Strait", x1: 575, y1: 168, x2: 540, y2: 192, color: "#ef4444", primary: true },
  { name: "Red Sea", x1: 430, y1: 225, x2: 460, y2: 155, color: "#f59e0b", primary: false },
  { name: "Arabian Sea", x1: 540, y1: 200, x2: 660, y2: 215, color: "#22c55e", primary: false },
  { name: "Cape of Good Hope", x1: 335, y1: 340, x2: 660, y2: 215, color: "#8b5cf6", primary: false },
  { name: "Indian Ocean", x1: 600, y1: 280, x2: 680, y2: 260, color: "#06b6d4", primary: false },
];

const NODES = [
  { name: "Hormuz", x: 560, y: 178, r: 8, color: "#ef4444" },
  { name: "Jamnagar", x: 648, y: 220, r: 7, color: "#22c55e" },
  { name: "Paradip", x: 710, y: 248, r: 6, color: "#22c55e" },
  { name: "Aden", x: 472, y: 228, r: 6, color: "#f59e0b" },
  { name: "Suez", x: 436, y: 152, r: 6, color: "#f59e0b" },
  { name: "Bab-el-Mandeb", x: 455, y: 240, r: 6, color: "#f59e0b" },
  { name: "Mumbai", x: 660, y: 255, r: 7, color: "#22c55e" },
];

const PHASES = [
  { start: 0, end: 0.22, label: "T+00H  PRE-DISRUPTION", sub: "Normal operations — all corridors active", color: "#22c55e" },
  { start: 0.22, end: 0.5, label: "T+06H  DISRUPTION EVENT", sub: "Hormuz closure confirmed — emergency rerouting", color: "#ef4444" },
  { start: 0.5, end: 0.75, label: "T+24H  CASCADING IMPACT", sub: "Supply gap widening — spot prices surging", color: "#f59e0b" },
  { start: 0.75, end: 1.0, label: "T+72H  SYSTEM RESPONSE", sub: "Alt routes active — SPR drawdown authorized", color: "#06b6d4" },
];

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  frame: number,
  impacts: ScenarioVideoProps["impacts"],
  scenarioName: string
) {
  const t = frame / TOTAL_FRAMES;
  const phase = PHASES.find(p => t >= p.start && t < p.end) ?? PHASES[PHASES.length - 1];
  const phaseIdx = PHASES.indexOf(phase);
  const phaseT = easeInOut((t - phase.start) / (phase.end - phase.start));

  // ── Background ─────────────────────────────────────────────────────────────
  ctx.fillStyle = "#0a0204";
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = "#ff3333";
  ctx.lineWidth = 0.5;
  for (let x = 0; x < W; x += 45) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 45) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.restore();

  // Ambient glow (radial)
  const grd = ctx.createRadialGradient(W * 0.6, H * 0.45, 10, W * 0.6, H * 0.45, 260);
  grd.addColorStop(0, `rgba(217,64,52,${0.06 + phaseIdx * 0.02})`);
  grd.addColorStop(1, "transparent");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // ── Land masses (simplified Middle East / Indian Ocean region) ────────────
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = "#ffffff";
  const landShapes = [
    { cx: 545, cy: 195, rx: 78, ry: 48 }, // Arabian Peninsula
    { cx: 490, cy: 148, rx: 45, ry: 28 }, // Persian Gulf coast
    { cx: 452, cy: 152, rx: 20, ry: 40 }, // Red Sea coast / Egypt
    { cx: 420, cy: 202, rx: 22, ry: 55 }, // East Africa
    { cx: 665, cy: 248, rx: 52, ry: 82 }, // India
    { cx: 380, cy: 340, rx: 30, ry: 50 }, // South Africa
  ];
  landShapes.forEach(l => {
    ctx.beginPath();
    ctx.ellipse(l.cx, l.cy, l.rx, l.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // ── Shipping Corridors ────────────────────────────────────────────────────
  CORRIDORS.forEach((corr, i) => {
    const isHormuz = corr.primary;
    const isClosed = isHormuz && phaseIdx >= 1;

    let alpha = 0.55;
    let strokeColor = corr.color;
    let width = 2.5;
    let dashed = false;

    if (isClosed) {
      // Hormuz fades out after phase 1
      alpha = lerp(0.55, 0.06, Math.min(1, (phaseIdx - 1) + phaseT));
      width = lerp(3, 1, Math.min(1, (phaseIdx - 1) + phaseT));
      strokeColor = "#ef4444";
      dashed = true;
    } else if (!isHormuz && phaseIdx >= 2) {
      // Alternative routes get brighter in phases 3+
      alpha = lerp(0.5, 0.9, Math.min(1, (phaseIdx - 2) + phaseT * 0.8));
      width = lerp(2.5, 4, Math.min(1, (phaseIdx - 2) + phaseT * 0.8));
    } else if (!isHormuz) {
      alpha = 0.4 + 0.15 * Math.sin(frame * 0.05 + i);
    }

    // Glow
    ctx.save();
    ctx.globalAlpha = alpha * 0.3;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = width + 8;
    ctx.shadowBlur = 16;
    ctx.shadowColor = strokeColor;
    ctx.lineCap = "round";
    if (dashed) ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(corr.x1, corr.y1);
    // Bezier through center point for curved routes
    const mx = (corr.x1 + corr.x2) / 2;
    const my = Math.min(corr.y1, corr.y2) - 30;
    ctx.quadraticCurveTo(mx, my, corr.x2, corr.y2);
    ctx.stroke();
    ctx.restore();

    // Main line
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.shadowBlur = 8;
    ctx.shadowColor = strokeColor;
    if (dashed) ctx.setLineDash([8, 8]);
    ctx.lineDashOffset = -(frame * 0.8);
    ctx.beginPath();
    ctx.moveTo(corr.x1, corr.y1);
    ctx.quadraticCurveTo(mx, my, corr.x2, corr.y2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Flow particles on open routes
    if (!isClosed && alpha > 0.4) {
      ctx.save();
      ctx.globalAlpha = alpha * 0.7;
      ctx.fillStyle = strokeColor;
      ctx.shadowBlur = 6;
      ctx.shadowColor = strokeColor;
      const particleT = ((frame * 0.004 + i * 0.3) % 1);
      const px = corr.x1 + (corr.x2 - corr.x1) * particleT;
      const py = corr.y1 + (corr.y2 - corr.y1) * particleT - Math.sin(particleT * Math.PI) * 20;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });

  // ── Nodes ─────────────────────────────────────────────────────────────────
  NODES.forEach(node => {
    const isHormuz = node.name === "Hormuz";
    const alerting = isHormuz && phaseIdx >= 1;
    const pulseFactor = alerting ? Math.abs(Math.sin(frame * 0.12)) : 0;
    const nodeColor = alerting ? "#ef4444" : node.color;

    // Pulse ring
    if (pulseFactor > 0) {
      ctx.save();
      ctx.globalAlpha = pulseFactor * 0.5;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r + 8 + pulseFactor * 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Glow
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = nodeColor;
    ctx.shadowBlur = 20;
    ctx.shadowColor = nodeColor;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Core
    ctx.save();
    ctx.fillStyle = nodeColor;
    ctx.shadowBlur = 10;
    ctx.shadowColor = nodeColor;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Label
    ctx.save();
    ctx.font = `${isHormuz && alerting ? "bold " : ""}10px 'DM Mono', monospace`;
    ctx.fillStyle = alerting ? "#ff6666" : "rgba(255,255,255,0.7)";
    ctx.textAlign = "center";
    ctx.fillText(node.name, node.x, node.y - node.r - 7);
    ctx.restore();
  });

  // ── Header bar ────────────────────────────────────────────────────────────
  ctx.save();
  const headerGrd = ctx.createLinearGradient(0, 0, 0, 70);
  headerGrd.addColorStop(0, "rgba(10,2,4,0.95)");
  headerGrd.addColorStop(1, "rgba(10,2,4,0)");
  ctx.fillStyle = headerGrd;
  ctx.fillRect(0, 0, W, 70);
  ctx.restore();

  ctx.save();
  ctx.font = "bold 12px 'DM Mono', monospace";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("▌ AEGIS  SUPPLY CHAIN DIGITAL TWIN", 18, 26);

  ctx.font = `bold 15px 'DM Mono', monospace`;
  ctx.fillStyle = phase.color;
  ctx.shadowBlur = 10;
  ctx.shadowColor = phase.color;
  ctx.fillText(phase.label, 18, 50);

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.65;
  ctx.font = "10px 'DM Mono', monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(phase.sub, 18, 63);

  // Scenario tag top-right
  ctx.globalAlpha = 0.55;
  ctx.font = "10px 'DM Mono', monospace";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "right";
  ctx.fillText(`SCENARIO: ${scenarioName.toUpperCase()}`, W - 16, 26);
  ctx.restore();

  // ── Metrics bar (bottom) ──────────────────────────────────────────────────
  const footerGrd = ctx.createLinearGradient(0, H - 80, 0, H);
  footerGrd.addColorStop(0, "rgba(10,2,4,0)");
  footerGrd.addColorStop(1, "rgba(10,2,4,0.95)");
  ctx.fillStyle = footerGrd;
  ctx.fillRect(0, H - 80, W, 80);

  const displayImpacts = impacts.slice(0, 4);
  const colW = W / displayImpacts.length;

  displayImpacts.forEach((imp, i) => {
    const transitionProgress = phaseIdx < 1 ? 0 : Math.min(1, ((t - 0.22) / 0.53) * 1.5);
    const val = lerp(imp.before, imp.after, easeInOut(transitionProgress));
    const isFalling = imp.direction === "down";
    const metricColor = isFalling
      ? `hsl(0 85% ${50 + transitionProgress * 15}%)`
      : "#f59e0b";

    const x = i * colW + 16;

    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.font = "9px 'DM Mono', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(imp.metric.toUpperCase(), x, H - 48);

    ctx.globalAlpha = 1;
    ctx.font = "bold 16px 'DM Mono', monospace";
    ctx.fillStyle = metricColor;
    ctx.shadowBlur = 8;
    ctx.shadowColor = metricColor;
    ctx.fillText(`${val.toFixed(1)} ${imp.unit}`, x, H - 30);

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.7;
    ctx.font = "9px 'DM Mono', monospace";
    ctx.fillStyle = metricColor;
    const delta = imp.after - imp.before;
    ctx.fillText(`${delta > 0 ? "+" : ""}${delta.toFixed(1)} projected`, x, H - 16);

    // Divider
    if (i < displayImpacts.length - 1) {
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = "#ff3333";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo((i + 1) * colW, H - 70);
      ctx.lineTo((i + 1) * colW, H - 8);
      ctx.stroke();
    }
    ctx.restore();
  });

  // ── Progress bar ──────────────────────────────────────────────────────────
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#ff3333";
  ctx.fillRect(0, H - 3, W, 3);
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = phase.color;
  ctx.shadowBlur = 6;
  ctx.shadowColor = phase.color;
  ctx.fillRect(0, H - 3, W * t, 3);
  ctx.restore();
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ScenarioVideoModal({ scenarioName, impacts, onClose }: ScenarioVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const frameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [phase, setPhase] = useState<VideoPhase>("preview");
  const [isPlaying, setIsPlaying] = useState(true);
  const [recordProgress, setRecordProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supportsRecording, setSupportsRecording] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detect MediaRecorder support on mount
  useEffect(() => {
    const supported = typeof MediaRecorder !== "undefined"
      && typeof HTMLCanvasElement.prototype.captureStream === "function"
      && (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        || MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
        || MediaRecorder.isTypeSupported("video/webm"));
    setSupportsRecording(supported);
  }, []);

  // ── Live preview animation loop ───────────────────────────────────────────
  const startPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = frameRef.current;
    let running = true;

    const tick = () => {
      if (!running) return;
      drawFrame(ctx, frame % TOTAL_FRAMES, impacts, scenarioName);
      frame = (frame + 1) % TOTAL_FRAMES;
      frameRef.current = frame;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, [impacts, scenarioName]);

  // ── Stop preview loop ─────────────────────────────────────────────────────
  const stopPreview = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Start preview on mount
  useEffect(() => {
    const cleanup = startPreview();
    return () => { cleanup?.(); };
  }, [startPreview]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (phase !== "preview") return;
    if (isPlaying) {
      cancelAnimationFrame(rafRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      startPreview();
    }
  }, [phase, isPlaying, startPreview]);

  // Restart preview
  const handleRestart = useCallback(() => {
    frameRef.current = 0;
    cancelAnimationFrame(rafRef.current);
    setIsPlaying(true);
    startPreview();
  }, [startPreview]);

  // ── Record to WebM ────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setError(null);
    setPhase("recording");
    setRecordProgress(0);
    stopPreview();
    chunksRef.current = [];

    try {
      const mimeType = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ].find(t => MediaRecorder.isTypeSupported(t)) ?? "video/webm";

      const stream = canvas.captureStream(FPS);
      const mr = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4_000_000,
      });
      mrRef.current = mr;

      mr.onerror = () => {
        setError("Recording failed. The browser may not support video export in this environment. You can still watch the live preview below.");
        setPhase("error");
        startPreview();
      };

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        if (chunksRef.current.length === 0 || chunksRef.current.reduce((a, b) => a + b.size, 0) < 1000) {
          setError("The recording produced no data. Your browser may restrict canvas recording in iframes. The live animation above works perfectly — use your screen recorder to capture it.");
          setPhase("error");
          frameRef.current = 0;
          setIsPlaying(true);
          startPreview();
          return;
        }
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setPhase("done");
      };

      mr.start(300); // collect data every 300ms

      // Render frames using setTimeout for consistent timing (RAF can be throttled)
      let recordFrame = 0;
      const renderRecordFrame = () => {
        if (recordFrame >= TOTAL_FRAMES) {
          // Flush and stop
          try { mr.requestData(); } catch (_) { /* ignore */ }
          setTimeout(() => {
            try { if (mr.state === "recording") mr.stop(); } catch (_) { /* ignore */ }
          }, 400);
          return;
        }
        drawFrame(ctx, recordFrame, impacts, scenarioName);
        setRecordProgress(Math.round((recordFrame / TOTAL_FRAMES) * 100));
        recordFrame++;
        timerRef.current = setTimeout(renderRecordFrame, MS_PER_FRAME);
      };

      // Small delay so MediaRecorder fully initialises before first frame
      timerRef.current = setTimeout(renderRecordFrame, 80);

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Recording unavailable: ${msg}. Use a screen recorder to capture the live animation.`);
      setPhase("error");
      frameRef.current = 0;
      setIsPlaying(true);
      startPreview();
    }
  }, [impacts, scenarioName, stopPreview, startPreview]);

  // ── Fullscreen ────────────────────────────────────────────────────────────
  const handleFullscreen = () => {
    if (phase === "done" && videoRef.current) {
      videoRef.current.requestFullscreen?.();
    } else if (canvasRef.current) {
      canvasRef.current.requestFullscreen?.();
    }
  };

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `aegis-${scenarioName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-simulation.webm`;
    a.click();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      try { if (mrRef.current?.state === "recording") mrRef.current.stop(); } catch (_) { /* ignore */ }
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────

  const isRecording = phase === "recording";
  const isDone = phase === "done";
  const isError = phase === "error";
  const isLivePreview = phase === "preview" || isError;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        className="w-full max-w-4xl rounded-2xl overflow-hidden"
        style={{
          background: "hsl(355 25% 5%)",
          border: "1px solid rgba(217,64,52,0.3)",
          boxShadow: "0 0 80px rgba(217,64,52,0.15), 0 40px 80px rgba(0,0,0,0.6)",
        }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "rgba(217,64,52,0.15)" }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: "rgba(217,64,52,0.15)", border: "1px solid rgba(217,64,52,0.25)" }}>
              <Clapperboard className="w-5 h-5" style={{ color: "hsl(2 78% 65%)" }} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {scenarioName} — Simulation Playback
              </h3>
              <p className="text-[10px] font-mono" style={{ color: "hsl(355 8% 50%)" }}>
                SUPPLY CHAIN DISRUPTION VISUALIZATION · {Math.round(TOTAL_FRAMES / FPS)}s · {W}×{H}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "hsl(355 8% 50%)" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Main content ────────────────────────────────────────────────── */}
        <div className="p-5 space-y-4">

          {/* Video / Canvas viewport */}
          <div className="relative rounded-xl overflow-hidden"
            style={{ background: "#0a0204", border: "1px solid rgba(217,64,52,0.15)", aspectRatio: `${W}/${H}` }}>

            {/* The canvas — always mounted so the animation can play / record frames */}
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="w-full h-auto block"
              style={{ display: isDone ? "none" : "block" }}
            />

            {/* Recorded video player */}
            {isDone && videoUrl && (
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                autoPlay
                loop
                className="w-full h-auto block"
                style={{ background: "#0a0204" }}
              />
            )}

            {/* Recording overlay */}
            {isRecording && (
              <div className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ background: "rgba(10,2,4,0.7)" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(217,64,52,0.15)", border: "1px solid rgba(217,64,52,0.3)" }}>
                  <Loader2 className="w-7 h-7 animate-spin" style={{ color: "hsl(2 78% 57%)" }} />
                </div>
                <div className="text-sm font-mono font-bold text-white mb-1">
                  ENCODING — {recordProgress}%
                </div>
                <div className="text-[10px] font-mono mb-4" style={{ color: "hsl(355 8% 55%)" }}>
                  Frame {Math.round(recordProgress / 100 * TOTAL_FRAMES)} / {TOTAL_FRAMES}
                </div>
                <div className="w-56 h-2 rounded-full overflow-hidden" style={{ background: "rgba(217,64,52,0.12)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, hsl(2 78% 57%), hsl(355 75% 45%))" }}
                    animate={{ width: `${recordProgress}%` }}
                    transition={{ duration: 0.1 }} />
                </div>
              </div>
            )}

            {/* Live playback badge */}
            {isLivePreview && !isRecording && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold"
                style={{ background: "rgba(10,2,4,0.8)", border: "1px solid rgba(217,64,52,0.25)", color: "hsl(2 78% 65%)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(2_78%_57%)] animate-pulse" />
                LIVE PREVIEW
              </div>
            )}
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {(error || isError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#f59e0b" }} />
                <p className="text-xs font-mono leading-relaxed" style={{ color: "hsl(0 0% 80%)" }}>
                  {error ?? "Recording is not supported in this browser context. The live animation above is fully functional."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PHASES.map((p, i) => (
              <div key={i} className="rounded-xl px-3 py-2.5"
                style={{ background: "rgba(217,64,52,0.04)", border: "1px solid rgba(217,64,52,0.1)" }}>
                <div className="text-[8px] font-mono font-bold mb-0.5" style={{ color: p.color }}>
                  {p.label.split("  ")[0]}
                </div>
                <div className="text-[9px] font-mono leading-tight" style={{ color: "hsl(355 8% 55%)" }}>
                  {p.label.split("  ")[1]}
                </div>
              </div>
            ))}
          </div>

          {/* ── Controls ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 flex-wrap">

            {/* Live preview controls */}
            {isLivePreview && (
              <>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={togglePlay}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-bold text-xs transition-all"
                  style={{
                    background: "rgba(217,64,52,0.1)",
                    border: "1px solid rgba(217,64,52,0.3)",
                    color: "hsl(2 78% 65%)",
                  }}>
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isPlaying ? "PAUSE" : "PLAY"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-bold text-xs transition-all"
                  style={{
                    background: "rgba(217,64,52,0.08)",
                    border: "1px solid rgba(217,64,52,0.2)",
                    color: "hsl(355 8% 60%)",
                  }}>
                  <RotateCcw className="w-3.5 h-3.5" />
                  RESTART
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={handleFullscreen}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-bold text-xs transition-all"
                  style={{
                    background: "rgba(217,64,52,0.08)",
                    border: "1px solid rgba(217,64,52,0.2)",
                    color: "hsl(355 8% 60%)",
                  }}>
                  <Maximize2 className="w-3.5 h-3.5" />
                  FULLSCREEN
                </motion.button>

                {supportsRecording && (
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={startRecording}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono font-bold text-xs transition-all ml-auto"
                    style={{
                      background: "linear-gradient(135deg, hsl(2 78% 57%) 0%, hsl(355 75% 45%) 100%)",
                      color: "white",
                      boxShadow: "0 0 20px rgba(217,64,52,0.3)",
                    }}>
                    <Video className="w-3.5 h-3.5" />
                    EXPORT WEBM
                  </motion.button>
                )}
              </>
            )}

            {/* Recording in progress — just shows progress, no other controls */}
            {isRecording && (
              <span className="text-[10px] font-mono" style={{ color: "hsl(355 8% 50%)" }}>
                Recording {TOTAL_FRAMES} frames at {FPS}fps… do not close this window
              </span>
            )}

            {/* Done state */}
            {isDone && (
              <>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => videoRef.current?.play()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-bold text-xs"
                  style={{ background: "rgba(217,64,52,0.1)", border: "1px solid rgba(217,64,52,0.3)", color: "hsl(2 78% 65%)" }}>
                  <Play className="w-3.5 h-3.5" /> PLAY
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => { if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play(); } }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-bold text-xs"
                  style={{ background: "rgba(217,64,52,0.08)", border: "1px solid rgba(217,64,52,0.2)", color: "hsl(355 8% 60%)" }}>
                  <RotateCcw className="w-3.5 h-3.5" /> REPLAY
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={handleFullscreen}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-bold text-xs"
                  style={{ background: "rgba(217,64,52,0.08)", border: "1px solid rgba(217,64,52,0.2)", color: "hsl(355 8% 60%)" }}>
                  <Maximize2 className="w-3.5 h-3.5" /> FULLSCREEN
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono font-bold text-xs ml-auto"
                  style={{
                    background: "linear-gradient(135deg, hsl(2 78% 57%) 0%, hsl(355 75% 45%) 100%)",
                    color: "white",
                    boxShadow: "0 0 16px rgba(217,64,52,0.3)",
                  }}>
                  <Download className="w-3.5 h-3.5" /> DOWNLOAD WEBM
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => { setPhase("preview"); setVideoUrl(null); frameRef.current = 0; setIsPlaying(true); startPreview(); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-bold text-xs"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "hsl(355 8% 50%)" }}>
                  <RotateCcw className="w-3.5 h-3.5" /> BACK TO LIVE
                </motion.button>
              </>
            )}
          </div>

          {/* Info footer */}
          <div className="text-[9px] font-mono" style={{ color: "hsl(355 8% 38%)" }}>
            {isLivePreview && "Live canvas animation · 4 phases · " + TOTAL_FRAMES + " frames · Click EXPORT WEBM to record and download"}
            {isRecording && "Encoding via MediaRecorder API · Do not switch tabs during recording"}
            {isDone && "Recording complete · Use video controls above to preview and download"}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
