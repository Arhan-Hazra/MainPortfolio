// Types for circuit simulation, components, traces, and physics

export type ICType = 'atmega328p' | '7404' | 'ne555';

export interface ComponentSpec {
  id: string;
  type: 'ic' | 'led';
  icType?: ICType;
  label: string;
  width: number;
  height: number;
  pinCount: number; // e.g. 28 for ATmega, 14 for 7404, 8 for 555
  pinsPerSide: number;
  homeX: number;
  homeY: number;
  // Inspection metadata
  inspection: {
    title: string;
    subtitle?: string;
    description: string;
    status: string;
    auth?: string;
    specs?: string[];
  };
}

export interface LEDSpec {
  id: string;
  color: string; // hex
  radius: number;
  homeX: number;
  homeY: number;
  connectedTraceId: string;
  blinkInterval: number; // ms
  blinkPhase: number;
}

export interface TraceSegment {
  id: string;
  points: { x: number; y: number }[];
  connectedComponentIds: string[]; // ICs or LEDs connected to this trace
  width: number;
  color: string;
  glowColor: string;
}

export interface RibbonPulse {
  traceId: string;
  progress: number; // 0 to 1
  speed: number;
  length: number;
  color: string;
}

export interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  growSpeed: number;
  opacity: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotSpeed: number;
}

export interface OverloadState {
  isHoveringActiveTrace: boolean;
  hoverDuration: number; // in seconds
  collisionPoint: { x: number; y: number } | null;
  phase: 'idle' | 'warning' | 'overloaded';
  overloadCooldown: number; // countdown after overload
}
