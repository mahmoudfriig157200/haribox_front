import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { api, setAuthToken } from '../lib/api';

function BellIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22" {...props}>
      <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z" fill="currentColor"/>
    </svg>
  );
}

function MenuIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" {...props}>
      <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export default function Layout({ children }) {
  const router = useRouter();
  const [jwt, setJwt] = useState('');
  const [me, setMe] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('jwt') : '';
    if (!t) { router.replace('/login'); return; }
    setJwt(t);
    setAuthToken(t);
  }, [router]);

  useEffect(() => { if (jwt) loadMe(); }, [jwt]);

  const loadMe = async () => {
    try {
      const { data } = await api.get('/me', { params: { token: jwt } });
      setMe(data);
    } catch (_) {}
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    setJwt('');
    setAuthToken(null);
    router.push('/login');
  };

  const initial = useMemo(() => {
    const s = (me?.name || me?.email || 'U').trim();
    return s ? s.charAt(0).toUpperCase() : 'U';
  }, [me]);

  const points = me?.points ?? 0;
  const isActive = (p) => router.pathname === p;
  const onNav = (href, after) => (e) => { if (router.pathname === href) { e.preventDefault(); } if (after) after(); };

  return (
    <div className="min-h-screen bg-black text-gray-200 relative">
      {/* Animated tech/grid background */}
      {/* Web-like glowing network background */}
      <canvas id="bg-web" className="absolute inset-0 w-full h-full" style={{ opacity: 0.25 }} suppressHydrationWarning />
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(1000px at 10% 10%, rgba(255,165,0,0.05), transparent 60%), radial-gradient(800px at 90% 30%, rgba(0,255,170,0.04), transparent 60%)', animation: 'glow 10s ease-in-out infinite alternate' }} />

      <div className="relative z-10 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex order-first md:order-none w-72 h-screen sticky top-0 bg-neutral-950 border-r border-neutral-800 px-5 py-6 flex-col overflow-y-auto">
          <div className="text-white text-2xl font-extrabold tracking-wider">xo45ox</div>

          {/* Profile card */}
          <div className="mt-6 flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="w-12 h-12 rounded-full bg-orange-500/90 flex items-center justify-center text-white text-lg font-bold">{initial}</div>
            <div className="leading-tight">
              <div className="text-white font-semibold truncate">{me?.name || 'Player'}</div>
              <div className="text-xs text-gray-400">Lv. 1</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="mt-6 grid gap-1 text-sm">
            <Link className={`px-3 py-2 rounded-md hover:bg-neutral-800 ${isActive('/dashboard') ? 'bg-neutral-800 text-white' : 'text-gray-300'}`} href="/dashboard" onClick={onNav('/dashboard')}>🏠 Dashboard</Link>
            <Link className={`px-3 py-2 rounded-md hover:bg-neutral-800 ${isActive('/rewards') ? 'bg-neutral-800 text-white' : 'text-gray-300'}`} href="/rewards" onClick={onNav('/rewards')}>🎁 Rewards</Link>
            <Link className={`px-3 py-2 rounded-md hover:bg-neutral-800 ${isActive('/requests') ? 'bg-neutral-800 text-white' : 'text-gray-300'}`} href="/requests" onClick={onNav('/requests')}>📜 My Requests</Link>
            <Link className={`px-3 py-2 rounded-md hover:bg-neutral-800 ${isActive('/profile') ? 'bg-neutral-800 text-white' : 'text-gray-300'}`} href="/profile" onClick={onNav('/profile')}>👤 My Profile</Link>
            <div className="px-3 py-2 rounded-md border border-neutral-800 bg-neutral-900 text-gray-400">
              <div className="flex items-center justify-between">
                <span>🔗 الربح من الروابط</span>
                <span className="text-[11px] text-amber-300">قيد التطوير</span>
              </div>
            </div>
            <div className="px-3 py-2 rounded-md border border-neutral-800 bg-neutral-900 text-gray-400">
              <div className="flex items-center justify-between">
                <span>🎮 اللعب و اربح</span>
                <span className="text-[11px] text-amber-300">قيد التطوير</span>
              </div>
            </div>
          </nav>

          <div className="mt-auto sticky bottom-0 left-0 right-0 bg-neutral-950 pt-4">
            <button className="w-full inline-flex items-center justify-center rounded-md border border-neutral-700 px-3 py-2 text-sm text-gray-200 hover:bg-neutral-800" onClick={logout}>Logout</button>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <aside
              className="absolute left-0 top-0 bottom-0 w-[80vw] max-w-[18rem] bg-neutral-950 border-r border-neutral-800 px-5 py-6 flex flex-col overflow-y-auto"
              style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div className="flex items-center justify-between">
                <div className="text-white text-2xl font-extrabold tracking-wider">xo45ox</div>
                <button aria-label="Close menu" className="text-gray-300 hover:text-white" onClick={() => setMobileOpen(false)}>
                  <CloseIcon />
                </button>
              </div>

              {/* Profile card */}
              <div className="mt-6 flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="w-12 h-12 rounded-full bg-orange-500/90 flex items-center justify-center text-white text-lg font-bold">{initial}</div>
                <div className="leading-tight">
                  <div className="text-white font-semibold truncate">{me?.name || 'Player'}</div>
                  <div className="text-xs text-gray-400">Lv. 1</div>
                </div>
              </div>

              {/* Nav */}
              <nav className="mt-6 grid gap-1 text-base">
                <Link className={`px-3 py-3 rounded-md hover:bg-neutral-800 ${isActive('/dashboard') ? 'bg-neutral-800 text-white' : 'text-gray-300'}`} href="/dashboard" onClick={onNav('/dashboard', ()=>setMobileOpen(false))}>🏠 Dashboard</Link>
                <Link className={`px-3 py-3 rounded-md hover:bg-neutral-800 ${isActive('/rewards') ? 'bg-neutral-800 text-white' : 'text-gray-300'}`} href="/rewards" onClick={onNav('/rewards', ()=>setMobileOpen(false))}>🎁 Rewards</Link>
                <Link className={`px-3 py-3 rounded-md hover:bg-neutral-800 ${isActive('/requests') ? 'bg-neutral-800 text-white' : 'text-gray-300'}`} href="/requests" onClick={onNav('/requests', ()=>setMobileOpen(false))}>📜 My Requests</Link>
                <Link className={`px-3 py-3 rounded-md hover:bg-neutral-800 ${isActive('/profile') ? 'bg-neutral-800 text-white' : 'text-gray-300'}`} href="/profile" onClick={onNav('/profile', ()=>setMobileOpen(false))}>👤 My Profile</Link>
                <div className="px-3 py-3 rounded-md border border-neutral-800 bg-neutral-900 text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>🔗 الربح من الروابط</span>
                    <span className="text-[12px] text-amber-300">قيد التطوير</span>
                  </div>
                </div>
                <div className="px-3 py-3 rounded-md border border-neutral-800 bg-neutral-900 text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>🎮 اللعب و اربح</span>
                    <span className="text-[12px] text-amber-300">قيد التطوير</span>
                  </div>
                </div>
              </nav>

              <div className="mt-4 pt-3 border-t border-neutral-800">
                <button className="w-full inline-flex items-center justify-center rounded-md border border-neutral-700 px-3 py-3 text-base text-gray-200 hover:bg-neutral-800" onClick={logout}>Logout</button>
              </div>
            </aside>
          </div>
        )}

        {/* Main area */}
        <div className="flex-1 min-h-screen">
          {/* Header */}
          <header
            className="h-16 border-b border-neutral-800 bg-black/60 backdrop-blur grid grid-cols-3 items-center px-3 md:px-4 sticky top-0 z-30 md:flex md:justify-between"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
          >
            {/* Left (mobile): menu button */}
            <div className="flex items-center gap-3">
              <button aria-label="Open menu" className="md:hidden text-gray-300 hover:text-white" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </button>
            </div>

            {/* Center (mobile): site name centered */}
            <div className="md:hidden text-white text-xl font-extrabold tracking-wider text-center">xo45ox</div>

            {/* Right: points + bell (fixed to right on mobile) */}
            <div className="ml-auto flex items-center gap-4 justify-self-end">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-800/50 bg-amber-900/20 text-amber-300 px-3 py-1 text-sm">
                <span>★</span>
                <span className="font-semibold">{points}</span>
              </div>
              <button className="relative text-gray-300 hover:text-white" aria-label="Notifications">
                <BellIcon />
              </button>
            </div>
          </header>

          <main className="px-2 md:px-0 py-3 md:py-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 3.5rem)' }}>
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-800 bg-black/80 backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="grid grid-cols-4 text-base text-gray-300">
          <Link href="/profile" className={`flex flex-col items-center gap-1 py-2.5 ${isActive('/profile') ? 'text-white' : ''}`} onClick={onNav('/profile')}>
            <span className="text-xl leading-none">👤</span>
            <span className="text-[13px]">الملف</span>
          </Link>
          <Link href="/rewards" className={`flex flex-col items-center gap-1 py-2.5 ${isActive('/rewards') ? 'text-white' : ''}`} onClick={onNav('/rewards')}>
            <span className="text-xl leading-none">💰</span>
            <span className="text-[13px]">السحب</span>
          </Link>
          <Link href="/requests" className={`flex flex-col items-center gap-1 py-2.5 ${isActive('/requests') ? 'text-white' : ''}`} onClick={onNav('/requests')}>
            <span className="text-xl leading-none">📜</span>
            <span className="text-[13px]">الطلبات</span>
          </Link>
          <Link href="/dashboard" className={`flex flex-col items-center gap-1 py-2.5 ${isActive('/dashboard') ? 'text-white' : ''}`} onClick={onNav('/dashboard')}>
            <span className="text-xl leading-none">🏠</span>
            <span className="text-[13px]">الرئيسية</span>
          </Link>
        </div>
      </nav>

      {/* scripts + keyframes for animated background */}
      <style jsx global>{`
        @keyframes glow { 0% { opacity: .16; } 50% { opacity: .28; } 100% { opacity: .16; } }
      `}</style>
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          const TWO_PI = Math.PI * 2;
          let canvas, ctx, w, h, points = [], links = [];
          const cfg = { count: 60, speed: 0.25, linkDist: 140, glow: 0.45 };
          function rnd(a,b){ return Math.random()*(b-a)+a; }
          function resize(){ w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; init(); }
          function init(){
            points = Array.from({length: cfg.count}, () => ({ x: rnd(0,w), y: rnd(0,h), vx: rnd(-cfg.speed, cfg.speed), vy: rnd(-cfg.speed, cfg.speed) }));
            links = [];
          }
          function step(){
            ctx.clearRect(0,0,w,h);
            // draw links
            for (let i=0;i<points.length;i++){
              const a = points[i]; a.x += a.vx; a.y += a.vy;
              if (a.x<0||a.x>w) a.vx*=-1; if (a.y<0||a.y>h) a.vy*=-1;
              for (let j=i+1;j<points.length;j++){
                const b = points[j];
                const dx=a.x-b.x, dy=a.y-b.y; const d=Math.hypot(dx,dy);
                if (d < cfg.linkDist){
                  const alpha = (1 - d/cfg.linkDist) * cfg.glow;
                  ctx.strokeStyle = 'rgba(255,200,120,'+alpha.toFixed(3)+')';
                  ctx.lineWidth = 1;
                  ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
                }
              }
            }
            // nodes
            for (const p of points){
              ctx.fillStyle = 'rgba(255,180,80,0.35)';
              ctx.beginPath(); ctx.arc(p.x, p.y, 1.2, 0, TWO_PI); ctx.fill();
            }
            requestAnimationFrame(step);
          }
          function start(){ canvas = document.getElementById('bg-web'); if(!canvas) return; ctx = canvas.getContext('2d'); resize(); step(); }
          if (document.readyState === 'complete' || document.readyState === 'interactive') start(); else document.addEventListener('DOMContentLoaded', start);
          window.addEventListener('resize', resize);
        })();
      `}} />
    </div>
  );
}