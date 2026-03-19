"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface PixelCursorProps {
  imageSrc: string;
}

export default function PixelCursor({ imageSrc }: PixelCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const mouseRef = useRef({ x: -500, y: -500 });
  const targetRef = useRef({ x: -500, y: -500 });
  const rafRef = useRef<number>(0);
  const [loaded, setLoaded] = useState(false);

  const PIXEL_FACTOR = 30; // how many pixels become one — higher = chunkier
  const RADIUS = 250;

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Track mouse
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      targetRef.current = { x: -500, y: -500 };
    };
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Smooth follow
    mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * 0.08;
    mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * 0.08;

    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (mx < -400 || my < -400) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    // Calculate object-cover mapping (matching how CSS renders the bg)
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const imgAspect = iw / ih;
    const vpAspect = w / h;
    let drawW: number, drawH: number, offsetX: number, offsetY: number;

    if (vpAspect > imgAspect) {
      drawW = w;
      drawH = w / imgAspect;
      offsetX = 0;
      offsetY = (h - drawH) / 2;
    } else {
      drawH = h;
      drawW = h * imgAspect;
      offsetX = (w - drawW) / 2;
      offsetY = 0;
    }

    // Create circular clip around cursor
    ctx.save();
    ctx.beginPath();
    ctx.arc(mx, my, RADIUS, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // True pixelation: draw to tiny offscreen canvas, then draw back scaled up
    // This uses imageSmoothingEnabled = false for authentic pixelation
    const tinyW = Math.ceil(w / PIXEL_FACTOR);
    const tinyH = Math.ceil(h / PIXEL_FACTOR);

    // Offscreen canvas at tiny resolution
    const offscreen = document.createElement("canvas");
    offscreen.width = tinyW;
    offscreen.height = tinyH;
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) {
      ctx.restore();
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    // Draw the image at tiny size (this naturally averages/downsamples pixels)
    offCtx.drawImage(
      img,
      0, 0, iw, ih,
      offsetX / PIXEL_FACTOR,
      offsetY / PIXEL_FACTOR,
      drawW / PIXEL_FACTOR,
      drawH / PIXEL_FACTOR
    );

    // Now draw the tiny canvas back to main canvas at full size
    // with image smoothing OFF — this creates the blocky pixelated look
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offscreen, 0, 0, tinyW, tinyH, 0, 0, w, h);
    ctx.imageSmoothingEnabled = true;

    ctx.restore();

    // Soft edge fade — draw a radial gradient ring to feather the circle edge
    ctx.save();
    const grad = ctx.createRadialGradient(mx, my, RADIUS * 0.7, mx, my, RADIUS);
    grad.addColorStop(0, "rgba(12, 12, 12, 0)");
    grad.addColorStop(1, "rgba(12, 12, 12, 1)");
    ctx.beginPath();
    ctx.arc(mx, my, RADIUS, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (loaded) {
      rafRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [loaded, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[3] pointer-events-none"
    />
  );
}
