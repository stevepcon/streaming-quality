// ============== TYPES ==============

export type Codec = 'H.264' | 'H.265' | 'AV1';
export type TransportLayer = 'UDP' | 'TCP';
export type StreamingProtocol = 'SRT' | 'RTMP' | 'WebRTC' | 'HLS' | 'DASH';
export type Resolution = '480p' | '720p' | '1080p' | '1440p' | '4K';
export type FrameRate = 24 | 30 | 60;
export type MotionLevel = 'low' | 'medium' | 'high';
export type DeviceType = 'mobile' | 'desktop' | 'tv';
export type NetworkType = '3G' | '4G' | '5G' | 'WiFi';

export interface SimulationInput {
  codec: Codec;
  bitrate: number; // in kbps
  resolution: Resolution;
  frameRate: FrameRate;
  transportLayer: TransportLayer;
  streamingProtocol: StreamingProtocol;
  motionLevel: MotionLevel;
  deviceType: DeviceType;
  networkType: NetworkType;
}

export interface SimulationResult {
  qualityScore: number; // 0-100 VMAF-like
  latencyMs: number;
  bandwidthKbps: number;
  compatibilityScore: number; // 0-100
  packetLossResilience: number; // 0-100
}

// ============== CONSTANTS ==============

const CODEC_EFFICIENCY: Record<Codec, number> = {
  'H.264': 1.0,
  'H.265': 1.4,
  'AV1': 1.6,
};

const RESOLUTION_PIXELS: Record<Resolution, number> = {
  '480p': 640 * 480,
  '720p': 1280 * 720,
  '1080p': 1920 * 1080,
  '1440p': 2560 * 1440,
  '4K': 3840 * 2160,
};

const REFERENCE_BITRATE: Record<Resolution, number> = {
  '480p': 1500,
  '720p': 2500,
  '1080p': 5000,
  '1440p': 10000,
  '4K': 15000,
};

const MOTION_PENALTY: Record<MotionLevel, number> = {
  low: 1.0,
  medium: 0.85,
  high: 0.7,
};

const PROTOCOL_LATENCY: Record<StreamingProtocol, [number, number]> = {
  WebRTC: [100, 500],
  SRT: [500, 2000],
  RTMP: [2000, 5000],
  HLS: [6000, 30000],
  DASH: [4000, 20000],
};

const TRANSPORT_MULTIPLIER: Record<TransportLayer, number> = {
  UDP: 0.7,
  TCP: 1.2,
};

const PROTOCOL_OVERHEAD: Record<StreamingProtocol, number> = {
  HLS: 1.15,
  DASH: 1.15,
  WebRTC: 1.15,
  SRT: 1.10,
  RTMP: 1.08,
};

const PROTOCOL_LOSS_RESILIENCE: Record<StreamingProtocol, number> = {
  WebRTC: 70,
  SRT: 95,
  RTMP: 50,
  HLS: 60,
  DASH: 60,
};

const TRANSPORT_LOSS_BONUS: Record<TransportLayer, number> = {
  UDP: -15,
  TCP: 20,
};

const CODEC_COMPATIBILITY: Record<Codec, number> = {
  'H.264': 100,
  'H.265': 78,
  'AV1': 58,
};

const DEVICE_COMPAT_MODIFIER: Record<DeviceType, Record<Codec, number>> = {
  mobile: { 'H.264': 0, 'H.265': -5, 'AV1': -15 },
  desktop: { 'H.264': 0, 'H.265': -3, 'AV1': -5 },
  tv: { 'H.264': 0, 'H.265': -10, 'AV1': -20 },
};

const NETWORK_LATENCY_FACTOR: Record<NetworkType, number> = {
  '3G': 2.5,
  '4G': 1.3,
  '5G': 0.9,
  'WiFi': 1.0,
};

// ============== SIMULATION ==============

export function simulate(input: SimulationInput): SimulationResult {
  // Quality
  const codecEff = CODEC_EFFICIENCY[input.codec];
  const refBitrate = REFERENCE_BITRATE[input.resolution];
  const bitrateFactor = Math.log10(input.bitrate / refBitrate + 1);
  const refPixels = RESOLUTION_PIXELS['1080p'];
  const resPixels = RESOLUTION_PIXELS[input.resolution];
  const resFactor = Math.sqrt(resPixels / refPixels);
  const motionPen = MOTION_PENALTY[input.motionLevel];
  const fpsBonus = input.frameRate >= 60 ? 0.95 : 1.0;
  const rawQuality = codecEff * bitrateFactor * (1 / resFactor) * motionPen * fpsBonus;
  const qualityScore = Math.min(100, Math.max(0, Math.round(rawQuality * 150)));

  // Latency
  const [latLow, latHigh] = PROTOCOL_LATENCY[input.streamingProtocol];
  const baseLatency = (latLow + latHigh) / 2;
  const transportMult = TRANSPORT_MULTIPLIER[input.transportLayer];
  const networkFactor = NETWORK_LATENCY_FACTOR[input.networkType];
  const latencyMs = Math.round(baseLatency * transportMult * networkFactor);

  // Bandwidth
  const overhead = PROTOCOL_OVERHEAD[input.streamingProtocol];
  const bandwidthKbps = Math.round(input.bitrate * overhead);

  // Compatibility
  const baseCompat = CODEC_COMPATIBILITY[input.codec];
  const deviceMod = DEVICE_COMPAT_MODIFIER[input.deviceType][input.codec];
  const compatibilityScore = Math.min(100, Math.max(0, baseCompat + deviceMod));

  // Packet loss resilience
  const baseLoss = PROTOCOL_LOSS_RESILIENCE[input.streamingProtocol];
  const transportBonus = TRANSPORT_LOSS_BONUS[input.transportLayer];
  const packetLossResilience = Math.min(100, Math.max(0, baseLoss + transportBonus));

  return { qualityScore, latencyMs, bandwidthKbps, compatibilityScore, packetLossResilience };
}

// ============== PRESETS ==============

export interface Preset {
  name: string;
  description: string;
  input: SimulationInput;
}

export const PRESETS: Preset[] = [
  {
    name: 'Netflix-like Streaming',
    description: 'High quality adaptive streaming for VOD',
    input: {
      codec: 'H.265', bitrate: 8000, resolution: '1080p', frameRate: 24,
      transportLayer: 'TCP', streamingProtocol: 'DASH', motionLevel: 'medium',
      deviceType: 'desktop', networkType: 'WiFi',
    },
  },
  {
    name: 'Low Latency Gaming',
    description: 'Minimal delay for cloud gaming / esports',
    input: {
      codec: 'H.264', bitrate: 6000, resolution: '1080p', frameRate: 60,
      transportLayer: 'UDP', streamingProtocol: 'WebRTC', motionLevel: 'high',
      deviceType: 'desktop', networkType: 'WiFi',
    },
  },
  {
    name: 'Mobile Poor Network',
    description: 'Resilient streaming on congested 3G',
    input: {
      codec: 'H.264', bitrate: 800, resolution: '480p', frameRate: 30,
      transportLayer: 'TCP', streamingProtocol: 'HLS', motionLevel: 'low',
      deviceType: 'mobile', networkType: '3G',
    },
  },
  {
    name: 'Broadcast Contribution',
    description: 'High bitrate professional feed',
    input: {
      codec: 'H.264', bitrate: 20000, resolution: '1080p', frameRate: 30,
      transportLayer: 'UDP', streamingProtocol: 'SRT', motionLevel: 'medium',
      deviceType: 'desktop', networkType: 'WiFi',
    },
  },
  {
    name: '4K AV1 Future',
    description: 'Next-gen codec for ultra-high quality',
    input: {
      codec: 'AV1', bitrate: 12000, resolution: '4K', frameRate: 60,
      transportLayer: 'TCP', streamingProtocol: 'DASH', motionLevel: 'medium',
      deviceType: 'tv', networkType: '5G',
    },
  },
];

// ============== DEGRADATION PARAMS ==============

export interface DegradationParams {
  blur: number; // 0-20 px
  pixelation: number; // 1-32 block size
  noiseLevel: number; // 0-1
  tearingChance: number; // 0-1
}

export function getDegradationParams(input: SimulationInput, result: SimulationResult): DegradationParams {
  const qualityNorm = result.qualityScore / 100;
  const blur = Math.max(0, (1 - qualityNorm) * 12);
  const pixelation = Math.max(1, Math.round((1 - qualityNorm) * 16));
  const noiseLevel = Math.max(0, (1 - qualityNorm) * 0.4);
  const lossNorm = 1 - result.packetLossResilience / 100;
  const tearingChance = lossNorm * 0.5;
  return { blur, pixelation, noiseLevel, tearingChance };
}
