import { useEffect, useRef } from 'react';
import { DegradationParams } from '@/lib/simulation';

interface VisualPreviewProps {
  degradation: DegradationParams;
  qualityScore: number;
}

export default function VisualPreview({ degradation, qualityScore }: VisualPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Draw a reference scene (gradient cityscape)
    drawReferenceScene(ctx, w, h);

    // Apply degradation
    applyDegradation(ctx, w, h, degradation);
  }, [degradation]);

  return (
    <div className="bg-secondary rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">🖼️ Visual Preview</span>
        <span className={`text-[10px] font-mono font-bold ${
          qualityScore >= 80 ? 'text-signal-green' : qualityScore >= 50 ? 'text-signal-amber' : 'text-signal-red'
        }`}>
          VMAF ≈ {qualityScore}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        className="w-full"
        style={{ imageRendering: degradation.pixelation > 4 ? 'pixelated' : 'auto' }}
      />
    </div>
  );
}

function drawReferenceScene(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
  skyGrad.addColorStop(0, '#0a1628');
  skyGrad.addColorStop(0.5, '#1a2744');
  skyGrad.addColorStop(1, '#2d4a7a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h * 0.65);

  // Stars
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h * 0.5;
    const size = Math.random() * 1.5 + 0.5;
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.6 + 0.2})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cityscape silhouette
  const buildings = [
    { x: 0, w: 60, h: 120 }, { x: 55, w: 40, h: 180 }, { x: 90, w: 50, h: 140 },
    { x: 140, w: 30, h: 200 }, { x: 165, w: 55, h: 160 }, { x: 215, w: 45, h: 220 },
    { x: 255, w: 60, h: 150 }, { x: 310, w: 35, h: 190 }, { x: 340, w: 50, h: 170 },
    { x: 385, w: 40, h: 210 }, { x: 420, w: 55, h: 140 }, { x: 470, w: 45, h: 230 },
    { x: 510, w: 60, h: 160 }, { x: 565, w: 40, h: 195 }, { x: 600, w: 50, h: 145 },
  ];

  const horizonY = h * 0.65;
  buildings.forEach((b) => {
    const bx = (b.x / 640) * w;
    const bw = (b.w / 640) * w;
    const bh = (b.h / 360) * h;
    ctx.fillStyle = '#0d1520';
    ctx.fillRect(bx, horizonY - bh, bw, bh);

    // Windows
    for (let wy = horizonY - bh + 8; wy < horizonY - 5; wy += 12) {
      for (let wx = bx + 5; wx < bx + bw - 5; wx += 10) {
        if (Math.random() > 0.4) {
          const colors = ['#ffd700', '#ff8c00', '#87ceeb', '#ffffff'];
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.globalAlpha = Math.random() * 0.5 + 0.3;
          ctx.fillRect(wx, wy, 5, 6);
        }
      }
    }
    ctx.globalAlpha = 1;
  });

  // Ground / water reflection
  const groundGrad = ctx.createLinearGradient(0, horizonY, 0, h);
  groundGrad.addColorStop(0, '#1a2744');
  groundGrad.addColorStop(1, '#0a1225');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, horizonY, w, h - horizonY);

  // Reflection lines
  for (let i = 0; i < 15; i++) {
    const y = horizonY + Math.random() * (h - horizonY);
    ctx.strokeStyle = `rgba(100,150,220,${Math.random() * 0.1})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function applyDegradation(ctx: CanvasRenderingContext2D, w: number, h: number, params: DegradationParams) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Pixelation
  if (params.pixelation > 1) {
    const bs = Math.round(params.pixelation);
    for (let y = 0; y < h; y += bs) {
      for (let x = 0; x < w; x += bs) {
        let r = 0, g = 0, b = 0, count = 0;
        for (let dy = 0; dy < bs && y + dy < h; dy++) {
          for (let dx = 0; dx < bs && x + dx < w; dx++) {
            const idx = ((y + dy) * w + (x + dx)) * 4;
            r += data[idx]; g += data[idx + 1]; b += data[idx + 2];
            count++;
          }
        }
        r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
        for (let dy = 0; dy < bs && y + dy < h; dy++) {
          for (let dx = 0; dx < bs && x + dx < w; dx++) {
            const idx = ((y + dy) * w + (x + dx)) * 4;
            data[idx] = r; data[idx + 1] = g; data[idx + 2] = b;
          }
        }
      }
    }
  }

  // Noise
  if (params.noiseLevel > 0) {
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 255 * params.noiseLevel;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
  }

  // Tearing
  if (params.tearingChance > 0) {
    const tearCount = Math.floor(params.tearingChance * 5);
    for (let t = 0; t < tearCount; t++) {
      const tearY = Math.floor(Math.random() * h);
      const shift = Math.floor((Math.random() - 0.5) * 40);
      for (let x = 0; x < w; x++) {
        const srcX = Math.min(w - 1, Math.max(0, x + shift));
        const srcIdx = (tearY * w + srcX) * 4;
        const dstIdx = (tearY * w + x) * 4;
        data[dstIdx] = data[srcIdx];
        data[dstIdx + 1] = data[srcIdx + 1];
        data[dstIdx + 2] = data[srcIdx + 2];
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Color banding overlay for low quality
  if (params.blur > 5) {
    ctx.fillStyle = `rgba(0,0,0,${Math.min(0.3, (params.blur - 5) / 30)})`;
    ctx.fillRect(0, 0, w, h);
  }
}
