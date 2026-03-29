import { SimulationInput, Codec, TransportLayer, StreamingProtocol, Resolution, FrameRate, MotionLevel, DeviceType, NetworkType, PRESETS } from '@/lib/simulation';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ControlPanelProps {
  input: SimulationInput;
  onChange: (input: SimulationInput) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-signal-cyan">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ControlSelect<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: T[]; onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-mono text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger className="h-8 bg-secondary border-border text-xs font-mono">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o} className="text-xs font-mono">{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function ControlPanel({ input, onChange }: ControlPanelProps) {
  const set = <K extends keyof SimulationInput>(key: K, value: SimulationInput[K]) =>
    onChange({ ...input, [key]: value });

  const bitrateDisplay = input.bitrate >= 1000
    ? `${(input.bitrate / 1000).toFixed(1)} Mbps`
    : `${input.bitrate} kbps`;

  return (
    <div className="space-y-6">
      {/* Presets */}
      <Section title="⚡ Presets">
        <div className="grid grid-cols-1 gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => onChange(p.input)}
              className="text-left px-3 py-2 rounded-md bg-secondary hover:bg-secondary/80 border border-border hover:border-primary/40 transition-colors"
            >
              <div className="text-xs font-mono font-medium text-foreground">{p.name}</div>
              <div className="text-[10px] font-mono text-muted-foreground">{p.description}</div>
            </button>
          ))}
        </div>
      </Section>

      <div className="h-px bg-border" />

      {/* Video Encoding */}
      <Section title="🎥 Encoding">
        <ControlSelect label="Codec" value={input.codec} options={['H.264', 'H.265', 'AV1'] as Codec[]} onChange={(v) => set('codec', v)} />
        <div className="space-y-1.5">
          <Label className="text-xs font-mono text-muted-foreground">
            Bitrate: <span className="text-signal-cyan">{bitrateDisplay}</span>
          </Label>
          <Slider
            value={[input.bitrate]}
            onValueChange={([v]) => set('bitrate', v)}
            min={200}
            max={30000}
            step={100}
            className="py-1"
          />
        </div>
        <ControlSelect label="Resolution" value={input.resolution} options={['480p', '720p', '1080p', '1440p', '4K'] as Resolution[]} onChange={(v) => set('resolution', v)} />
        <ControlSelect label="Frame Rate" value={String(input.frameRate)} options={['24', '30', '60']} onChange={(v) => set('frameRate', Number(v) as FrameRate)} />
        <ControlSelect label="Motion Level" value={input.motionLevel} options={['low', 'medium', 'high'] as MotionLevel[]} onChange={(v) => set('motionLevel', v)} />
      </Section>

      <div className="h-px bg-border" />

      {/* Network */}
      <Section title="🌐 Network">
        <ControlSelect label="Transport" value={input.transportLayer} options={['UDP', 'TCP'] as TransportLayer[]} onChange={(v) => set('transportLayer', v)} />
        <ControlSelect label="Protocol" value={input.streamingProtocol} options={['SRT', 'RTMP', 'WebRTC', 'HLS', 'DASH'] as StreamingProtocol[]} onChange={(v) => set('streamingProtocol', v)} />
        <ControlSelect label="Network" value={input.networkType} options={['3G', '4G', '5G', 'WiFi'] as NetworkType[]} onChange={(v) => set('networkType', v)} />
      </Section>

      <div className="h-px bg-border" />

      {/* Playback */}
      <Section title="📱 Playback">
        <ControlSelect label="Device" value={input.deviceType} options={['mobile', 'desktop', 'tv'] as DeviceType[]} onChange={(v) => set('deviceType', v)} />
      </Section>
    </div>
  );
}
