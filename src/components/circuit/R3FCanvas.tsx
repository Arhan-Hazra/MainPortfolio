'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  createDefaultPCBConfig,
  validateSocketDrop,
  getDistanceToTrace,
  ICDef,
  SocketDef,
  LEDDef,
  TraceDef,
  HardwareDeco
} from '@/lib/circuit/pcbState';
import { circuitAudio } from '@/lib/circuit/audio';
import ComponentTooltip, { InspectionData } from './ComponentTooltip';
import CircuitHUD from './CircuitHUD';

interface Particle {
  id: number;
  type: 'spark' | 'smoke';
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  growSpeed: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
}

interface R3FCanvasProps {
  onShake?: (intensity: 'slight' | 'intense' | 'none') => void;
  sandboxViewOnly?: boolean;
}

// ----------------------------------------------------
// 1. Heavy Mouse Parallax Camera Controller
// ----------------------------------------------------
function ParallaxCamera({ mousePos }: { mousePos: React.MutableRefObject<{ x: number; y: number }> }) {
  const { camera } = useThree();

  useFrame(() => {
    // Heavy 2.5D mouse parallax: smoothly pan the camera with cursor position
    const targetX = mousePos.current.x * 0.16;
    const targetY = mousePos.current.y * 0.16;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.045);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.045);
  });

  return null;
}

// ----------------------------------------------------
// 2. PCB Background Substrate & Technical Silkscreen
// ----------------------------------------------------
function PCBSubstrate() {
  const { viewport } = useThree();
  const width = Math.max(2600, viewport.width * 2.5);
  const height = Math.max(1800, viewport.height * 2.5);

  const gridTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#06090c';
      ctx.fillRect(0, 0, 64, 64);
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.04)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, 64, 64);
      // Secondary subdivision
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.02)';
      ctx.strokeRect(16, 16, 32, 32);
      // Center fiducial dot
      ctx.fillStyle = 'rgba(0, 255, 65, 0.08)';
      ctx.fillRect(31, 31, 2, 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(width / 64, height / 64);
    return texture;
  }, [width, height]);

  return (
    <mesh position={[0, 0, -2]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={gridTexture || undefined} color="#06090c" />
    </mesh>
  );
}

// ----------------------------------------------------
// 3. Hardware Decos: Crystals, Capacitors, Headers
// ----------------------------------------------------
function HardwareDecosLayer({ decos }: { decos: HardwareDeco[] }) {
  return (
    <group position={[0, 0, -1]}>
      {decos.map((deco, idx) => {
        if (deco.type === 'crystal') {
          return (
            <group key={`deco-${idx}`} position={[deco.x, deco.y, 0]}>
              <mesh position={[-16, 0, 0.05]}>
                <planeGeometry args={[6, 10]} />
                <meshBasicMaterial color="#90a4ae" />
              </mesh>
              <mesh position={[16, 0, 0.05]}>
                <planeGeometry args={[6, 10]} />
                <meshBasicMaterial color="#90a4ae" />
              </mesh>
              <mesh position={[0, 0, 0.2]}>
                <planeGeometry args={[26, 12]} />
                <meshBasicMaterial color="#cfd8dc" />
              </mesh>
            </group>
          );
        } else if (deco.type === 'capacitor') {
          return (
            <group key={`deco-${idx}`} position={[deco.x, deco.y, 0]}>
              <mesh position={[-4, 0, 0.05]}>
                <planeGeometry args={[2.5, 6]} />
                <meshBasicMaterial color="#b0bec5" />
              </mesh>
              <mesh position={[0, 0, 0.05]}>
                <planeGeometry args={[5, 6]} />
                <meshBasicMaterial color="#6d4c41" />
              </mesh>
              <mesh position={[4, 0, 0.05]}>
                <planeGeometry args={[2.5, 6]} />
                <meshBasicMaterial color="#b0bec5" />
              </mesh>
            </group>
          );
        } else if (deco.type === 'header' || deco.type === 'regulator') {
          const w = deco.width || 30;
          const h = deco.height || 18;
          return (
            <group key={`deco-${idx}`} position={[deco.x, deco.y, 0]}>
              <mesh position={[0, 0, 0.05]}>
                <planeGeometry args={[w, h]} />
                <meshBasicMaterial color="#1c2529" />
              </mesh>
              <lineSegments>
                <edgesGeometry attach="geometry" args={[new THREE.PlaneGeometry(w, h)]} />
                <lineBasicMaterial color="#cfd8dc" transparent opacity={0.4} />
              </lineSegments>
            </group>
          );
        }
        return null;
      })}
    </group>
  );
}

// ----------------------------------------------------
// 4. 12 Sockets Layer
// ----------------------------------------------------
function SocketsLayer({
  sockets,
  activeMap
}: {
  sockets: SocketDef[];
  activeMap: Record<string, boolean>;
}) {
  return (
    <group position={[0, 0, -1]}>
      {sockets.map((socket) => {
        const isActive = activeMap[socket.id];
        const halfW = socket.width / 2;
        const halfH = socket.height / 2;
        const pinSpacing = (socket.width - 24) / (socket.pinsPerSide - 1);

        return (
          <group key={socket.id} position={[socket.x, socket.y, 0]}>
            <mesh position={[0, 0, 0]}>
              <planeGeometry args={[socket.width + 4, socket.height + 4]} />
              <meshBasicMaterial color="#0c1217" />
            </mesh>

            <lineSegments>
              <edgesGeometry
                attach="geometry"
                args={[new THREE.PlaneGeometry(socket.width + 10, socket.height + 10)]}
              />
              <lineBasicMaterial
                color={isActive ? '#00FF41' : '#ff4444'}
                transparent
                opacity={0.55}
                linewidth={1.5}
              />
            </lineSegments>

            {Array.from({ length: socket.pinsPerSide }).map((_, i) => {
              const px = -halfW + 12 + i * pinSpacing;
              return (
                <group key={i}>
                  <mesh position={[px, halfH + 4, 0.1]}>
                    <ringGeometry args={[1.5, 3.5, 12]} />
                    <meshBasicMaterial color={isActive ? '#00FF41' : '#90a4ae'} />
                  </mesh>
                  <mesh position={[px, -halfH - 4, 0.1]}>
                    <ringGeometry args={[1.5, 3.5, 12]} />
                    <meshBasicMaterial color={isActive ? '#00FF41' : '#90a4ae'} />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

// ----------------------------------------------------
// 5. Interconnected Copper Traces & Ribbon Currents
// ----------------------------------------------------
function TracesLayer({
  traces,
  activeMap
}: {
  traces: TraceDef[];
  activeMap: Record<string, boolean>;
}) {
  const pulseRefs = useRef<{ [key: string]: number }>({});

  useFrame((_, delta) => {
    traces.forEach((trace) => {
      if (activeMap[trace.drivingSocketId]) {
        pulseRefs.current[trace.id] = ((pulseRefs.current[trace.id] || 0) + delta * 0.45) % 1;
      }
    });
  });

  return (
    <group position={[0, 0, -1.2]}>
      {traces.map((trace) => {
        const isPowered = activeMap[trace.drivingSocketId];
        const points = trace.points.map(([x, y]) => new THREE.Vector3(x, y, 0));
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

        const t = pulseRefs.current[trace.id] || 0;
        let pulsePos = points[0];
        if (points.length > 1) {
          const segCount = points.length - 1;
          const scaledT = t * segCount;
          const segIdx = Math.min(Math.floor(scaledT), segCount - 1);
          const frac = scaledT - segIdx;
          pulsePos = new THREE.Vector3().lerpVectors(points[segIdx], points[segIdx + 1], frac);
        }

        const lineMat = new THREE.LineBasicMaterial({
          color: isPowered ? trace.glowColor : '#18241d',
          linewidth: 2.5,
          transparent: true,
          opacity: isPowered ? 0.85 : 0.25
        });
        const lineObj = new THREE.Line(lineGeo, lineMat);

        return (
          <group key={trace.id}>
            <primitive object={lineObj} />

            {isPowered && (
              <mesh position={[pulsePos.x, pulsePos.y, 0.2]}>
                <circleGeometry args={[4.5, 16]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            )}
            {isPowered && (
              <mesh position={[pulsePos.x, pulsePos.y, 0.1]}>
                <circleGeometry args={[9, 16]} />
                <meshBasicMaterial color={trace.glowColor} transparent opacity={0.65} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

// ----------------------------------------------------
// 6. 25+ LEDs Active Signaling Layer
// ----------------------------------------------------
function LEDsLayer({
  leds,
  activeMap
}: {
  leds: LEDDef[];
  activeMap: Record<string, boolean>;
}) {
  const [blinkTicks, setBlinkTicks] = useState<number>(0);

  useFrame(() => {
    setBlinkTicks(performance.now());
  });

  return (
    <group position={[0, 0, -0.5]}>
      {leds.map((led) => {
        const isSocketActive = activeMap[led.drivenBySocketId];
        const phase = led.phaseOffset || 0;
        const isBlinking =
          isSocketActive &&
          Math.sin(((blinkTicks + phase) / led.blinkRate) * Math.PI * 2) > -0.15;

        return (
          <group key={led.id} position={[led.x, led.y, 0]}>
            <mesh position={[0, 0, 0]}>
              <ringGeometry args={[led.radius, led.radius + 3, 24]} />
              <meshBasicMaterial color="#455a64" />
            </mesh>

            <mesh position={[0, 0, 0.1]}>
              <circleGeometry args={[led.radius, 24]} />
              <meshBasicMaterial color={isBlinking ? led.color : '#1a2226'} />
            </mesh>

            {isBlinking && (
              <mesh position={[0, 0, 0.05]}>
                <circleGeometry args={[led.radius * 2.6, 24]} />
                <meshBasicMaterial color={led.color} transparent opacity={0.45} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

// ----------------------------------------------------
// 7. Draggable IC Component with Freefall Animation Support
// ----------------------------------------------------
function DraggableIC({
  ic,
  onDragEnd,
  onClick,
  onSpawnSparks,
  isInteractionDisabled = false
}: {
  ic: ICDef;
  onDragEnd: (ic: ICDef, newX: number, newY: number) => void;
  onClick: (ic: ICDef) => void;
  onSpawnSparks?: (x: number, y: number) => void;
  isInteractionDisabled?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [pos, setPos] = useState<[number, number]>([ic.x, ic.y]);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startPos: [number, number] } | null>(null);

  // Physics drop & bounce simulation ref
  const bounceSimRef = useRef<{
    active: boolean;
    timer: number;
    delay: number;
    currentY: number;
    targetY: number;
    vy: number;
    bounces: number;
  }>({
    active: false,
    timer: 0,
    delay: 0,
    currentY: ic.y,
    targetY: ic.y,
    vy: 0,
    bounces: 0
  });

  // Smoothly sync with IC state & trigger dropping/bouncing when isBouncing is true
  useEffect(() => {
    if (ic.isBouncing) {
      const stagger = ic.staggerIndex ?? 0;
      const dropStartY = 850 + (stagger % 4) * 30;
      bounceSimRef.current = {
        active: true,
        timer: 0,
        delay: stagger * 0.075,
        currentY: dropStartY,
        targetY: ic.y,
        vy: 0,
        bounces: 0
      };
      setPos([ic.x, dropStartY]);
      if (groupRef.current) {
        groupRef.current.position.set(ic.x, dropStartY, 1);
      }
    } else {
      bounceSimRef.current.active = false;
      setPos([ic.x, ic.y]);
      if (groupRef.current) {
        groupRef.current.position.set(ic.x, ic.y, 1);
      }
    }
  }, [ic.x, ic.y, ic.isBouncing, ic.staggerIndex]);

  // Frame animation loop for realistic gravity freefall and elastic bounce back into socket
  useFrame((_, delta) => {
    const sim = bounceSimRef.current;
    if (!sim.active || isDragging) return;

    sim.timer += delta;
    if (sim.timer < sim.delay) return;

    // Gravity downward acceleration
    sim.vy -= 3800 * delta;
    sim.currentY += sim.vy * delta;

    // Socket collision & spring bounce
    if (sim.currentY <= sim.targetY) {
      sim.currentY = sim.targetY;
      sim.bounces++;

      if (sim.bounces === 1) {
        // First major elastic bounce up (~40px)
        sim.vy = Math.min(620, -sim.vy * 0.28);
        circuitAudio.playSnapSound(false);
        onSpawnSparks?.(ic.x, sim.targetY);
      } else if (sim.bounces === 2) {
        // Second subtle bounce (~10px)
        sim.vy = Math.min(220, -sim.vy * 0.22);
        circuitAudio.playSnapSound(false);
      } else {
        // Settled firmly into socket
        sim.vy = 0;
        sim.currentY = sim.targetY;
        sim.active = false;
        setPos([ic.x, sim.targetY]);
      }
    }

    if (groupRef.current) {
      groupRef.current.position.y = sim.currentY;
    }
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isInteractionDisabled || bounceSimRef.current.active) return;
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPos: [pos[0], pos[1]]
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    e.stopPropagation();
    const dx = e.clientX - dragStartRef.current.x;
    const dy = -(e.clientY - dragStartRef.current.y);
    const nx = dragStartRef.current.startPos[0] + dx;
    const ny = dragStartRef.current.startPos[1] + dy;
    setPos([nx, ny]);
    if (groupRef.current) {
      groupRef.current.position.set(nx, ny, 2);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    e.stopPropagation();
    setIsDragging(false);

    const distMoved = Math.hypot(
      e.clientX - dragStartRef.current.x,
      e.clientY - dragStartRef.current.y
    );

    if (distMoved < 6) {
      onClick(ic);
    } else {
      onDragEnd(ic, pos[0], pos[1]);
    }
    dragStartRef.current = null;
  };

  // When boom happens, components disappear immediately!
  if (ic.visible === false) {
    return null;
  }

  const halfW = ic.width / 2;
  const halfH = ic.height / 2;
  const pinSpacing = (ic.width - 24) / (ic.pinsPerSide - 1);
  const pinWidth = 2.4;
  const pinLength = 8;

  return (
    <group
      ref={groupRef}
      position={[pos[0], pos[1], isDragging ? 2 : 1]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      scale={isDragging ? 1.04 : 1.0}
    >
      {/* Silver Pins (Top Row) */}
      {Array.from({ length: ic.pinsPerSide }).map((_, i) => {
        const px = -halfW + 12 + i * pinSpacing;
        return (
          <mesh key={`top-${i}`} position={[px, halfH + pinLength / 2, -0.1]}>
            <planeGeometry args={[pinWidth, pinLength]} />
            <meshBasicMaterial color="#cfd8dc" />
          </mesh>
        );
      })}

      {/* Silver Pins (Bottom Row) */}
      {Array.from({ length: ic.pinsPerSide }).map((_, i) => {
        const px = -halfW + 12 + i * pinSpacing;
        return (
          <mesh key={`bot-${i}`} position={[px, -halfH - pinLength / 2, -0.1]}>
            <planeGeometry args={[pinWidth, pinLength]} />
            <meshBasicMaterial color="#cfd8dc" />
          </mesh>
        );
      })}

      {/* Flat Black Rectangular Epoxy Body */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[ic.width, ic.height]} />
        <meshBasicMaterial color="#161b22" />
      </mesh>

      {/* Outline Border */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.PlaneGeometry(ic.width, ic.height)]} />
        <lineBasicMaterial
          color={isDragging ? '#00FF41' : '#485460'}
          linewidth={1.5}
        />
      </lineSegments>

      {/* Pin 1 Index Notch */}
      <mesh position={[-halfW, 0, 0.1]}>
        <circleGeometry args={[4, 16, -Math.PI / 2, Math.PI]} />
        <meshBasicMaterial color="#0c1015" />
      </mesh>

      {/* Pin 1 Dot */}
      <mesh position={[-halfW + 10, halfH - 10, 0.1]}>
        <circleGeometry args={[2, 12]} />
        <meshBasicMaterial color="#607274" />
      </mesh>
    </group>
  );
}

// ----------------------------------------------------
// 8. Particles Layer (Sparks, Billowing Smoke & Tesla Arcs)
// ----------------------------------------------------
function ParticlesLayer({ particles }: { particles: Particle[] }) {
  return (
    <group position={[0, 0, 4]}>
      {particles.map((p) => {
        if (p.type === 'smoke') {
          return (
            <mesh key={p.id} position={[p.x, p.y, 0]}>
              <circleGeometry args={[p.size, 16]} />
              <meshBasicMaterial
                color={p.color}
                transparent
                opacity={p.opacity}
              />
            </mesh>
          );
        } else {
          return (
            <mesh key={p.id} position={[p.x, p.y, 0.1]}>
              <circleGeometry args={[p.size, 10]} />
              <meshBasicMaterial color={p.color} transparent opacity={p.opacity} />
            </mesh>
          );
        }
      })}
    </group>
  );
}

// ----------------------------------------------------
// 9. Main Top-Down R3F Canvas Container
// ----------------------------------------------------
export default function R3FCanvas({ onShake, sandboxViewOnly = false }: R3FCanvasProps) {
  const [config, setConfig] = useState(createDefaultPCBConfig);
  const [inspectedIC, setInspectedIC] = useState<InspectionData | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const particleIdRef = useRef(1);

  // Mouse & Parallax tracking & Glass Text Card detection
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastClientPosRef = useRef<{ x: number; y: number } | null>(null);
  const isCursorOverTextRef = useRef<boolean>(false);
  const [isOverTextCard, setIsOverTextCard] = useState<boolean>(false);

  const hoverCurrentTimerRef = useRef<number>(0);
  const isOverloadedRef = useRef<boolean>(false);
  const [hudHoverTimer, setHudHoverTimer] = useState<number>(0);
  const [hudIsOverloaded, setHudIsOverloaded] = useState<boolean>(false);

  // Active socket state map
  const activeMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    config.sockets.forEach((s) => {
      map[s.id] = s.occupiedBy !== null;
    });
    return map;
  }, [config]);

  // Track mouse in screen coordinates for parallax & check if cursor is over glass text area
  useEffect(() => {
    const updateOverText = (clientX: number, clientY: number) => {
      if (sandboxViewOnly) {
        if (isCursorOverTextRef.current) {
          isCursorOverTextRef.current = false;
          setIsOverTextCard(false);
        }
        return;
      }
      if (typeof document === 'undefined') return;
      const el = document.elementFromPoint(clientX, clientY);
      const over = !!el?.closest('.glass-content-card');
      if (isCursorOverTextRef.current !== over) {
        isCursorOverTextRef.current = over;
        setIsOverTextCard(over);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const worldX = e.clientX - window.innerWidth / 2;
      const worldY = -(e.clientY - window.innerHeight / 2);
      mousePosRef.current = { x: worldX, y: worldY };
      lastClientPosRef.current = { x: e.clientX, y: e.clientY };
      updateOverText(e.clientX, e.clientY);
    };

    const onScroll = () => {
      if (lastClientPosRef.current) {
        updateOverText(lastClientPosRef.current.x, lastClientPosRef.current.y);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, [sandboxViewOnly]);

  // Spawn sparks helper
  const handleSpawnSparks = useCallback((x: number, y: number) => {
    const snapSparks: Particle[] = [];
    for (let j = 0; j < 8; j++) {
      snapSparks.push({
        id: particleIdRef.current++,
        type: 'spark',
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: 2.2,
        growSpeed: -0.05,
        color: '#00FF41',
        opacity: 1.0,
        life: 12,
        maxLife: 12
      });
    }
    setParticles((prev) => [...prev, ...snapSparks]);
  }, []);

  // Reappear all ICs 2 seconds after boom: drop from top and bounce back into places
  const triggerGravityFreefallReassembly = useCallback(() => {
    const defaultConf = createDefaultPCBConfig();
    const totalICs = defaultConf.ics.length;

    circuitAudio.playSequentialAssemblyClicks(totalICs);

    setConfig((prev) => {
      const reappearingICs = defaultConf.ics.map((item, idx) => ({
        ...item,
        visible: true,
        isBouncing: true,
        staggerIndex: idx,
        currentSocketId: item.defaultSocketId
      }));
      const restoredSockets = defaultConf.sockets.map((s) => ({ ...s }));
      return { ...prev, ics: reappearingICs, sockets: restoredSockets };
    });

    // Reset overload state once all ICs have fallen, bounced, and settled in
    const totalReassemblyTime = 500 + totalICs * 85 + 1000;
    setTimeout(() => {
      isOverloadedRef.current = false;
      hoverCurrentTimerRef.current = 0;
      setHudIsOverloaded(false);
      setHudHoverTimer(0);
      onShake?.('none');
    }, totalReassemblyTime);
  }, [onShake]);

  // Main interactive loop: 1s delayed Tesla sizzle, progressive smoke, and explosion
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const mx = mousePosRef.current.x;
      const my = mousePosRef.current.y;
      let isNearActiveCurrent = false;
      let nearestPoint: { x: number; y: number } = { x: mx, y: my };

      const isOverGlass = !sandboxViewOnly && isCursorOverTextRef.current;

      if (!isOverloadedRef.current && !isOverGlass) {
        for (const trace of config.traces) {
          if (!activeMap[trace.drivingSocketId]) continue;

          const check = getDistanceToTrace(mx, my, trace.points);
          if (check.dist < 28) {
            isNearActiveCurrent = true;
            nearestPoint = { x: check.nearestX, y: check.nearestY };
            break;
          }
        }
      }

      if (isNearActiveCurrent && !isOverloadedRef.current && !isOverGlass) {
        hoverCurrentTimerRef.current += delta;
        const ht = hoverCurrentTimerRef.current;
        setHudHoverTimer(ht);

        // Immediate electric Tesla coil sizzle as soon as pointer touches active trace
        if (ht > 0.04) {
          const sizzleIntensity = Math.min(1.5, 0.4 + ht * 0.35);
          circuitAudio.startTeslaCoilSizzle(sizzleIntensity);

          // Electric Tesla arc sparks jumping to pointer
          const newArcs: Particle[] = [];
          for (let i = 0; i < 3; i++) {
            const tLerp = Math.random();
            const arcX = nearestPoint.x + (mx - nearestPoint.x) * tLerp + (Math.random() - 0.5) * 8;
            const arcY = nearestPoint.y + (my - nearestPoint.y) * tLerp + (Math.random() - 0.5) * 8;
            newArcs.push({
              id: particleIdRef.current++,
              type: 'spark',
              x: arcX,
              y: arcY,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              size: 1.5 + Math.random() * 2.5,
              growSpeed: -0.05,
              color: Math.random() > 0.4 ? '#00FF41' : '#00E5FF',
              opacity: 1.0,
              life: 10,
              maxLife: 10
            });
          }

          // Burning smoke effect: starts immediately and billows progressively
          const smokeCount = ht < 0.8 ? 1 : ht < 2.0 ? 3 : 6;
          const smokeBaseSize = Math.min(46, 12 + ht * 10);

          for (let i = 0; i < smokeCount; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4; // upward plume
            const speed = 0.8 + Math.random() * 2.2;
            const life = 50 + Math.floor(Math.random() * 35);

            newArcs.push({
              id: particleIdRef.current++,
              type: 'smoke',
              x: mx + (Math.random() - 0.5) * 12,
              y: my + (Math.random() - 0.5) * 12,
              vx: Math.cos(angle) * speed * 0.7,
              vy: Math.sin(angle) * speed + 1.2,
              size: smokeBaseSize,
              growSpeed: 1.0 + Math.random() * 1.2,
              color: ht > 2.5 ? '#0c0f12' : ht > 1.2 ? '#181e25' : '#29323d',
              opacity: Math.min(0.95, 0.45 + ht * 0.18),
              life,
              maxLife: life
            });
          }

          if (ht > 1.8) {
            onShake?.('slight');
          }

          // Catastrophic Overload Explosion after > 3.5 seconds
          if (ht > 3.5) {
            isOverloadedRef.current = true;
            setHudIsOverloaded(true);
            circuitAudio.playShortCircuitExplosion();
            onShake?.('intense');

            // Explosion blast smoke
            for (let i = 0; i < 50; i++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 1.0 + Math.random() * 5.0;
              newArcs.push({
                id: particleIdRef.current++,
                type: 'smoke',
                x: mx,
                y: my,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed + 1.2,
                size: 22 + Math.random() * 22,
                growSpeed: 1.5,
                color: '#080a0d',
                opacity: 0.98,
                life: 70,
                maxLife: 70
              });
            }
            for (let i = 0; i < 35; i++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 2.0 + Math.random() * 6.5;
              newArcs.push({
                id: particleIdRef.current++,
                type: 'spark',
                x: mx,
                y: my,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2.5,
                growSpeed: -0.05,
                color: Math.random() > 0.4 ? '#00FF41' : '#FF3366',
                opacity: 1.0,
                life: 25,
                maxLife: 25
              });
            }

            // 1. ALL COMPONENTS DISAPPEAR IMMEDIATELY!
            setConfig((prev) => ({
              ...prev,
              ics: prev.ics.map((item) => ({ ...item, visible: false, currentSocketId: null, isBouncing: false })),
              sockets: prev.sockets.map((s) => ({ ...s, occupiedBy: null }))
            }));

            // 2. WAIT EXACTLY 2 SECONDS, THEN REAPPEAR BY DROPPING FROM TOP AND BOUNCING BACK!
            setTimeout(() => {
              triggerGravityFreefallReassembly();
            }, 2000);
          }

          if (newArcs.length > 0) {
            setParticles((prev) => [...prev, ...newArcs]);
          }
        }
      } else {
        // Mouse moved away from current OR cursor is over glass text card
        if (hoverCurrentTimerRef.current > 0 && !isOverloadedRef.current) {
          hoverCurrentTimerRef.current = Math.max(0, hoverCurrentTimerRef.current - delta * 4);
          setHudHoverTimer(hoverCurrentTimerRef.current);
          circuitAudio.stopTeslaCoilSizzle();
          if (hoverCurrentTimerRef.current === 0) {
            onShake?.('none');
          }
        }
      }

      // Update particle decay
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            size: p.size + p.growSpeed,
            opacity: (p.life / p.maxLife) * (p.type === 'smoke' ? 0.8 : 1.0),
            life: p.life - 1
          }))
          .filter((p) => p.life > 0)
      );

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      circuitAudio.stopTeslaCoilSizzle();
    };
  }, [config.traces, activeMap, onShake, triggerGravityFreefallReassembly]);

  // Handle Drag End with Pin Validation & Snap-to-Grid
  const handleDragEnd = useCallback(
    (ic: ICDef, dropX: number, dropY: number) => {
      const validation = validateSocketDrop(ic, dropX, dropY, config.sockets);

      if (validation.isNearAnySocket && validation.targetSocket) {
        const socket = validation.targetSocket;

        if (validation.isCompatible) {
          // COMPATIBLE PIN MATCH SNAP!
          circuitAudio.playSnapSound(false);

          setConfig((prev) => {
            const nextSockets = prev.sockets.map((s) => {
              if (s.id === socket.id) return { ...s, occupiedBy: ic.id };
              if (s.occupiedBy === ic.id) return { ...s, occupiedBy: null };
              return s;
            });

            const nextICs = prev.ics.map((item) => {
              if (item.id === ic.id) {
                return {
                  ...item,
                  x: socket.x,
                  y: socket.y,
                  currentSocketId: socket.id
                };
              }
              return item;
            });

            return { ...prev, sockets: nextSockets, ics: nextICs };
          });
        } else {
          // INCOMPATIBLE PINCOUNT SHORT CIRCUIT BOOM!
          circuitAudio.playShortCircuitExplosion();
          onShake?.('intense');
          setTimeout(() => onShake?.('none'), 700);

          const newBursts: Particle[] = [];
          for (let i = 0; i < 35; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 3.5;
            newBursts.push({
              id: particleIdRef.current++,
              type: 'smoke',
              x: dropX,
              y: dropY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed + 0.8,
              size: 10 + Math.random() * 14,
              growSpeed: 1.1,
              color: '#15191e',
              opacity: 0.85,
              life: 50,
              maxLife: 50
            });
          }
          for (let i = 0; i < 25; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.5 + Math.random() * 6.0;
            newBursts.push({
              id: particleIdRef.current++,
              type: 'spark',
              x: dropX,
              y: dropY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: 2,
              growSpeed: -0.05,
              color: '#00FF41',
              opacity: 1.0,
              life: 18,
              maxLife: 18
            });
          }
          setParticles((prev) => [...prev, ...newBursts]);

          setConfig((prev) => {
            const nextSockets = prev.sockets.map((s) => {
              if (s.occupiedBy === ic.id) return { ...s, occupiedBy: null };
              return s;
            });

            const nextICs = prev.ics.map((item) => {
              if (item.id === ic.id) {
                return {
                  ...item,
                  x: dropX + (dropX > socket.x ? 75 : -75),
                  y: dropY + (dropY > socket.y ? 75 : -75),
                  currentSocketId: null
                };
              }
              return item;
            });

            return { ...prev, sockets: nextSockets, ics: nextICs };
          });
        }
      } else {
        // DROPPED ON BLANK PCB (ZERO GRAVITY - RESTS IN PLACE)
        circuitAudio.playSnapSound(true);

        setConfig((prev) => {
          const nextSockets = prev.sockets.map((s) => {
            if (s.occupiedBy === ic.id) return { ...s, occupiedBy: null };
            return s;
          });

          const nextICs = prev.ics.map((item) => {
            if (item.id === ic.id) {
              return {
                ...item,
                x: dropX,
                y: dropY,
                currentSocketId: null
              };
            }
            return item;
          });

          return { ...prev, sockets: nextSockets, ics: nextICs };
        });
      }
    },
    [config.sockets, onShake]
  );

  const resetBoard = useCallback(() => {
    circuitAudio.playSnapSound(false);
    setConfig(createDefaultPCBConfig());
  }, []);

  const handleToggleMute = useCallback(() => {
    const muted = circuitAudio.toggleMute();
    setIsMuted(muted);
  }, []);

  const connectedCount = useMemo(() => {
    return config.sockets.filter((s) => s.occupiedBy !== null).length;
  }, [config.sockets]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-auto select-none">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 100], zoom: 1, up: [0, 1, 0] }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ParallaxCamera mousePos={mousePosRef} />
        <PCBSubstrate />
        <HardwareDecosLayer decos={config.decos} />
        <SocketsLayer sockets={config.sockets} activeMap={activeMap} />
        <TracesLayer traces={config.traces} activeMap={activeMap} />
        <LEDsLayer leds={config.leds} activeMap={activeMap} />

        {/* 18 Draggable ICs Layer */}
        {config.ics.map((ic) => (
          <DraggableIC
            key={ic.id}
            ic={ic}
            isInteractionDisabled={!sandboxViewOnly && isOverTextCard}
            onSpawnSparks={handleSpawnSparks}
            onDragEnd={handleDragEnd}
            onClick={(clickedIC) => {
              setInspectedIC({
                ...clickedIC.inspection,
                pinCount: clickedIC.pinCount
              });
            }}
          />
        ))}

        <ParticlesLayer particles={particles} />
      </Canvas>

      {/* Topmost Glassy Inspection Popup */}
      <ComponentTooltip
        data={inspectedIC}
        onClose={() => setInspectedIC(null)}
      />

      {/* Unobstructed Top-Right Telemetry & Caution HUD */}
      <CircuitHUD
        overloadDuration={hudHoverTimer}
        isOverloaded={hudIsOverloaded}
        connectedCount={connectedCount}
        totalComponents={config.sockets.length}
        onResetBoard={resetBoard}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />
    </div>
  );
}
