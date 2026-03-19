"use client";

import { useEffect, useRef, useCallback } from "react";

// Warm cream-harmonious palette — ocher, terracotta, sand, golden, caramel
const SHAPE_COLORS = [
  "#d4a96a", // warm ocher
  "#c9845a", // terracotta
  "#e0c88a", // golden sand
  "#b8956e", // caramel
  "#e8b86d", // amber
  "#c4a882", // warm tan
  "#d9b87a", // honey
  "#be8055", // burnt sienna
];

// Shape configs: [n exponent, x scale, y scale]
// Higher n = more rounded corners, lower = more circular
type ShapeConfig = { n: number; sx: number; sy: number; ring?: boolean };

const SHAPE_CONFIGS: ShapeConfig[] = [
  { n: 2, sx: 0.85, sy: 0.85 },        // circle
  { n: 2, sx: 0.9, sy: 0.55 },          // wide ellipse
  { n: 2, sx: 0.5, sy: 0.9 },           // tall ellipse
  { n: 4, sx: 0.78, sy: 0.78 },         // squircle
  { n: 4, sx: 0.55, sy: 0.85 },         // tall rounded rect
  { n: 4, sx: 0.85, sy: 0.55 },         // wide rounded rect
  { n: 3, sx: 0.8, sy: 0.8 },           // soft diamond
  { n: 2, sx: 0.85, sy: 0.85, ring: true }, // ring (donut)
];

interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  colorIndex: number;
  shapeIndex: number;
  mass: number;
  opacity: number;
}

function drawSuperellipse(
  ctx: CanvasRenderingContext2D,
  s: number,
  n: number,
  sx: number,
  sy: number
) {
  ctx.beginPath();
  const steps = 200;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const cosT = Math.cos(t);
    const sinT = Math.sin(t);
    const px = Math.sign(cosT) * s * sx * Math.pow(Math.abs(cosT), 2 / n);
    const py = Math.sign(sinT) * s * sy * Math.pow(Math.abs(sinT), 2 / n);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  shapeIndex: number,
  size: number
) {
  const s = size / 2;
  const config = SHAPE_CONFIGS[shapeIndex % SHAPE_CONFIGS.length];

  drawSuperellipse(ctx, s, config.n, config.sx, config.sy);
  ctx.fill();

  if (config.ring) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    drawSuperellipse(ctx, s, config.n, config.sx * 0.55, config.sy * 0.55);
    ctx.fill();
    ctx.restore();
  }
}

function createBodies(width: number, height: number, count: number): Body[] {
  const bodies: Body[] = [];
  const baseSize = width < 640 ? 70 : 80;
  const sizeRange = width < 640 ? 110 : 130;
  for (let i = 0; i < count; i++) {
    const size = baseSize + Math.random() * sizeRange;
    bodies.push({
      x: size + Math.random() * (width - size * 2),
      y: size + Math.random() * (height - size * 2),
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.003,
      colorIndex: Math.floor(Math.random() * SHAPE_COLORS.length),
      shapeIndex: i % SHAPE_CONFIGS.length,
      mass: size * 0.1,
      opacity: 0.3 + Math.random() * 0.25,
    });
  }
  return bodies;
}

export default function PhysicsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bodiesRef = useRef<Body[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const rafRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    if (
      bodiesRef.current.length === 0 ||
      Math.abs(sizeRef.current.w - w) > 100
    ) {
      const count = w < 640 ? 10 : w < 1024 ? 12 : 14;
      bodiesRef.current = createBodies(w, h, count);
    }

    sizeRef.current = { w, h };
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouseRef.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        active: true,
      };
    };

    const handleLeave = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("mouseleave", handleLeave);
    canvas.addEventListener("touchend", handleLeave);

    const animate = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      const bodies = bodiesRef.current;
      const mouse = mouseRef.current;
      const getRadius = (b: Body) => b.size * 0.42;

      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];

        // Cursor repulsion
        if (mouse.active) {
          const dx = b.x - mouse.x;
          const dy = b.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const interactionRadius = 180;

          if (dist < interactionRadius && dist > 0) {
            const force =
              ((interactionRadius - dist) / interactionRadius) * 2.0;
            b.vx += (dx / dist) * force;
            b.vy += (dy / dist) * force;
            b.rotationSpeed += (Math.random() - 0.5) * 0.01;
          }
        }

        // Body collision
        for (let j = i + 1; j < bodies.length; j++) {
          const other = bodies[j];
          const dx = other.x - b.x;
          const dy = other.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = getRadius(b) + getRadius(other);

          if (dist < minDist && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = (minDist - dist) * 0.5;

            b.x -= nx * overlap;
            b.y -= ny * overlap;
            other.x += nx * overlap;
            other.y += ny * overlap;

            const relVx = b.vx - other.vx;
            const relVy = b.vy - other.vy;
            const relDot = relVx * nx + relVy * ny;

            if (relDot > 0) {
              const totalMass = b.mass + other.mass;
              const impulse = (2 * relDot) / totalMass;
              b.vx -= impulse * other.mass * nx * 0.7;
              b.vy -= impulse * other.mass * ny * 0.7;
              other.vx += impulse * b.mass * nx * 0.7;
              other.vy += impulse * b.mass * ny * 0.7;
            }
          }
        }

        // Drift
        b.vx += (Math.random() - 0.5) * 0.01;
        b.vy += (Math.random() - 0.5) * 0.01;

        // Damping
        b.vx *= 0.99;
        b.vy *= 0.99;
        b.rotationSpeed *= 0.997;

        // Speed cap
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (speed > 3.5) {
          b.vx = (b.vx / speed) * 3.5;
          b.vy = (b.vy / speed) * 3.5;
        }

        b.x += b.vx;
        b.y += b.vy;
        b.rotation += b.rotationSpeed;

        // Walls
        const r = getRadius(b);
        if (b.x - r < 0) { b.x = r; b.vx = Math.abs(b.vx) * 0.5; }
        if (b.x + r > w) { b.x = w - r; b.vx = -Math.abs(b.vx) * 0.5; }
        if (b.y - r < 0) { b.y = r; b.vy = Math.abs(b.vy) * 0.5; }
        if (b.y + r > h) { b.y = h - r; b.vy = -Math.abs(b.vy) * 0.5; }

        // Draw
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rotation);
        ctx.globalAlpha = b.opacity;
        ctx.fillStyle = SHAPE_COLORS[b.colorIndex];
        drawShape(ctx, b.shapeIndex, b.size);
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("mouseleave", handleLeave);
      canvas.removeEventListener("touchend", handleLeave);
    };
  }, [handleResize]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ touchAction: "none" }}
    />
  );
}
