'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import {
  getResponsiveCircuitLayout,
  distToSegment,
  getPointOnTrace,
  getTraceTotalLength
} from '@/lib/circuit/traces';
import { ParticleSystem } from '@/lib/circuit/particles';
import { circuitAudio } from '@/lib/circuit/audio';
import { ComponentSpec, LEDSpec, TraceSegment, RibbonPulse } from '@/lib/circuit/types';
import ComponentTooltip, { InspectionData } from './ComponentTooltip';
import CircuitHUD from './CircuitHUD';

interface CircuitCanvasProps {
  onShake?: (intensity: 'slight' | 'intense' | 'none') => void;
}

export default function CircuitCanvas({ onShake }: CircuitCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Inspection modal state
  const [inspectedComponent, setInspectedComponent] = useState<InspectionData | null>(null);

  // Circuit HUD state
  const [overloadDuration, setOverloadDuration] = useState<number>(0);
  const [isOverloaded, setIsOverloaded] = useState<boolean>(false);
  const [connectedCount, setConnectedCount] = useState<number>(7);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // References to mutable physics & animation loop state
  const engineRef = useRef<Matter.Engine | null>(null);
  const particlesRef = useRef<ParticleSystem>(new ParticleSystem());
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const pointerDownRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const hoverDurationRef = useRef<number>(0);
  const isOverloadedRef = useRef<boolean>(false);
  const overloadCooldownRef = useRef<number>(0);

  // Component bodies and layout state
  const layoutRef = useRef<{
    components: ComponentSpec[];
    leds: LEDSpec[];
    traces: TraceSegment[];
    ribbons: RibbonPulse[];
  } | null>(null);

  const bodiesMapRef = useRef<
    Map<
      number,
      {
        id: string;
        spec: ComponentSpec | LEDSpec;
        type: 'ic' | 'led';
        connected: boolean;
      }
    >
  >(new Map());

  // Function to snap components back to their home sockets
  const resetBoard = useCallback(() => {
    if (!engineRef.current || !layoutRef.current) return;
    const { components, leds } = layoutRef.current;

    bodiesMapRef.current.forEach((item, bodyId) => {
      const body = engineRef.current?.world.bodies.find((b) => b.id === bodyId);
      if (!body) return;

      const homeX = item.spec.homeX;
      const homeY = item.spec.homeY;

      Matter.Body.setPosition(body, { x: homeX, y: homeY });
      Matter.Body.setVelocity(body, { x: 0, y: 0 });
      Matter.Body.setAngle(body, 0);
      Matter.Body.setAngularVelocity(body, 0);
      item.connected = true;
    });

    particlesRef.current.clear();
    circuitAudio.playSnapSound(false);
    setConnectedCount(components.length + leds.length);
  }, []);

  const handleToggleMute = useCallback(() => {
    const muted = circuitAudio.toggleMute();
    setIsMuted(muted);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // 1. Initialize Matter.js Engine & World
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.15, scale: 0.001 } // Low gravity for floaty space-station circuit feel
    });
    engineRef.current = engine;
    const world = engine.world;

    // 2. Setup responsive layout
    const layout = getResponsiveCircuitLayout(width, height);
    layoutRef.current = {
      components: layout.components,
      leds: layout.leds,
      traces: layout.traces,
      ribbons: layout.initialRibbons
    };

    bodiesMapRef.current.clear();

    // 3. Screen Boundary Walls
    const wallOptions = { isStatic: true, restitution: 0.8, friction: 0.1 };
    const wallThickness = 100;
    const walls = [
      Matter.Bodies.rectangle(width / 2, -wallThickness / 2, width * 2, wallThickness, wallOptions),
      Matter.Bodies.rectangle(width / 2, height + wallThickness / 2, width * 2, wallThickness, wallOptions),
      Matter.Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, wallOptions),
      Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, wallOptions)
    ];
    Matter.World.add(world, walls);

    // 4. Create IC Rigid Bodies
    layout.components.forEach((comp) => {
      const body = Matter.Bodies.rectangle(comp.homeX, comp.homeY, comp.width, comp.height, {
        restitution: 0.65,
        friction: 0.2,
        frictionAir: 0.04,
        chamfer: { radius: 6 }
      });

      Matter.World.add(world, body);
      bodiesMapRef.current.set(body.id, {
        id: comp.id,
        spec: comp,
        type: 'ic',
        connected: true
      });
    });

    // 5. Create LED Rigid Bodies
    layout.leds.forEach((led) => {
      const body = Matter.Bodies.circle(led.homeX, led.homeY, led.radius * 1.5, {
        restitution: 0.8,
        friction: 0.15,
        frictionAir: 0.03
      });

      Matter.World.add(world, body);
      bodiesMapRef.current.set(body.id, {
        id: led.id,
        spec: led,
        type: 'led',
        connected: true
      });
    });

    setConnectedCount(layout.components.length + layout.leds.length);

    // 6. Setup Mouse and Drag Interaction
    const mouse = Matter.Mouse.create(canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    Matter.World.add(world, mouseConstraint);

    // Track pointer movement
    const onMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseDown = (e: MouseEvent) => {
      pointerDownRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!pointerDownRef.current) return;
      const dx = Math.abs(e.clientX - pointerDownRef.current.x);
      const dy = Math.abs(e.clientY - pointerDownRef.current.y);
      const dt = performance.now() - pointerDownRef.current.time;

      // Click detection: minimal displacement and duration
      if (dx < 10 && dy < 10 && dt < 400) {
        // Find which component was clicked
        const clickedBody = Matter.Query.point(
          world.bodies.filter((b) => !b.isStatic),
          { x: e.clientX, y: e.clientY }
        )[0];

        if (clickedBody) {
          const item = bodiesMapRef.current.get(clickedBody.id);
          if (item) {
            if (item.type === 'ic') {
              const comp = item.spec as ComponentSpec;
              setInspectedComponent({
                ...comp.inspection,
                x: clickedBody.position.x,
                y: clickedBody.position.y,
                pinCount: comp.pinCount
              });
            } else if (item.type === 'led') {
              const led = item.spec as LEDSpec;
              setInspectedComponent({
                title: `Indicator LED (${led.color})`,
                subtitle: `Connected to Trace [${led.connectedTraceId}]`,
                description: item.connected
                  ? 'Active optoelectronic semiconductor node currently in closed-circuit telemetry state.'
                  : 'Disconnected from PCB socket. Circuit open.',
                status: item.connected ? 'ONLINE' : 'DISCONNECTED',
                specs: [
                  `Wavelength: ${led.color}`,
                  `Socket Coord: [${led.homeX}, ${led.homeY}]`,
                  `Forward Voltage: 2.1V`
                ],
                x: clickedBody.position.x,
                y: clickedBody.position.y
              });
            }
          }
        }
      }
      pointerDownRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // Resize handler
    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      // Reposition walls
      Matter.Body.setPosition(walls[0], { x: width / 2, y: -wallThickness / 2 });
      Matter.Body.setPosition(walls[1], { x: width / 2, y: height + wallThickness / 2 });
      Matter.Body.setPosition(walls[2], { x: -wallThickness / 2, y: height / 2 });
      Matter.Body.setPosition(walls[3], { x: width + wallThickness / 2, y: height / 2 });
    };
    window.addEventListener('resize', onResize);

    // 7. Main Physics & Render Animation Loop
    let lastTime = performance.now();

    const renderLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05); // seconds
      lastTime = time;

      // Update Matter physics
      Matter.Engine.update(engine, 1000 / 60);

      // Check Component Connection Status & Socket Snap
      let activeCount = 0;
      bodiesMapRef.current.forEach((item, bodyId) => {
        const body = world.bodies.find((b) => b.id === bodyId);
        if (!body) return;

        const homeX = item.spec.homeX;
        const homeY = item.spec.homeY;
        const distToSocket = Math.hypot(body.position.x - homeX, body.position.y - homeY);

        // Break logic: if pulled > 60px away
        if (item.connected && distToSocket > 60) {
          item.connected = false;
          circuitAudio.playSnapSound(true);
          particlesRef.current.spawnSparks(homeX, homeY, 12, true);
        } else if (!item.connected && distToSocket < 38) {
          // Snap back into socket if dragged close
          item.connected = true;
          Matter.Body.setPosition(body, { x: homeX, y: homeY });
          Matter.Body.setVelocity(body, { x: 0, y: 0 });
          Matter.Body.setAngle(body, 0);
          circuitAudio.playSnapSound(false);
          particlesRef.current.spawnSparks(homeX, homeY, 10, false);
        }

        if (item.connected) activeCount++;
      });
      setConnectedCount(activeCount);

      // Mouse Trace Collision & Overload Detection
      const mouseX = mousePosRef.current.x;
      const mouseY = mousePosRef.current.y;
      let isNearActiveTrace = false;
      let collisionX = 0;
      let collisionY = 0;

      // Check if mouse is hovering over an active trace
      if (layoutRef.current && !isOverloadedRef.current) {
        for (const trace of layoutRef.current.traces) {
          // Check if this trace is currently powered (all its components must be connected)
          let isTracePowered = true;
          for (const compId of trace.connectedComponentIds) {
            const entry = Array.from(bodiesMapRef.current.values()).find((e) => e.id === compId);
            if (entry && !entry.connected) {
              isTracePowered = false;
              break;
            }
          }

          if (!isTracePowered) continue;

          for (let i = 0; i < trace.points.length - 1; i++) {
            const p1 = trace.points[i];
            const p2 = trace.points[i + 1];
            const test = distToSegment(mouseX, mouseY, p1.x, p1.y, p2.x, p2.y);

            if (test.dist < 26) {
              isNearActiveTrace = true;
              collisionX = test.nearestX;
              collisionY = test.nearestY;
              break;
            }
          }
          if (isNearActiveTrace) break;
        }
      }

      // Overload state machine
      if (isOverloadedRef.current) {
        overloadCooldownRef.current -= dt;
        if (overloadCooldownRef.current <= 0) {
          isOverloadedRef.current = false;
          setIsOverloaded(false);
          hoverDurationRef.current = 0;
          setOverloadDuration(0);
          onShake?.('none');
        }
      } else if (isNearActiveTrace) {
        hoverDurationRef.current += dt;
        setOverloadDuration(hoverDurationRef.current);

        // Phase 1 (Hover <= 2s): Electric sparks & 'zzzz' sound + slight shake
        if (hoverDurationRef.current <= 3.0) {
          particlesRef.current.spawnSparks(collisionX, collisionY, 4, false);
          circuitAudio.startSparkBuzz(Math.min(1, hoverDurationRef.current / 2.0));
          onShake?.('slight');
        }

        // Phase 2 (Hover > 3s): Massive Overload 'Boom' + screen shake + smoke
        if (hoverDurationRef.current > 3.0) {
          isOverloadedRef.current = true;
          setIsOverloaded(true);
          overloadCooldownRef.current = 6.0; // 6s breaker reset cooldown

          circuitAudio.playOverloadBoom();
          onShake?.('intense');
          particlesRef.current.spawnOverloadSmoke(collisionX, collisionY, 45);
        }
      } else {
        if (hoverDurationRef.current > 0) {
          hoverDurationRef.current = Math.max(0, hoverDurationRef.current - dt * 2.5);
          setOverloadDuration(hoverDurationRef.current);
          circuitAudio.stopSparkBuzz();
          if (hoverDurationRef.current === 0) {
            onShake?.('none');
          }
        }
      }

      // Update particle physics
      particlesRef.current.update();

      // ==========================================
      // CANVAS RENDERING
      // ==========================================
      ctx.clearRect(0, 0, width, height);

      // 1. Deep Parallax PCB Substrate Background
      const parallaxFactorX = (mouseX / width - 0.5) * 15;
      const parallaxFactorY = (mouseY / height - 0.5) * 15;

      ctx.save();
      ctx.fillStyle = '#06080a';
      ctx.fillRect(0, 0, width, height);

      // Subtle PCB fiberglass grid lines
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.035)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      const offsetX = parallaxFactorX % gridSize;
      const offsetY = parallaxFactorY % gridSize;

      ctx.beginPath();
      for (let x = offsetX; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Silkscreen PCB Markings
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.font = '10px monospace';
      ctx.fillText('REV 3.2 // AVR BUS ARCHITECTURE', 40 + parallaxFactorX * 0.5, 40 + parallaxFactorY * 0.5);
      ctx.fillText('GND', 40 + parallaxFactorX * 0.5, height - 30 + parallaxFactorY * 0.5);
      ctx.fillText('+5V RAIL', width - 100 + parallaxFactorX * 0.5, 40 + parallaxFactorY * 0.5);
      ctx.fillText('PORTFOLIO_OS CORE', width - 180 + parallaxFactorX * 0.5, height - 30 + parallaxFactorY * 0.5);

      // 2. Render PCB Socket Guides (dashed rings where components belong)
      if (layoutRef.current) {
        layoutRef.current.components.forEach((comp) => {
          ctx.save();
          ctx.strokeStyle = 'rgba(0, 255, 65, 0.25)';
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.5;
          ctx.strokeRect(
            comp.homeX - comp.width / 2,
            comp.homeY - comp.height / 2,
            comp.width,
            comp.height
          );
          ctx.fillStyle = 'rgba(0, 255, 65, 0.15)';
          ctx.font = '9px monospace';
          ctx.fillText(`SOCKET: ${comp.label}`, comp.homeX - comp.width / 2 + 6, comp.homeY);
          ctx.restore();
        });

        layoutRef.current.leds.forEach((led) => {
          ctx.save();
          ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
          ctx.setLineDash([2, 3]);
          ctx.beginPath();
          ctx.arc(led.homeX, led.homeY, led.radius + 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        });
      }

      // 3. Render Circuit Traces
      if (layoutRef.current) {
        layoutRef.current.traces.forEach((trace) => {
          let isTracePowered = !isOverloadedRef.current;
          for (const compId of trace.connectedComponentIds) {
            const entry = Array.from(bodiesMapRef.current.values()).find((e) => e.id === compId);
            if (entry && !entry.connected) {
              isTracePowered = false;
              break;
            }
          }

          // Draw base copper trace path
          ctx.save();
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.lineWidth = trace.width;
          ctx.strokeStyle = isTracePowered ? trace.color : 'rgba(30, 45, 35, 0.5)';

          ctx.beginPath();
          trace.points.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.stroke();

          // Draw solder via pads along the trace
          trace.points.forEach((pt) => {
            ctx.fillStyle = isTracePowered ? '#143820' : '#151d18';
            ctx.strokeStyle = isTracePowered ? trace.glowColor : '#253528';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Solder hole center
            ctx.fillStyle = '#06080a';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw glowing ribbon energy currents (if trace is powered)
          if (isTracePowered) {
            const activeRibbons = layoutRef.current!.ribbons.filter((r) => r.traceId === trace.id);
            activeRibbons.forEach((ribbon) => {
              ribbon.progress += ribbon.speed;
              if (ribbon.progress > 1) ribbon.progress = 0;

              // Ribbon head and tail positions along polyline
              const headPt = getPointOnTrace(trace.points, ribbon.progress);
              const tailProgress = Math.max(0, ribbon.progress - ribbon.length);
              const tailPt = getPointOnTrace(trace.points, tailProgress);

              if (headPt && tailPt) {
                ctx.save();
                ctx.shadowBlur = 14;
                ctx.shadowColor = ribbon.color;
                ctx.strokeStyle = ribbon.color;
                ctx.lineWidth = trace.width * 1.8;
                ctx.lineCap = 'round';

                // Glowing head pulse
                ctx.beginPath();
                ctx.arc(headPt.x, headPt.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();

                // Streamer line
                ctx.beginPath();
                ctx.moveTo(tailPt.x, tailPt.y);
                ctx.lineTo(headPt.x, headPt.y);
                ctx.stroke();
                ctx.restore();
              }
            });
          }
          ctx.restore();
        });
      }

      // 4. Render Rigid Bodies (ICs and LEDs)
      world.bodies.forEach((body) => {
        const item = bodiesMapRef.current.get(body.id);
        if (!item) return;

        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        if (item.type === 'ic') {
          const comp = item.spec as ComponentSpec;
          const w = comp.width;
          const h = comp.height;

          // Draw Silver Legs/Pins
          const pinLen = 9;
          const pinWidth = 2.5;
          const pinSpacing = (w - 24) / (comp.pinsPerSide - 1);

          ctx.fillStyle = '#cfd8dc';
          ctx.strokeStyle = '#90a4ae';
          ctx.lineWidth = 0.8;

          // Top Pins (Pin 1 to Pin N/2)
          for (let i = 0; i < comp.pinsPerSide; i++) {
            const px = -w / 2 + 12 + i * pinSpacing;
            ctx.fillRect(px - pinWidth / 2, -h / 2 - pinLen, pinWidth, pinLen);
            ctx.strokeRect(px - pinWidth / 2, -h / 2 - pinLen, pinWidth, pinLen);
          }

          // Bottom Pins
          for (let i = 0; i < comp.pinsPerSide; i++) {
            const px = -w / 2 + 12 + i * pinSpacing;
            ctx.fillRect(px - pinWidth / 2, h / 2, pinWidth, pinLen);
            ctx.strokeRect(px - pinWidth / 2, h / 2, pinWidth, pinLen);
          }

          // IC Epoxy Body
          const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
          grad.addColorStop(0, '#22272e');
          grad.addColorStop(0.5, '#161b22');
          grad.addColorStop(1, '#0d1117');

          ctx.fillStyle = grad;
          ctx.strokeStyle = item.connected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 100, 100, 0.4)';
          ctx.lineWidth = 1.5;

          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 4);
          ctx.fill();
          ctx.stroke();

          // Pin 1 Index Notch (half-circle on the left edge)
          ctx.fillStyle = '#0d1117';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.beginPath();
          ctx.arc(-w / 2, 0, 5, -Math.PI / 2, Math.PI / 2);
          ctx.fill();
          ctx.stroke();

          // Pin 1 Circular Dot
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.beginPath();
          ctx.arc(-w / 2 + 14, -h / 2 + 14, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Laser-Etched Monospace Text Labels
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(comp.label, 6, -6);

          ctx.fillStyle = 'rgba(0, 255, 65, 0.85)';
          ctx.font = '9px monospace';
          ctx.fillText(`PIN COUNT: ${comp.pinCount} | ${item.connected ? 'ACTIVE' : 'PULLED'}`, 6, 12);
        } else if (item.type === 'led') {
          const led = item.spec as LEDSpec;
          const isPowered = item.connected && !isOverloadedRef.current;

          // Blinking calculation
          const now = performance.now();
          const isBlinkingOn =
            isPowered && Math.sin(((now + led.blinkPhase) / led.blinkInterval) * Math.PI * 2) > -0.2;

          // Outer Metal Ring
          ctx.fillStyle = '#263238';
          ctx.strokeStyle = '#546e7a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, led.radius * 1.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // LED Core
          if (isBlinkingOn) {
            ctx.shadowBlur = 18;
            ctx.shadowColor = led.color;

            const radial = ctx.createRadialGradient(0, 0, 1, 0, 0, led.radius);
            radial.addColorStop(0, '#ffffff');
            radial.addColorStop(0.4, led.color);
            radial.addColorStop(1, 'rgba(0, 255, 65, 0.2)');

            ctx.fillStyle = radial;
            ctx.beginPath();
            ctx.arc(0, 0, led.radius, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = '#1c2428';
            ctx.beginPath();
            ctx.arc(0, 0, led.radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      });

      // 5. Render Particle System (Sparks, Smoke)
      particlesRef.current.render(ctx);

      // Request next frame
      animFrameId = requestAnimationFrame(renderLoop);
    };

    animFrameId = requestAnimationFrame(renderLoop);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      circuitAudio.stopSparkBuzz();
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, [onShake]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-auto overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair select-none" />

      {/* Floating Component Inspection Tooltip */}
      <ComponentTooltip
        data={inspectedComponent}
        onClose={() => setInspectedComponent(null)}
      />

      {/* Circuit Status HUD */}
      <CircuitHUD
        overloadDuration={overloadDuration}
        isOverloaded={isOverloaded}
        connectedCount={connectedCount}
        totalComponents={7}
        onResetBoard={resetBoard}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />
    </div>
  );
}
