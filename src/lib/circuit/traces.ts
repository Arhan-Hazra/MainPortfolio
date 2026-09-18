// Circuit Trace Network & Responsive Component Layout
import { ComponentSpec, LEDSpec, TraceSegment, RibbonPulse } from './types';

export function getResponsiveCircuitLayout(width: number, height: number): {
  components: ComponentSpec[];
  leds: LEDSpec[];
  traces: TraceSegment[];
  initialRibbons: RibbonPulse[];
} {
  // Screen center and proportional anchors
  const cx = width * 0.5;
  const cy = height * 0.48;

  // 1. IC Components specifications
  const components: ComponentSpec[] = [
    {
      id: 'atmega328p',
      type: 'ic',
      icType: 'atmega328p',
      label: 'ATMEGA328P-PU',
      width: Math.min(210, width * 0.3),
      height: 76,
      pinCount: 28,
      pinsPerSide: 14,
      homeX: Math.max(140, cx - Math.min(width * 0.22, 240)),
      homeY: cy - 40,
      inspection: {
        title: 'ATmega328P (8-bit AVR)',
        subtitle: 'The heart of the Arduino Uno.',
        status: 'STATUS: Online',
        auth: 'AUTH: Arhan is officially Arduino Certified.',
        description: 'High-performance, low-power Microchip 8-bit AVR RISC-based microcontroller with 32KB ISP flash memory, 1KB EEPROM, and 2KB SRAM.',
        specs: [
          'Architecture: 8-bit AVR RISC',
          'Clock Speed: 16 MHz Crystal',
          'Operating Voltage: 5.0 VDC',
          'I/O Pins: 23 Programmable (6 PWM)',
          'Cert: Official Arduino Certified Professional'
        ]
      }
    },
    {
      id: 'ic7404',
      type: 'ic',
      icType: '7404',
      label: 'SN74HC04N',
      width: Math.min(130, width * 0.22),
      height: 64,
      pinCount: 14,
      pinsPerSide: 7,
      homeX: Math.min(width - 140, cx + Math.min(width * 0.22, 220)),
      homeY: cy - 110,
      inspection: {
        title: '7404 Hex Inverter IC',
        subtitle: 'High-Speed CMOS Logic',
        status: 'STATUS: Logic Armed',
        auth: 'AUTH: Gate Array Verified',
        description: 'Standard 74-series TTL/CMOS logic containing six independent inverting NOT gates. Converts logic HIGH to LOW and vice-versa with ~9ns propagation delay.',
        specs: [
          'Gates: 6 Independent NOT Inverters',
          'Package: 14-Pin DIP',
          'Propagation Delay: 9 ns',
          'Operating Voltage: 2.0V - 6.0V'
        ]
      }
    },
    {
      id: 'ic555',
      type: 'ic',
      icType: 'ne555',
      label: 'NE555P',
      width: Math.min(90, width * 0.18),
      height: 56,
      pinCount: 8,
      pinsPerSide: 4,
      homeX: Math.min(width - 120, cx + Math.min(width * 0.16, 170)),
      homeY: cy + 100,
      inspection: {
        title: 'NE555 Precision Timer',
        subtitle: 'Clock Generator & Oscillator',
        status: 'STATUS: Oscillating',
        auth: 'AUTH: Timing Calibrated',
        description: 'Robust bipolar precision timing circuit capable of producing accurate time delays or oscillation frequencies for clocking digital state machines.',
        specs: [
          'Modes: Astable / Monostable',
          'Timing: Microseconds to Hours',
          'Max Frequency: ~2 MHz',
          'Package: 8-Pin DIP'
        ]
      }
    }
  ];

  // 2. LEDs positioned on traces
  const leds: LEDSpec[] = [
    {
      id: 'led1',
      color: '#00FF41',
      radius: 10,
      homeX: components[0].homeX - 110,
      homeY: components[0].homeY - 80,
      connectedTraceId: 'trace-atmega-power',
      blinkInterval: 480,
      blinkPhase: 0
    },
    {
      id: 'led2',
      color: '#00E5FF',
      radius: 11,
      homeX: components[0].homeX + 40,
      homeY: components[0].homeY + 120,
      connectedTraceId: 'trace-atmega-bus',
      blinkInterval: 750,
      blinkPhase: 200
    },
    {
      id: 'led3',
      color: '#00FF41',
      radius: 9,
      homeX: components[1].homeX - 60,
      homeY: components[1].homeY - 70,
      connectedTraceId: 'trace-7404-logic',
      blinkInterval: 320,
      blinkPhase: 50
    },
    {
      id: 'led4',
      color: '#FFB300',
      radius: 10,
      homeX: components[2].homeX + 70,
      homeY: components[2].homeY + 70,
      connectedTraceId: 'trace-555-clock',
      blinkInterval: 500,
      blinkPhase: 120
    }
  ];

  // 3. Circuit Traces with realistic 45° PCB routing angles
  const traces: TraceSegment[] = [
    // Trace 1: ATmega Power Rail & Main Bus
    {
      id: 'trace-atmega-power',
      connectedComponentIds: ['atmega328p', 'led1'],
      width: 2.5,
      color: '#005518',
      glowColor: '#00FF41',
      points: [
        { x: 30, y: components[0].homeY - 140 },
        { x: components[0].homeX - 160, y: components[0].homeY - 140 },
        { x: components[0].homeX - 110, y: components[0].homeY - 80 }, // Passes through LED1
        { x: components[0].homeX - 60, y: components[0].homeY - 80 },
        { x: components[0].homeX - 30, y: components[0].homeY - 45 },
        { x: components[0].homeX, y: components[0].homeY - 45 } // Enters ATmega pin 1
      ]
    },
    // Trace 2: Inter-IC Bus: ATmega to 7404
    {
      id: 'trace-7404-logic',
      connectedComponentIds: ['atmega328p', 'ic7404', 'led3'],
      width: 2.5,
      color: '#004a55',
      glowColor: '#00E5FF',
      points: [
        { x: components[0].homeX + components[0].width * 0.35, y: components[0].homeY - 45 },
        { x: components[0].homeX + components[0].width * 0.35 + 40, y: components[0].homeY - 85 },
        { x: components[1].homeX - 110, y: components[0].homeY - 85 },
        { x: components[1].homeX - 60, y: components[1].homeY - 70 }, // Passes through LED3
        { x: components[1].homeX - 20, y: components[1].homeY - 70 },
        { x: components[1].homeX, y: components[1].homeY - 40 } // Enters 7404 Pin 1
      ]
    },
    // Trace 3: ATmega Bottom Bus to LED2
    {
      id: 'trace-atmega-bus',
      connectedComponentIds: ['atmega328p', 'led2'],
      width: 2.5,
      color: '#005518',
      glowColor: '#00FF41',
      points: [
        { x: components[0].homeX - 40, y: components[0].homeY + 45 },
        { x: components[0].homeX - 40, y: components[0].homeY + 80 },
        { x: components[0].homeX + 10, y: components[0].homeY + 120 },
        { x: components[0].homeX + 40, y: components[0].homeY + 120 }, // Passes through LED2
        { x: components[0].homeX + 110, y: components[0].homeY + 120 },
        { x: components[0].homeX + 150, y: components[0].homeY + 160 },
        { x: width - 40, y: components[0].homeY + 160 }
      ]
    },
    // Trace 4: 7404 to NE555 and LED4 Clock Line
    {
      id: 'trace-555-clock',
      connectedComponentIds: ['ic7404', 'ic555', 'led4'],
      width: 2.5,
      color: '#4e3f00',
      glowColor: '#FFB300',
      points: [
        { x: components[1].homeX + 20, y: components[1].homeY + 40 },
        { x: components[1].homeX + 20, y: components[1].homeY + 70 },
        { x: components[2].homeX + 20, y: components[2].homeY - 35 },
        { x: components[2].homeX + 20, y: components[2].homeY + 35 },
        { x: components[2].homeX + 50, y: components[2].homeY + 70 },
        { x: components[2].homeX + 70, y: components[2].homeY + 70 }, // Passes through LED4
        { x: width - 30, y: components[2].homeY + 70 }
      ]
    }
  ];

  // 4. Energy current ribbon pulses
  const initialRibbons: RibbonPulse[] = [
    { traceId: 'trace-atmega-power', progress: 0.1, speed: 0.0035, length: 0.25, color: '#00FF41' },
    { traceId: 'trace-atmega-power', progress: 0.6, speed: 0.003, length: 0.22, color: '#00FF41' },
    { traceId: 'trace-7404-logic', progress: 0.25, speed: 0.004, length: 0.28, color: '#00E5FF' },
    { traceId: 'trace-7404-logic', progress: 0.75, speed: 0.0038, length: 0.2, color: '#00E5FF' },
    { traceId: 'trace-atmega-bus', progress: 0.05, speed: 0.0045, length: 0.24, color: '#00FF41' },
    { traceId: 'trace-atmega-bus', progress: 0.55, speed: 0.004, length: 0.2, color: '#00FF41' },
    { traceId: 'trace-555-clock', progress: 0.15, speed: 0.005, length: 0.3, color: '#FFB300' },
    { traceId: 'trace-555-clock', progress: 0.65, speed: 0.0042, length: 0.22, color: '#FFB300' }
  ];

  return { components, leds, traces, initialRibbons };
}

// Distance from point (px, py) to line segment (x1, y1) - (x2, y2)
export function distToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { dist: number; nearestX: number; nearestY: number } {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) {
    const d = Math.hypot(px - x1, py - y1);
    return { dist: d, nearestX: x1, nearestY: y1 };
  }
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const nearestX = x1 + t * (x2 - x1);
  const nearestY = y1 + t * (y2 - y1);
  const dist = Math.hypot(px - nearestX, py - nearestY);
  return { dist, nearestX, nearestY };
}

// Calculate total length of polyline trace
export function getTraceTotalLength(points: { x: number; y: number }[]): number {
  let len = 0;
  for (let i = 0; i < points.length - 1; i++) {
    len += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
  }
  return len;
}

// Interpolate point along polyline trace at normalized progress [0, 1]
export function getPointOnTrace(
  points: { x: number; y: number }[],
  progress: number
): { x: number; y: number } | null {
  if (points.length === 0) return null;
  if (points.length === 1) return points[0];

  const totalLen = getTraceTotalLength(points);
  const targetDist = Math.max(0, Math.min(1, progress)) * totalLen;

  let accumulated = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const segLen = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    if (accumulated + segLen >= targetDist) {
      const segT = (targetDist - accumulated) / (segLen || 1);
      return {
        x: points[i].x + segT * (points[i + 1].x - points[i].x),
        y: points[i].y + segT * (points[i + 1].y - points[i].y)
      };
    }
    accumulated += segLen;
  }

  return points[points.length - 1];
}
