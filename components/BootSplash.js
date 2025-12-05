// components/BootSplash.js
import { useEffect, useRef } from "react";
import Image from "next/image";

export default function BootSplash() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId;
    const duration = 4500; // ~4.5 seconds total

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }

    resize();
    window.addEventListener("resize", resize);

    // --- PARTICLES (comets) ---
    const center = { x: width / 2, y: height / 2 };
    const particleCount = 140;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = 140 + Math.random() * 140;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.008 + Math.random() * 0.012;

      particles.push({
        baseRadius: radius,
        angle,
        speed,
        size: 2 + Math.random() * 3,
        hue: 200 + Math.random() * 60, // blue–cyan
        explode: false,
        vx: 0,
        vy: 0,
        alpha: 0
      });
    }

    const start = performance.now();

    function draw(now) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1); // 0 → 1
      const swirlPhase = Math.min(t / 0.7, 1);   // first 70% = swirl
      const explodePhase = t > 0.7 ? (t - 0.7) / 0.3 : 0; // 70–100% = burst

      // slight fade each frame, to create trails
      ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
      ctx.fillRect(0, 0, width, height);

      // central glow
      const maxGlow = 220;
      const glowRadius = 40 + swirlPhase * maxGlow;
      const glowGradient = ctx.createRadialGradient(
        center.x,
        center.y,
        0,
        center.x,
        center.y,
        glowRadius
      );
      glowGradient.addColorStop(
        0,
        `rgba(80, 200, 255, ${0.25 + swirlPhase * 0.5})`
      );
      glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(center.x, center.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // when exploding, add white flash
      if (explodePhase > 0) {
        const flashAlpha = Math.max(0, 0.8 - explodePhase * 0.8);
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.4})`;
        ctx.fillRect(0, 0, width, height);
      }

      particles.forEach((p) => {
        if (!p.explode) {
          // swirl orbit shrinking inwards
          p.angle += p.speed * (0.6 + swirlPhase * 2.0);
          const shrink = 1 - swirlPhase * 0.45;
          const r = p.baseRadius * shrink;

          const x = center.x + Math.cos(p.angle) * r;
          const y = center.y + Math.sin(p.angle) * r * 0.7; // slight ellipse

          p.alpha = 0.2 + swirlPhase * 0.8;

          // draw comet
          ctx.beginPath();
          ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.alpha})`;
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // small tail
          const tailX = center.x + Math.cos(p.angle - 0.15) * (r - 22);
          const tailY = center.y + Math.sin(p.angle - 0.15) * (r - 22) * 0.7;
          const grad = ctx.createLinearGradient(x, y, tailX, tailY);
          grad.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${p.alpha})`);
          grad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
        }

        // trigger explosion once
        if (!p.explode && explodePhase > 0) {
          p.explode = true;
          const speed = 3 + Math.random() * 5;
          const angle = p.angle + (Math.random() - 0.5) * 0.8;
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
        }

        // move scattered particles
        if (p.explode) {
          p.alpha *= 0.9;
          p.size *= 0.99;
          if (p.alpha <= 0.02) return;

          ctx.beginPath();
          ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.alpha})`;
          center.x += 0; // keep center stable
          center.y += 0;
          // reuse vx/vy as position offsets
          p.vx *= 0.98;
          p.vy *= 0.98;
        }
      });

      if (t < 1.2) {
        animationFrameId = requestAnimationFrame(draw);
      }
    }

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black overflow-hidden">
      {/* Canvas for comet swirl */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Nice subtle radial gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.7),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(251,113,133,0.6),_transparent_65%)] mix-blend-screen opacity-70" />

      {/* Logo + text */}
      <div className="relative flex flex-col items-center">
        <div className="animate-[splashLogo_900ms_ease-out_forwards] opacity-0">
          <Image
            src="/hedgies-splash-logo.png"
            alt="Hedgies Studios"
            width={900}
            height={300}
            priority
          />
        </div>

        <div className="mt-4 text-[10px] tracking-[0.35em] uppercase text-gray-300 animate-[splashText_900ms_ease-out_400ms_forwards] opacity-0">
          BOOTING · HEDGIES OS
        </div>
      </div>
    </div>
  );
}
