import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';

interface Bubble {
  id: number;
  x: number;
  size: number;
  opacity: number;
  speed: number;
  delay: number;
  blur: number;
  drift: number;
  wobbleAmp: number;
  wobbleSpeed: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  delay: number;
}

function generateBubbles(count: number): Bubble[] {
  const bubbles: Bubble[] = [];
  for (let i = 0; i < count; i++) {
    const depth = Math.random();
    const size = depth < 0.3 ? 4 + Math.random() * 8 : depth < 0.7 ? 10 + Math.random() * 24 : 24 + Math.random() * 48;
    bubbles.push({
      id: i,
      x: Math.random() * 100,
      size,
      opacity: depth < 0.3 ? 0.08 + Math.random() * 0.12 : depth < 0.7 ? 0.1 + Math.random() * 0.2 : 0.15 + Math.random() * 0.25,
      speed: depth < 0.3 ? 25 + Math.random() * 20 : depth < 0.7 ? 35 + Math.random() * 25 : 45 + Math.random() * 35,
      delay: Math.random() * 40,
      blur: depth < 0.3 ? 0 : depth < 0.7 ? Math.random() * 1 : 1 + Math.random() * 3,
      drift: (Math.random() - 0.5) * 30,
      wobbleAmp: 5 + Math.random() * 20,
      wobbleSpeed: 3 + Math.random() * 5,
    });
  }
  return bubbles;
}

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      opacity: 0.1 + Math.random() * 0.4,
      speed: 15 + Math.random() * 30,
      delay: Math.random() * 20,
    });
  }
  return particles;
}

const BubbleElement = React.memo(({ bubble }: { bubble: Bubble }) => {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${bubble.x}%`,
        bottom: '-5%',
        width: bubble.size,
        height: bubble.size,
        opacity: bubble.opacity,
        filter: bubble.blur > 0 ? `blur(${bubble.blur}px)` : undefined,
        background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,${0.3 + bubble.opacity * 0.4}), rgba(120,200,255,${bubble.opacity * 0.15}), transparent)`,
        border: `1px solid rgba(255,255,255,${0.15 + bubble.opacity * 0.2})`,
        boxShadow: `inset 0 0 ${bubble.size * 0.3}px rgba(255,255,255,0.1), 0 0 ${bubble.size * 0.5}px rgba(100,180,255,0.05)`,
        animation: `bubbleFloat ${bubble.speed}s linear ${bubble.delay}s infinite, bubbleWobble ${bubble.wobbleSpeed}s ease-in-out ${bubble.delay}s infinite`,
      }}
    />
  );
});

const ParticleElement = React.memo(({ particle }: { particle: Particle }) => {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: particle.size,
        height: particle.size,
        opacity: particle.opacity,
        background: `radial-gradient(circle, rgba(150,220,255,${particle.opacity}), transparent)`,
        boxShadow: `0 0 ${particle.size * 3}px rgba(100,180,255,${particle.opacity * 0.5})`,
        animation: `particleFloat ${particle.speed}s ease-in-out ${particle.delay}s infinite alternate`,
      }}
    />
  );
});

BubbleElement.displayName = 'BubbleElement';
ParticleElement.displayName = 'ParticleElement';

export default function UnderwaterBackground({ mouseX = 0, mouseY = 0 }: { mouseX?: number; mouseY?: number }) {
  const bubbles = useMemo(() => generateBubbles(200), []);
  const particles = useMemo(() => generateParticles(60), []);

  const parallaxX = mouseX * 15;
  const parallaxY = mouseY * 10;

  return (
    <div className="fixed inset-0 overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes bubbleFloat {
          0% { transform: translateY(0) translateX(0); }
          100% { transform: translateY(-120vh) translateX(0); }
        }
        @keyframes bubbleWobble {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(8px); }
          50% { transform: translateX(-5px); }
          75% { transform: translateX(6px); }
        }
        @keyframes particleFloat {
          0% { transform: translate(0, 0) scale(1); opacity: 0.1; }
          50% { transform: translate(15px, -20px) scale(1.3); opacity: 0.5; }
          100% { transform: translate(-10px, -40px) scale(0.8); opacity: 0.15; }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes lightRay {
          0%, 100% { opacity: 0.03; transform: scaleX(1) rotate(var(--ray-angle)); }
          50% { opacity: 0.08; transform: scaleX(1.1) rotate(var(--ray-angle)); }
        }
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #020617 0%, #0a1628 15%, #0c1f3f 30%, #0e2a52 45%, #0d2847 60%, #0a1f3d 75%, #071428 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 25s ease infinite',
        }}
      />

      {/* Animated gradient overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 20% 20%, rgba(30,80,180,0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(20,60,140,0.25) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(40,100,200,0.15) 0%, transparent 60%)',
          animation: 'gradientShift 30s ease infinite reverse',
          transform: `translate(${parallaxX * 0.3}px, ${parallaxY * 0.3}px)`,
        }}
      />

      {/* Light rays from top */}
      {[...Array(7)].map((_, i) => (
        <div
          key={`ray-${i}`}
          className="absolute top-0 pointer-events-none"
          style={{
            left: `${10 + i * 13}%`,
            width: `${60 + Math.random() * 120}px`,
            height: '110%',
            background: `linear-gradient(180deg, rgba(100,180,255,${0.04 + Math.random() * 0.04}) 0%, rgba(60,140,220,0.02) 40%, transparent 70%)`,
            transformOrigin: 'top center',
            '--ray-angle': `${-12 + i * 4}deg`,
            transform: `rotate(${-12 + i * 4}deg) translateX(${parallaxX * 0.1}px)`,
            animation: `lightRay ${6 + i * 1.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Glow orbs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: '10%', left: '15%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(30,100,220,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          transform: `translate(${parallaxX * 0.5}px, ${parallaxY * 0.5}px)`,
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          bottom: '15%', right: '10%',
          width: 350, height: 350,
          background: 'radial-gradient(circle, rgba(60,130,240,0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
          transform: `translate(${-parallaxX * 0.4}px, ${-parallaxY * 0.4}px)`,
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: '40%', right: '30%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(40,120,200,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
          transform: `translate(${parallaxX * 0.2}px, ${parallaxY * 0.2}px)`,
        }}
      />

      {/* Bubbles container */}
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${parallaxX * 0.15}px, ${parallaxY * 0.1}px)` }}
      >
        {bubbles.map(b => <BubbleElement key={b.id} bubble={b} />)}
      </div>

      {/* Particles */}
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${parallaxX * 0.2}px, ${parallaxY * 0.15}px)` }}
      >
        {particles.map(p => <ParticleElement key={p.id} particle={p} />)}
      </div>

      {/* Subtle wave overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '30%',
          background: 'linear-gradient(to top, rgba(5,15,35,0.4) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
