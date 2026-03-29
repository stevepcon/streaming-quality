import { SimulationResult } from '@/lib/simulation';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

interface ResultsPanelProps {
  result: SimulationResult;
}

function MetricCard({ label, value, unit, color, subtext }: {
  label: string; value: string | number; unit?: string; color: string; subtext?: string;
}) {
  return (
    <div className="bg-secondary rounded-lg p-4 border border-border">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-mono font-bold ${color}`}>{value}</span>
        {unit && <span className="text-xs font-mono text-muted-foreground">{unit}</span>}
      </div>
      {subtext && <div className="text-[10px] font-mono text-muted-foreground mt-1">{subtext}</div>}
    </div>
  );
}

function QualityBar({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-mono">
        <span className="text-muted-foreground">{label}</span>
        <span className={color}>{score}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 80 ? 'bg-signal-green' : score >= 50 ? 'bg-signal-amber' : 'bg-signal-red'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function getQualityLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 30) return 'Poor';
  return 'Bad';
}

function getLatencyLabel(ms: number): string {
  if (ms < 500) return 'Ultra-low';
  if (ms < 2000) return 'Low';
  if (ms < 5000) return 'Medium';
  return 'High';
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-signal-green';
  if (score >= 50) return 'text-signal-amber';
  return 'text-signal-red';
}

export default function ResultsPanel({ result }: ResultsPanelProps) {
  const bwDisplay = result.bandwidthKbps >= 1000
    ? `${(result.bandwidthKbps / 1000).toFixed(1)}`
    : `${result.bandwidthKbps}`;
  const bwUnit = result.bandwidthKbps >= 1000 ? 'Mbps' : 'kbps';

  const latencyDisplay = result.latencyMs >= 1000
    ? `${(result.latencyMs / 1000).toFixed(1)}`
    : `${result.latencyMs}`;
  const latencyUnit = result.latencyMs >= 1000 ? 's' : 'ms';

  const radarData = [
    { metric: 'Quality', value: result.qualityScore },
    { metric: 'Compat.', value: result.compatibilityScore },
    { metric: 'Resilience', value: result.packetLossResilience },
    { metric: 'Low Latency', value: Math.max(0, 100 - (result.latencyMs / 300)) },
    { metric: 'Efficiency', value: Math.max(0, 100 - (result.bandwidthKbps / 300)) },
  ];

  return (
    <div className="space-y-4">
      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="📊 Quality (VMAF est.)"
          value={result.qualityScore}
          unit="/100"
          color={getScoreColor(result.qualityScore)}
          subtext={getQualityLabel(result.qualityScore)}
        />
        <MetricCard
          label="⏱️ Latency"
          value={latencyDisplay}
          unit={latencyUnit}
          color={result.latencyMs < 2000 ? 'text-signal-green' : result.latencyMs < 5000 ? 'text-signal-amber' : 'text-signal-red'}
          subtext={getLatencyLabel(result.latencyMs)}
        />
        <MetricCard
          label="📡 Bandwidth"
          value={bwDisplay}
          unit={bwUnit}
          color="text-signal-cyan"
        />
        <MetricCard
          label="📱 Compatibility"
          value={result.compatibilityScore}
          unit="%"
          color={getScoreColor(result.compatibilityScore)}
        />
      </div>

      {/* Quality bars */}
      <div className="bg-secondary rounded-lg p-4 border border-border space-y-3">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Detailed Scores</div>
        <QualityBar score={result.qualityScore} label="Quality (VMAF)" color={getScoreColor(result.qualityScore)} />
        <QualityBar score={result.compatibilityScore} label="Compatibility" color={getScoreColor(result.compatibilityScore)} />
        <QualityBar score={result.packetLossResilience} label="Loss Resilience" color={getScoreColor(result.packetLossResilience)} />
      </div>

      {/* Radar chart */}
      <div className="bg-secondary rounded-lg p-4 border border-border">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Tradeoff Radar</div>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(220, 15%, 22%)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: 'hsl(215, 15%, 50%)' }}
            />
            <Radar
              dataKey="value"
              stroke="hsl(175, 80%, 50%)"
              fill="hsl(175, 80%, 50%)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Disclaimer */}
      <div className="text-[10px] font-mono text-muted-foreground/60 text-center px-4">
        ⚠️ This is a simulation, not exact measurement. VMAF estimation is approximate. Visual preview is illustrative.
      </div>
    </div>
  );
}
