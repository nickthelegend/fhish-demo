"use client";
import { useState, useEffect } from "react";

interface DebugEntry {
  time: string;
  source: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
}

function log(prefix: string, ...args: any[]) {
  console.log(`[DebugPanel] ${prefix}`, ...args);
}

export function DebugPanel() {
  const [logs, setLogs] = useState<DebugEntry[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const formatTime = () => new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 });

    const capture = (level: DebugEntry["level"], source: string) => (...args: any[]) => {
      const msg = args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" ");
      setLogs(prev => [
        ...prev.slice(-49),
        { time: formatTime(), level, source, message: msg }
      ]);
      if (level === "error") originalError.apply(console, [`[${source}]`, ...args]);
      else if (level === "warn") originalWarn.apply(console, [`[${source}]`, ...args]);
      else originalLog.apply(console, [`[${source}]`, ...args]);
    };

    const proxy = (source: string) => ({
      log: capture("info", source),
      error: capture("error", source),
      warn: capture("warn", source),
    });

    (window as any).__debugProxy = proxy;
    log("Debug panel active");

    return () => {
      (window as any).__debugProxy = null;
    };
  }, []);

  const levelColor = (level: DebugEntry["level"]) => {
    switch (level) {
      case "error": return "text-rose-400";
      case "warn": return "text-amber-400";
      case "success": return "text-emerald-400";
      default: return "text-gray-300";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="bg-black/90 border border-gray-700 text-gray-400 px-3 py-1.5 rounded-lg text-xs font-mono hover:border-gray-500 transition-colors"
      >
        {expanded ? "▼ Debug" : "▶ Debug"} ({logs.length})
      </button>

      {expanded && (
        <div className="mt-2 bg-black/95 border border-gray-700 rounded-lg w-[600px] max-h-[400px] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 sticky top-0 bg-black">
            <span className="text-gray-500 text-xs font-mono">Browser Console ({logs.length} entries)</span>
            <button onClick={() => setLogs([])} className="text-gray-600 hover:text-gray-400 text-xs">Clear</button>
          </div>
          <div className="font-mono text-xs">
            {logs.length === 0 && (
              <div className="px-3 py-2 text-gray-600">No logs yet...</div>
            )}
            {logs.map((entry, i) => (
              <div key={i} className={`px-3 py-1 border-b border-gray-900 ${levelColor(entry.level)}`}>
                <span className="text-gray-600">[{entry.time}]</span>{" "}
                <span className="text-indigo-400">[{entry.source}]</span>{" "}
                <span className="opacity-80">{entry.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
