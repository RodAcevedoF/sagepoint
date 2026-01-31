"use client";

import React, { useRef, useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface AntigravityProps {
  count?: number;
  magnetRadius?: number;
  ringRadius?: number;
  waveSpeed?: number;
  waveAmplitude?: number;
  particleSize?: number;
  lerpSpeed?: number;
  color?: string;
  autoAnimate?: boolean;
  particleVariance?: number;
  rotationSpeed?: number;
  depthFactor?: number;
  pulseSpeed?: number;
  particleShape?: "capsule" | "circle";
  fieldStrength?: number;
}

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  angle: number;
  velocity: number;
  distance: number;
  opacity: number;
  variance: number;
}

export const Antigravity: React.FC<AntigravityProps> = ({
  count = 320,
  magnetRadius = 8,
  ringRadius = 10,
  waveSpeed = 0.4,
  waveAmplitude = 1,
  particleSize = 2,
  lerpSpeed = 0.1,
  color = "#88d7f2",
  autoAnimate = true,
  particleVariance = 1,
  rotationSpeed = 0,
  depthFactor = 1,
  pulseSpeed = 3,
  particleShape = "capsule",
  fieldStrength = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const timeRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const lastStructuralConfig = useRef("");

  const { ref: inViewRef, inView } = useInView({
    threshold: 0,
  });

  const setRefs = (node: HTMLCanvasElement | null) => {
    canvasRef.current = node;
    inViewRef(node);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const structuralConfig = `${count}-${particleSize}-${particleVariance}-${ringRadius}`;
    if (
      particlesRef.current.length !== count ||
      lastStructuralConfig.current !== structuralConfig
    ) {
      lastStructuralConfig.current = structuralConfig;
      const p: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random();
        const y = Math.random();
        p.push({
          x: x * (typeof window !== "undefined" ? window.innerWidth : 1000), // Random initial spread
          y: y * (typeof window !== "undefined" ? window.innerHeight : 1000),
          baseX: x,
          baseY: y,
          size: Math.random() * particleSize + 0.5,
          angle: Math.random() * Math.PI * 2,
          velocity: Math.random() * 0.01 + 0.005,
          distance: Math.random() * ringRadius,
          opacity: Math.random() * 0.6 + 0.2,
          variance: Math.random() * particleVariance,
        });
      }
      particlesRef.current = p;
    }

    const currentParticles = particlesRef.current;
    let animationFrameId: number;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    handleResize();

    const render = () => {
      if (!inView) return;

      timeRef.current += waveSpeed * 0.02;
      const t = timeRef.current;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      currentParticles.forEach((p) => {
        // 1. Calculate Base Movement (Rotation + Wave)
        const rotationAngle = t * rotationSpeed;
        const cosR = Math.cos(rotationAngle);
        const sinR = Math.sin(rotationAngle);

        const nx = (p.baseX - 0.5) * canvas.width;
        const ny = (p.baseY - 0.5) * canvas.height;

        const rx = nx * cosR - ny * sinR;
        const ry = nx * sinR + ny * cosR;

        const bx = centerX + rx;
        const by = centerY + ry;

        const depth = Math.sin(t * 0.5 + p.angle) * depthFactor;
        const waveX =
          Math.cos(t + p.angle * p.variance) * waveAmplitude * fieldStrength;
        const waveY =
          Math.sin(t * 0.8 + p.angle * p.variance) *
          waveAmplitude *
          fieldStrength;

        let targetX = bx + waveX;
        let targetY = by + waveY;

        // 2. Vertical Drifting (Auto Animate)
        if (autoAnimate) {
          const drift = (t * p.velocity * 100) % canvas.height;
          targetY -= drift;
          if (targetY < 0) targetY += canvas.height;
        }

        // 3. ENHANCED Magnetism / Attraction Logic
        const mouseX = mouseRef.current.x;
        const mouseY = mouseRef.current.y;
        const dx = mouseX - targetX;
        const dy = mouseY - targetY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const effectiveMagnetRadius = magnetRadius * 85; // Massive influence area
        const minDistance = ringRadius * 2.5; // Tighter gathering

        if (distance < effectiveMagnetRadius && distance > 0) {
          // Responsive attraction curve
          const pullForce = Math.pow(
            (effectiveMagnetRadius - distance) / effectiveMagnetRadius,
            0.8,
          );

          if (distance < minDistance) {
            // Core push-back
            const pushForce = (minDistance - distance) / minDistance;
            targetX -= (dx / distance) * pushForce * 12;
            targetY -= (dy / distance) * pushForce * 12;
          } else {
            // Highly magnetic attraction
            targetX += dx * pullForce * (lerpSpeed * 6.5);
            targetY += dy * pullForce * (lerpSpeed * 6.5);
          }
        }

        // 4. Smooth Easing to calculated target
        p.x += (targetX - p.x) * lerpSpeed;
        p.y += (targetY - p.y) * lerpSpeed;

        // 5. Draw Particle
        const pulse = (Math.sin(t * pulseSpeed + p.angle) + 1) / 2;
        const scale = 1 + depth * 0.3;
        ctx.globalAlpha = p.opacity * (0.4 + 0.6 * pulse);

        ctx.beginPath();
        if (particleShape === "capsule") {
          const length = p.size * 3 * scale;
          ctx.lineWidth = p.size * scale;
          ctx.lineCap = "round";
          ctx.strokeStyle = color;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + length);
          ctx.stroke();
        } else {
          ctx.fillStyle = color;
          ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    inView,
    color,
    waveSpeed,
    waveAmplitude,
    fieldStrength,
    magnetRadius,
    ringRadius,
    lerpSpeed,
    autoAnimate,
    particleShape,
    pulseSpeed,
    count,
    particleSize,
    particleVariance,
    rotationSpeed,
    depthFactor,
  ]);

  return (
    <canvas
      ref={setRefs}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};
