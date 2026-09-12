'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useRouter } from 'next/navigation';

// ─── Professional Magnetic Cursor ──────────────────────────────────────
function ProfessionalCursor() {
  const [mounted, setMounted] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, .interactive')) setIsHovering(true);
      else setIsHovering(false);
    };
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseover', handleOver);

    const animate = () => {
      // Smooth interpolation
      dotPos.current.x += (mouse.current.x - dotPos.current.x) * 0.25;
      dotPos.current.y += (mouse.current.y - dotPos.current.y) * 0.25;
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${dotPos.current.x - 4}px, ${dotPos.current.y - 4}px) scale(${isHovering ? 1.5 : 1})`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x - 18}px, ${ringPos.current.y - 18}px) scale(${isHovering ? 1.2 : 1})`;
        ringRef.current.style.opacity = isHovering ? '0.6' : '0.3';
      }
      requestAnimationFrame(animate);
    };
    const raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleOver);
      cancelAnimationFrame(raf);
    };
  }, [isHovering]);

  if (!mounted) return null;

  return (
    <>
      <div ref={dotRef} className="fixed top-0 left-0 w-2 h-2 bg-[#55FDDC] rounded-full pointer-events-none z-[10000] mix-blend-difference transition-transform duration-200" />
      <div ref={ringRef} className="fixed top-0 left-0 w-9 h-9 border border-[#55FDDC] rounded-full pointer-events-none z-[9999] transition-all duration-300 ease-out" />
      <div className="fixed inset-0 pointer-events-none z-[9997] opacity-[0.03]" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
    </>
  );
}

// ─── Magnetic Button Component ─────────────────────────────────────────
function MagneticButton({ children, className, onClick, ...props }: any) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current) return;
    const { left, top, width, height } = btnRef.current.getBoundingClientRect();
    const x = (e.clientX - (left + width / 2)) * 0.35;
    const y = (e.clientY - (top + height / 2)) * 0.35;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`${className} whitespace-nowrap flex-shrink-0`}
      style={{ transform: `translate(${position.x}px, ${position.y}px)`, transition: 'transform 0.1s ease-out' }}
      {...props}
    >
      <span className="relative z-10 pointer-events-none flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}

// ─── Refined Gradient Orbs ─────────────────────────────────────────────
function GradientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-soft-light">
      <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full opacity-[0.08] animate-orb-1 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #55FDDC, transparent 80%)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full opacity-[0.06] animate-orb-2 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #27E0C0, transparent 80%)' }} />
    </div>
  );
}

// ─── Scroll Reveal Hook ────────────────────────────────────────────────
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsRevealed(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, isRevealed };
}

// ─── Hero Particle Canvas ──────────────────────────────────────────────
function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => {
      w = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = [];
    const count = 40;
    const cw = canvas.offsetWidth, ch = canvas.offsetHeight;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * cw,
        y: Math.random() * ch,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.4 + 0.1,
      });
    }

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, cw, ch);
      // Update & draw particles
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = cw; if (p.x > cw) p.x = 0;
        if (p.y < 0) p.y = ch; if (p.y > ch) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(85, 253, 220, ${p.o})`;
        ctx.fill();
      }
      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(85, 253, 220, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}

// ─── Animated Particle Component ───────────────────────────────────────
function FloatingParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Static positioned particles with CSS animations */}
      <div className="absolute top-[15%] left-[10%] w-1 h-1 bg-[#55FDDC] rounded-full blur-[1px] opacity-40 animate-float-slow" />
      <div className="absolute top-[25%] left-[25%] w-1 h-1 bg-[#55FDDC] rounded-full blur-[1px] opacity-40 animate-float-medium" />
      <div className="absolute top-[50%] left-[33%] w-1.5 h-1.5 bg-[#24DFBF] rounded-full blur-[2px] opacity-20 animate-float-fast" />
      <div className="absolute top-[66%] right-[25%] w-1 h-1 bg-[#27E0C0] rounded-full blur-[1px] opacity-30 animate-float-slow" />
      <div className="absolute top-[40%] right-[15%] w-0.5 h-0.5 bg-[#55FDDC] rounded-full blur-[1px] opacity-25 animate-float-medium" />
      <div className="absolute top-[80%] left-[60%] w-1 h-1 bg-[#24DFBF] rounded-full blur-[1px] opacity-20 animate-float-fast" />
      <div className="absolute top-[10%] right-[40%] w-0.5 h-0.5 bg-[#55FDDC] rounded-full blur-[0.5px] opacity-35 animate-float-medium" />
      <div className="absolute top-[70%] left-[15%] w-1 h-1 bg-[#27E0C0] rounded-full blur-[2px] opacity-15 animate-float-slow" />
      <div className="absolute top-[35%] right-[10%] w-1.5 h-1.5 bg-[#55FDDC] rounded-full blur-[2px] opacity-10 animate-float-fast" />
    </div>
  );
}

// ─── Animated Counter ──────────────────────────────────────────────────
function AnimatedStat({ value, suffix, label }: { value: string; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const target = parseInt(value);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="space-y-2 group">
      <p className="text-4xl font-extrabold text-[#D6E6E3] tracking-tighter">
        {count}<span className="text-[#55FDDC]">{suffix}</span>
      </p>
      <p className="text-[10px] font-bold text-[#BACAC4] uppercase tracking-[0.3em]">{label}</p>
      <div className="h-[2px] w-12 bg-[#55FDDC]/40 mx-auto mt-4 rounded-full group-hover:w-20 transition-all duration-500" />
    </div>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────
export default function LandingPage() {
  const { isConnected, account, connectWallet, isConnecting } = useWallet();
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Scroll reveal refs for each section
  const processReveal = useScrollReveal(0.1);
  const infraReveal = useScrollReveal(0.1);
  const ctaReveal = useScrollReveal(0.15);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isConnected && account) router.push('/dashboard');
  }, [isConnected, account, router]);

  const handleConnect = async () => {
    try { await connectWallet(); } catch (e) { console.error(e); }
  };

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#081615] text-[#D6E6E3] font-['Inter'] antialiased overflow-x-hidden selection:bg-[#55FDDC]/30 cursor-none md:cursor-none">
      {/* Professional Cursor System */}
      <ProfessionalCursor />
      {/* Ambient Gradient Orbs */}
      <GradientOrbs />
      
      {/* ═══════════════════ NAVIGATION ═══════════════════ */}
      <nav className="fixed top-0 w-full z-50 bg-[#081615]/80 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(8,22,21,0.8)]">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-8 h-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#55FDDC] to-[#27E0C0] flex items-center justify-center">
              <span className="text-[#081615] font-black text-xs">C2</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tighter text-[#D6E6E3]">C2Ledger</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm tracking-tight">
            <a className="text-[#55FDDC] font-bold border-b-2 border-[#55FDDC] pb-1" href="#">Platform</a>
            <a className="text-[#BACAC4] hover:text-[#D6E6E3] transition-colors duration-300" href="#">Ledger</a>
            <a className="text-[#BACAC4] hover:text-[#D6E6E3] transition-colors duration-300" href="#">Credits</a>
            <a className="text-[#BACAC4] hover:text-[#D6E6E3] transition-colors duration-300" href="#">Network</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="hidden lg:flex items-center px-5 py-2 rounded-lg border border-[#3B4A45]/30 text-[#D6E6E3] font-medium text-sm hover:scale-105 hover:bg-[#55FDDC]/5 transition-all duration-300 active:scale-95"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
            <MagneticButton 
              onClick={handleConnect}
              className="flex items-center px-6 py-2.5 rounded-lg bg-gradient-to-br from-[#55FDDC] to-[#27E0C0] text-[#00382E] font-bold text-sm hover:scale-105 hover:shadow-[0_0_20px_rgba(85,253,220,0.4)] transition-all duration-300 active:scale-95"
            >
              Launch App
            </MagneticButton>
          </div>
        </div>
        <div className="bg-gradient-to-r from-transparent via-[#3B4A45]/20 to-transparent h-[1px] absolute bottom-0 w-full" />
      </nav>

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <main className="relative pt-32 pb-20 px-8 min-h-screen flex flex-col justify-center"
        style={{
          backgroundColor: '#081615',
          backgroundImage: `radial-gradient(at 0% 0%, rgba(85, 253, 220, 0.05) 0px, transparent 50%),
                            radial-gradient(at 100% 100%, rgba(39, 224, 192, 0.05) 0px, transparent 50%)`
        }}
      >
        <ParticleNetwork />
        <FloatingParticles />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Content */}
          <div className={`lg:col-span-7 space-y-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Protocol Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#1F2D2B]/50 backdrop-blur-md"
              style={{ outline: '1px solid rgba(59, 74, 69, 0.15)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#55FDDC] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#55FDDC]" />
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#BACAC4] uppercase">Carbon Protocol v0.1</span>
            </div>
            
            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-7xl md:text-8xl font-extrabold tracking-tighter text-[#D6E6E3]">Carbon</h1>
              <h1 className="text-7xl md:text-8xl font-extrabold tracking-tighter"
                style={{ background: 'linear-gradient(135deg, #55FDDC 0%, #27E0C0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Credits
              </h1>
            </div>
            
            {/* Subtext */}
            <p className="text-xl text-[#BACAC4] leading-relaxed max-w-2xl font-light">
              The immutable ledger for the carbon credit economy. Verify, issue, and trade carbon credits with absolute precision on the blockchain.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <MagneticButton 
                onClick={handleConnect}
                className="px-8 py-4 rounded-lg bg-gradient-to-br from-[#55FDDC] to-[#27E0C0] text-[#00382E] font-bold text-lg hover:shadow-[0_0_30px_rgba(85,253,220,0.5)] transition-all duration-300 active:scale-95 flex items-center gap-3"
              >
                Start Issuing Credits
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </MagneticButton>
              <button onClick={() => ("https://youtu.be/TPcto8tok-M")} className="px-8 py-4 rounded-lg bg-[#142221]/20 text-[#D6E6E3] font-semibold text-lg hover:bg-[#1F2D2B] transition-colors flex items-center gap-3 relative group overflow-hidden whitespace-nowrap flex-shrink-0"
                style={{ outline: '1px solid rgba(59, 74, 69, 0.15)' }}>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#55FDDC]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <svg className="w-5 h-5 text-[#55FDDC]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Watch Demo
              </button>
            </div>
          </div>

          {/* Right Visual: Glassmorphic Dashboard */}
          <div className={`lg:col-span-5 relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
            {/* Main Analytics Card */}
            <div className="p-6 rounded-xl border border-[#55FDDC]/10 shadow-2xl relative z-10 transform lg:rotate-2 hover:rotate-0 transition-transform duration-700"
              style={{ background: 'rgba(41, 55, 54, 0.6)', backdropFilter: 'blur(20px)' }}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] text-[#BACAC4] uppercase tracking-widest font-bold mb-1">Total Trading Volume</p>
                  <h3 className="text-3xl font-bold text-[#D6E6E3] tracking-tight">$42.8M CC</h3>
                </div>
                <div className="bg-[#55FDDC]/10 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-[#55FDDC]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
              </div>
              {/* Bar Chart */}
              <div className="h-48 w-full flex items-end gap-1 overflow-hidden">
                {[30, 45, 60, 85, 70, 55, 90].map((h, i) => (
                  <div key={i} className="w-full rounded-t-sm relative transition-all duration-500 hover:opacity-100"
                    style={{ height: `${h}%`, background: `rgba(85, 253, 220, ${0.2 + (h/100) * 0.5})`, animationDelay: `${i * 100}ms` }}>
                    {h === 90 && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#55FDDC] rounded-full shadow-[0_0_10px_#55FDDC]" />}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-[#3B4A45]/10 pt-6">
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#55FDDC] to-[#27E0C0] border-2 border-[#081615] flex items-center justify-center text-[8px] font-bold text-[#081615]">A</div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#27E0C0] to-[#006B5A] border-2 border-[#081615] flex items-center justify-center text-[8px] font-bold text-[#D6E6E3]">B</div>
                  <div className="w-8 h-8 rounded-full bg-[#293736] border-2 border-[#081615] flex items-center justify-center text-[10px] font-bold text-[#BACAC4]">+12</div>
                </div>
                <span className="text-[10px] font-bold text-[#55FDDC] tracking-widest uppercase">Live Nodes</span>
              </div>
            </div>

            {/* Floating Profile Card */}
            <div className="absolute -bottom-10 -left-12 lg:-left-20 p-4 rounded-xl border border-[#55FDDC]/5 shadow-2xl z-20 w-56 transform -rotate-3 hover:rotate-0 transition-transform duration-700"
              style={{ background: 'rgba(41, 55, 54, 0.6)', backdropFilter: 'blur(20px)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#55FDDC] to-[#27E0C0] flex items-center justify-center text-[#00382E] font-bold text-xs">JD</div>
                <div>
                  <p className="text-xs font-bold text-[#D6E6E3]">Jupiter Deep</p>
                  <p className="text-[9px] text-[#BACAC4] font-mono">0x71...f9a2</p>
                </div>
              </div>
              <div className="bg-[#041010]/50 rounded p-2 flex justify-between items-center">
                <span className="text-[9px] font-bold text-[#BACAC4] uppercase">CC Balance</span>
                <span className="text-xs font-bold text-[#55FDDC]">12.4k</span>
              </div>
            </div>

            {/* Background Glow */}
            <div className="absolute -top-12 -right-8 w-64 h-64 bg-[#55FDDC]/5 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </main>

      {/* ═══════════════════ STATS BAR ═══════════════════ */}
      <section className="relative z-30 py-12 border-t border-[#3B4A45]/5 bg-[#101E1D]/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <AnimatedStat value="1" suffix="M+" label="Certificates Issued" />
            <AnimatedStat value="200" suffix="+" label="Facilities Verified" />
            <AnimatedStat value="100" suffix="%" label="On-Chain Transparency" />
          </div>
        </div>
      </section>

      {/* ═══════════════════ PROCESS SECTION ═══════════════════ */}
      <section ref={processReveal.ref} className="relative py-32 px-8 bg-[#081615]">
        <FloatingParticles />
        <div className={`max-w-7xl mx-auto transition-all duration-1000 ${processReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
          {/* Section Header */}
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#1F2D2B]/50 text-[10px] font-bold tracking-[0.2em] text-[#BACAC4] uppercase mb-6"
              style={{ outline: '1px solid rgba(59, 74, 69, 0.15)' }}>
              The Alchemical Process
            </span>
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-[#D6E6E3]">
              From Molecule to Asset
            </h2>
          </div>

          {/* Process Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                ),
                title: 'Produce',
                desc: 'IoT sensors capture real-time energy data directly from the generator facility, recording the molecular signature.',
                step: '01'
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                ),
                title: 'Verify',
                desc: 'Decentralized validator network validates the green origins against global standards and issues verifiable credit certificates.',
                step: '02'
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                ),
                title: 'Trade',
                desc: 'Liquid secondary markets allow for the seamless exchange of verified trading credits with instant settlement.',
                step: '03'
              }
            ].map((item, i) => (
              <div key={i} className={`group relative rounded-xl p-8 border border-[#3B4A45]/10 hover:border-[#55FDDC]/20 transition-all duration-700 hover:scale-[1.02] overflow-hidden ${processReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ background: 'rgba(41, 55, 54, 0.3)', backdropFilter: 'blur(12px)', transitionDelay: `${i * 150 + 200}ms` }}>
                {/* Glow Icon */}
                <div className="w-14 h-14 rounded-xl bg-[#55FDDC]/10 flex items-center justify-center text-[#55FDDC] mb-6 group-hover:shadow-[0_0_20px_rgba(85,253,220,0.2)] transition-shadow duration-500">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-[#D6E6E3] mb-3">{item.title}</h3>
                <p className="text-sm text-[#BACAC4] leading-relaxed mb-12">{item.desc}</p>
                {/* Step Number */}
                <span className="absolute bottom-4 right-6 text-6xl font-extrabold text-[#55FDDC]/[0.07] tracking-tighter">{item.step}</span>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#55FDDC] to-[#27E0C0] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CORE INFRASTRUCTURE ═══════════════════ */}
      <section ref={infraReveal.ref} className="relative py-32 px-8 bg-[#0A1918]">
        <div className={`max-w-7xl mx-auto transition-all duration-1000 ${infraReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Large Feature: Blockchain Immutable Ledger */}
            <div className="row-span-2 rounded-xl p-10 border border-[#3B4A45]/10 hover:border-[#55FDDC]/15 transition-all duration-500 relative overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, rgba(20, 34, 33, 0.8) 0%, rgba(16, 30, 29, 0.6) 100%)' }}>
              <span className="inline-block px-3 py-1 rounded-full bg-[#55FDDC]/10 text-[9px] font-bold tracking-[0.15em] text-[#55FDDC] uppercase mb-6">
                Core Infrastructure
              </span>
              <h3 className="text-3xl font-extrabold text-[#D6E6E3] tracking-tight mb-4">
                Blockchain Immutable<br/>Ledger
              </h3>
              <p className="text-sm text-[#BACAC4] leading-relaxed mb-8 max-w-md">
                Every metric ton of carbon is accounted for in a cryptographic chain of custody that cannot be altered or deleted.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#55FDDC]/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#55FDDC]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <span className="text-sm text-[#D6E6E3] font-medium">Zero-knowledge proof validation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#55FDDC]/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#55FDDC]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <span className="text-sm text-[#D6E6E3] font-medium">Audit-2 Compliant Protocols</span>
                </div>
              </div>
              {/* Decorative blockchain nodes */}
              <div className="absolute bottom-8 right-8 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                <div className="relative w-32 h-32">
                  <div className="absolute top-0 left-0 w-4 h-4 rounded-full bg-[#55FDDC]/40 shadow-[0_0_8px_rgba(85,253,220,0.3)]" />
                  <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-[#27E0C0]/40" />
                  <div className="absolute bottom-0 left-1/2 w-5 h-5 rounded-full bg-[#55FDDC]/30" />
                  <div className="absolute top-2 left-2 w-24 h-[1px] bg-gradient-to-r from-[#55FDDC]/30 to-transparent rotate-[-15deg]" />
                  <div className="absolute top-4 left-4 w-20 h-[1px] bg-gradient-to-r from-transparent to-[#55FDDC]/20 rotate-[60deg]" />
                </div>
              </div>
            </div>

            {/* Real-time Tracking */}
            <div className="rounded-xl p-8 border border-[#3B4A45]/10 hover:border-[#55FDDC]/15 transition-all duration-500 group"
              style={{ background: 'rgba(20, 34, 33, 0.6)' }}>
              <h3 className="text-xl font-bold text-[#D6E6E3] mb-2">Real-time Tracking</h3>
              <p className="text-xs text-[#BACAC4] mb-6">Monitor cross-border emissions with real-time metrics across your portfolio.</p>
              {/* Mini Bar Chart */}
              <div className="h-24 flex items-end gap-1">
                {[40, 65, 50, 80, 60, 75, 90, 55, 70].map((h, i) => (
                  <div key={i} className="w-full rounded-t-sm transition-all duration-500"
                    style={{ height: `${h}%`, background: `linear-gradient(to top, rgba(85, 253, 220, ${0.3 + (h/200)}), rgba(39, 224, 192, ${0.1 + (h/300)}))` }} />
                ))}
              </div>
            </div>

            {/* Executive Reporting */}
            <div className="rounded-xl p-8 border border-[#3B4A45]/10 hover:border-[#55FDDC]/15 transition-all duration-500 group flex items-center gap-6"
              style={{ background: 'rgba(20, 34, 33, 0.4)' }}>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#D6E6E3] mb-2">Executive Reporting</h3>
                <p className="text-xs text-[#BACAC4]">Generate SEC-compatible reports and audit trails for regulatory stakeholders.</p>
              </div>
              <div className="w-16 h-16 rounded-xl bg-[#55FDDC]/5 flex items-center justify-center group-hover:bg-[#55FDDC]/10 transition-colors">
                <svg className="w-8 h-8 text-[#55FDDC]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
            </div>

            {/* Global Scale Network — full width */}
            <div className="lg:col-span-2 rounded-xl p-8 border border-[#3B4A45]/10 hover:border-[#55FDDC]/15 transition-all duration-500 group flex items-center justify-between gap-8"
              style={{ background: 'rgba(20, 34, 33, 0.4)' }}>
              <div>
                <h3 className="text-xl font-bold text-[#D6E6E3] mb-2">Global Scale Network</h3>
                <p className="text-sm text-[#BACAC4] mb-4 max-w-md">C2Ledger connects producers from 6 continents to a distributed ledger built to handle a trillion credits per year.</p>
                <a href="#" className="inline-flex items-center gap-2 text-sm text-[#55FDDC] font-semibold hover:underline group/link">
                  Explore the Network 
                  <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
              </div>
              {/* Globe visualization */}
              <div className="hidden md:block relative w-40 h-40 opacity-30 group-hover:opacity-50 transition-opacity duration-700">
                <div className="absolute inset-0 rounded-full border border-[#55FDDC]/20" />
                <div className="absolute inset-3 rounded-full border border-[#55FDDC]/15" />
                <div className="absolute inset-6 rounded-full border border-[#55FDDC]/10" />
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#55FDDC]/15" />
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#55FDDC]/15" />
                {/* Network dots */}
                <div className="absolute top-4 left-8 w-2 h-2 rounded-full bg-[#55FDDC] shadow-[0_0_6px_rgba(85,253,220,0.5)]" />
                <div className="absolute top-12 right-6 w-1.5 h-1.5 rounded-full bg-[#27E0C0] shadow-[0_0_4px_rgba(39,224,192,0.4)]" />
                <div className="absolute bottom-8 left-12 w-2 h-2 rounded-full bg-[#55FDDC] shadow-[0_0_6px_rgba(85,253,220,0.3)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA SECTION ═══════════════════ */}
      <section ref={ctaReveal.ref} className="relative py-32 px-8"
        style={{
          backgroundColor: '#081615',
          backgroundImage: `radial-gradient(at 50% 50%, rgba(85, 253, 220, 0.06) 0px, transparent 60%)`
        }}>
        <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${ctaReveal.isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="rounded-2xl p-16 relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, rgba(20, 34, 33, 0.8) 0%, rgba(10, 25, 24, 0.9) 100%)',
              boxShadow: '0 0 80px rgba(85, 253, 220, 0.05), inset 0 1px 0 rgba(85, 253, 220, 0.1)'
            }}>
            {/* Edge Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-[#55FDDC]/30 to-transparent" />
            
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-[#D6E6E3] mb-6">
              Join the Revolution.
            </h2>
            <p className="text-lg text-[#BACAC4] leading-relaxed max-w-xl mx-auto mb-10">
              Start your journey towards a transparent, verified carbon future. Connect your wallet to access the dashboard and begin minting credits.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6">
              <MagneticButton 
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-8 py-4 rounded-lg text-[#D6E6E3] font-semibold text-lg hover:bg-[#1F2D2B] transition-all duration-300 flex items-center gap-3 active:scale-95"
                style={{ outline: '1px solid rgba(59, 74, 69, 0.3)' }}>
                <svg className="w-5 h-5 text-[#55FDDC]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-lg bg-gradient-to-br from-[#55FDDC] to-[#27E0C0] text-[#00382E] font-bold text-lg hover:shadow-[0_0_30px_rgba(85,253,220,0.5)] transition-all duration-300 active:scale-95">
                Speak with an Expert
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="bg-[#081615] w-full pt-16 pb-8 border-t border-[#3B4A45]/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#55FDDC] to-[#27E0C0] flex items-center justify-center">
                  <span className="text-[#081615] font-black text-[9px]">C2</span>
                </div>
                <span className="text-xl font-extrabold tracking-tighter text-[#D6E6E3]">C2Ledger</span>
              </div>
              <p className="text-xs text-[#BACAC4] leading-relaxed max-w-xs">
                All carbon assets. One digital infrastructure.<br/>International transparency.
              </p>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#BACAC4] uppercase mb-6">Platform</h4>
              <ul className="space-y-3">
                {['Marketplace', 'Dashboard', 'API Docs'].map(link => (
                  <li key={link}><a href="#" className="text-sm text-[#84948F] hover:text-[#55FDDC] transition-colors duration-300">{link}</a></li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#BACAC4] uppercase mb-6">Company</h4>
              <ul className="space-y-3">
                {['About Us', 'Blog', 'Careers', 'Press'].map(link => (
                  <li key={link}><a href="#" className="text-sm text-[#84948F] hover:text-[#55FDDC] transition-colors duration-300">{link}</a></li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#BACAC4] uppercase mb-6">Newsletter</h4>
              <div className="flex items-center gap-2">
                <input 
                  type="email" 
                  placeholder="your@email.com"
                  className="flex-1 bg-[#293736] text-[#D6E6E3] text-sm px-4 py-2.5 rounded-lg border-none outline-none placeholder:text-[#84948F] focus:ring-1 focus:ring-[#55FDDC]/30 transition-all"
                />
                <MagneticButton className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#55FDDC] to-[#27E0C0] flex items-center justify-center active:scale-90 transition-transform">
                  <svg className="w-4 h-4 text-[#081615]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </MagneticButton>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[#3B4A45]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#84948F] line-through">© 2026 C2Ledger. Vinay Codes.</p>
            <div className="flex items-center gap-6 text-xs text-[#84948F]">
              <a href="#" className="hover:text-[#55FDDC] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#55FDDC] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#55FDDC] transition-colors">Security</a>
              <a href="#" className="hover:text-[#55FDDC] transition-colors">Documentation</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════ GLOBAL ANIMATIONS ═══════════════════ */}
      <style jsx global>{`
        /* Restore default cursor for interactive elements */
        a, button, input, select, textarea, [role="button"] {
          cursor: pointer !important;
        }
        @media (max-width: 768px) {
          * { cursor: auto !important; }
        }

        /* Floating particle animations */
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
          25% { transform: translateY(-25px) translateX(15px); opacity: 0.15; }
          50% { transform: translateY(-10px) translateX(-10px); opacity: 0.35; }
          75% { transform: translateY(15px) translateX(5px); opacity: 0.2; }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.25; }
          33% { transform: translateY(-18px) translateX(12px); opacity: 0.4; }
          66% { transform: translateY(8px) translateX(-8px); opacity: 0.15; }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
          50% { transform: translateY(-12px) translateX(6px); opacity: 0.4; }
        }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 7s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 5s ease-in-out infinite; }

        /* Gradient orb drift animations */
        @keyframes orb-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(80px, 60px) scale(1.1); }
          50% { transform: translate(-40px, 120px) scale(0.9); }
          75% { transform: translate(60px, -30px) scale(1.05); }
        }
        @keyframes orb-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-70px, -50px) scale(1.15); }
          66% { transform: translate(50px, 80px) scale(0.85); }
        }
        @keyframes orb-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          20% { transform: translate(100px, -40px) scale(1.05); }
          40% { transform: translate(-60px, -80px) scale(1.1); }
          60% { transform: translate(30px, 50px) scale(0.95); }
          80% { transform: translate(-80px, 20px) scale(1.08); }
        }
        .animate-orb-1 { animation: orb-1 25s ease-in-out infinite; }
        .animate-orb-2 { animation: orb-2 30s ease-in-out infinite; }
        .animate-orb-3 { animation: orb-3 35s ease-in-out infinite; }

        /* Smooth scroll for the whole page */
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
