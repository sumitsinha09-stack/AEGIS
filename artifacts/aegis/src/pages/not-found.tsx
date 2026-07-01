import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="h-[calc(100vh-6rem)] w-full flex items-center justify-center">
      <div className="glass-panel p-8 rounded-xl max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-critical/10 rounded-full border border-critical/30">
            <AlertCircle className="h-12 w-12 text-critical" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-mono tracking-widest text-primary drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">
            ERR: 404
          </h1>
          <p className="text-muted-foreground font-mono">
            SECTOR NOT FOUND
          </p>
        </div>

        <div className="p-4 bg-black/40 rounded border border-border/50 text-left">
          <div className="text-xs font-mono text-muted-foreground mb-1">SYSTEM DIAGNOSTIC:</div>
          <div className="text-sm font-mono">The requested navigation vector does not exist in the current operational grid.</div>
        </div>

        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 rounded font-mono text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          RETURN TO OVERVIEW
        </Link>
      </div>
    </div>
  );
}
