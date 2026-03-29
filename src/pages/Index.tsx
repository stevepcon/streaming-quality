import { useState, useMemo } from 'react';
import { SimulationInput, simulate, getDegradationParams, PRESETS } from '@/lib/simulation';
import ControlPanel from '@/components/ControlPanel';
import ResultsPanel from '@/components/ResultsPanel';
import VisualPreview from '@/components/VisualPreview';
import { ScrollArea } from '@/components/ui/scroll-area';

const defaultInput: SimulationInput = PRESETS[0].input;

export default function Index() {
  const [input, setInput] = useState<SimulationInput>(defaultInput);

  const result = useMemo(() => simulate(input), [input]);
  const degradation = useMemo(() => getDegradationParams(input, result), [input, result]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-signal-green animate-pulse-glow" />
          <h1 className="text-sm font-mono font-bold tracking-tight text-foreground">
            CODEC<span className="text-primary">SIM</span>
          </h1>
          <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">
            Video Pipeline Simulator
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
          <span className="hidden md:inline">v1.0</span>
          <span className="text-signal-cyan">LIVE</span>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Controls */}
        <aside className="w-72 lg:w-80 border-r border-border shrink-0 hidden md:block">
          <ScrollArea className="h-[calc(100vh-49px)]">
            <div className="p-4">
              <ControlPanel input={input} onChange={setInput} />
            </div>
          </ScrollArea>
        </aside>

        {/* Right: Results */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 space-y-4 max-w-4xl">
            <VisualPreview degradation={degradation} qualityScore={result.qualityScore} />
            <ResultsPanel result={result} />

            {/* Mobile controls */}
            <div className="md:hidden">
              <details className="bg-secondary rounded-lg border border-border">
                <summary className="px-4 py-3 text-xs font-mono font-semibold text-signal-cyan cursor-pointer">
                  ⚙️ Controls
                </summary>
                <div className="p-4 border-t border-border">
                  <ControlPanel input={input} onChange={setInput} />
                </div>
              </details>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
