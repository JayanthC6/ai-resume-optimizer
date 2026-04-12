import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Bell,
  User,
  ArrowRight,
  BarChart3,
  Mic,
  Code2,
  Map,
  FolderSearch,
  Tag,
  PenLine,
  HelpCircle,
  History,
  TrendingUp,
  Twitter,
  Linkedin,
} from 'lucide-react';

/* ─── avatar images for social proof ─── */
const trustAvatars = [
  'https://i.pravatar.cc/32?img=11',
  'https://i.pravatar.cc/32?img=22',
  'https://i.pravatar.cc/32?img=33',
];

/* ─── Feature cards data ─── */
const primaryFeatures = [
  {
    icon: BarChart3,
    title: 'ATS Shadow Analysis',
    desc: 'See exactly how your resume is parsed by leading applicant tracking systems. Re-formality it tops before you apply.',
    badge: { label: '94', sub: 'compatibility' },
    accent: '#2563eb',
    actions: ['Resume Upload', 'ATS Scan'],
  },
  {
    icon: Mic,
    title: 'Interview Simulator',
    desc: 'Practice in a lifelike environment with role-specific AI interview, see real-time behavioral feedback.',
    badge: null,
    accent: '#7c3aed',
    actions: [],
  },
  {
    icon: Code2,
    title: 'Code Arena',
    desc: 'Battle-test your technical skills against real coding challenges designed by engineers at top tech firms.',
    badge: null,
    accent: '#0891b2',
    actions: [],
  },
  {
    icon: Map,
    title: 'Skill Roadmap',
    desc: 'AI identifies your skill gaps and builds a personalized learning path to your dream role.',
    badge: null,
    accent: '#059669',
    actions: [],
  },
  {
    icon: FolderSearch,
    title: 'Portfolio Audit',
    desc: 'Visual analysis of your projects. Ensure your narrative is as strong as your skills.',
    badge: null,
    accent: '#d97706',
    actions: [],
  },
];

const miniFeatures = [
  { icon: Tag, label: 'Keyword Injector' },
  { icon: PenLine, label: 'Smart Rewriter' },
  { icon: HelpCircle, label: 'Q&A Prep' },
  { icon: History, label: 'Evolution History' },
];

const stats = [
  { value: '98%', label: 'Success Rate' },
  { value: '1.2M+', label: 'Resumes Scored' },
  { value: '500+', label: 'Global Partners' },
];

const footerProduct = ['Overview', 'Features', 'API Docs', 'Release Notes'];
const footerCompany = ['About', 'Privacy', 'Careers', 'Support', 'Privacy Policy'];

export default function HomePage() {
  const token = useAuthStore((s) => s.token);
  const dashboardHref = token ? '/dashboard' : '/register';

  return (
    <div className="min-h-screen text-white" style={{ background: '#0d1117', fontFamily: "'Inter', sans-serif" }}>

      {/* ════════════════ NAVBAR ════════════════ */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}>
              <TrendingUp className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight">HiredLens</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition">Overview</a>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#cta" className="hover:text-white transition">Pricing</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800">
            <Bell className="h-4 w-4" />
          </button>
          <button className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800">
            <User className="h-4 w-4" />
          </button>
          <Link
            to={dashboardHref}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(90deg,#2563eb,#1d4ed8)' }}
          >
            Start Analysis
          </Link>
        </div>
      </nav>

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative overflow-hidden px-6 pt-20 pb-12 md:px-16 lg:px-24">
        {/* Background glow */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl opacity-20" style={{ background: '#2563eb' }} />
        <div className="pointer-events-none absolute top-40 right-0 h-80 w-80 rounded-full blur-3xl opacity-10" style={{ background: '#7c3aed' }} />

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', color: '#60a5fa' }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              Intelligence for Talent
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight mb-6">
              Your AI-powered<br />
              <span style={{ background: 'linear-gradient(90deg,#3b82f6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                lens for the<br />future
              </span>
              <br />of work.
            </h1>

            <p className="text-slate-400 text-base leading-relaxed max-w-md mb-8">
              HiredLens decodes the recruitment landscape using advanced cognitive modeling. Optimize your presence and master the interview before you even step in the room.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Link
                to={dashboardHref}
                className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 active:scale-95 shadow-lg"
                style={{ background: 'linear-gradient(90deg,#2563eb,#1d4ed8)', boxShadow: '0 0 30px rgba(37,99,235,0.3)' }}
              >
                Optimize Your Career
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition hover:bg-slate-800"
                style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1' }}
              >
                View Demo
              </Link>
            </div>

            {/* Trust bar */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {trustAvatars.map((src, i) => (
                  <img key={i} src={src} alt="" className="h-8 w-8 rounded-full border-2 object-cover" style={{ borderColor: '#0d1117' }} />
                ))}
              </div>
              <span className="text-sm text-slate-400">Trusted by <strong className="text-white">700+</strong> industry professionals</span>
            </div>
          </div>

          {/* Right: Dashboard mockup card */}
          <div
            className="rounded-2xl p-5 shadow-2xl"
            style={{ background: 'linear-gradient(145deg,#161b27,#1a2133)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Fake top bar */}
            <div className="flex items-center gap-1.5 mb-4">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
              <div className="ml-3 flex-1 h-5 rounded bg-slate-800/60" />
            </div>

            {/* Score row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'ATS Score', value: '98+', color: '#3b82f6' },
                { label: 'Readability', value: 'A+', color: '#10b981' },
                { label: 'Keywords', value: '24', color: '#f59e0b' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: '#1e2a3a' }}>
                  <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Fake progress bars */}
            <div className="space-y-2.5">
              {[
                { label: 'Technical Skills', pct: 82, color: '#3b82f6' },
                { label: 'Communication', pct: 91, color: '#10b981' },
                { label: 'Leadership', pct: 67, color: '#f59e0b' },
                { label: 'Keywords Match', pct: 74, color: '#8b5cf6' },
              ].map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>{b.label}</span>
                    <span style={{ color: b.color }}>{b.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800">
                    <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Fake action row */}
            <div className="flex gap-2 mt-4">
              <div className="flex-1 h-8 rounded-lg bg-slate-800/80" />
              <div
                className="flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(90deg,#2563eb,#1d4ed8)' }}
              >
                Analyze Resume
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section id="features" className="px-6 py-20 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Precision-Engineered Career Tools</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Everything you need to navigate the modern job market, powered by the industry's most advanced AI engine.
            </p>
          </div>

          {/* Primary feature grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {primaryFeatures.map((f, i) => {
              const Icon = f.icon;
              const isFirst = i === 0;
              return (
                <div
                  key={f.title}
                  className={`rounded-2xl p-6 flex flex-col transition hover:translate-y-[-2px] duration-200 ${isFirst ? 'md:col-span-2 lg:col-span-1' : ''}`}
                  style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${f.accent}20`, border: `1px solid ${f.accent}40` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: f.accent }} />
                    </div>
                    {f.badge && (
                      <div className="text-right">
                        <p className="text-2xl font-black text-white">{f.badge.label}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{f.badge.sub}</p>
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed flex-1">{f.desc}</p>
                  {f.actions.length > 0 && (
                    <div className="flex gap-2 mt-4">
                      {f.actions.map((a) => (
                        <button
                          key={a}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80"
                          style={{ background: '#1e2a3a', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mini feature pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {miniFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.label}
                  className="flex items-center gap-3 rounded-xl p-4 transition hover:bg-slate-800/50"
                  style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <Icon className="h-4 w-4 text-blue-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-300">{f.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ STATS BAR ════════════════ */}
      <section
        className="px-6 py-14 md:px-16 lg:px-24"
        style={{ background: '#0f1623', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">The Standard in AI Recruitment.</h2>
            <p className="text-sm text-slate-400">Helping talent find opportunity, with precision.</p>
          </div>
          <div className="flex gap-12">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black text-white mb-1">{s.value}</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ CTA SECTION ════════════════ */}
      <section id="cta" className="px-6 py-24 md:px-16 lg:px-24 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[400px] w-[400px] rounded-full blur-3xl opacity-10" style={{ background: '#2563eb' }} />
        </div>
        <div className="max-w-2xl mx-auto text-center relative">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Ready to see your<br />career clearly?
          </h2>
          <p className="text-slate-400 text-base mb-10 max-w-md mx-auto">
            Join the new era of career intelligence. Our lens reveals the path your talent deserves.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={dashboardHref}
              className="flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-95 shadow-xl"
              style={{ background: 'linear-gradient(90deg,#2563eb,#1d4ed8)', boxShadow: '0 0 40px rgba(37,99,235,0.35)' }}
            >
              Optimize Your Career Now
            </Link>
            <button
              className="flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold transition hover:bg-slate-800"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1' }}
            >
              Enterprise Solutions
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer
        className="px-6 pt-14 pb-8 md:px-16 lg:px-24"
        style={{ background: '#0d1117', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}>
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold">HiredLens</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              HiredLens is the definitive AI career intelligence platform. We combine cognitive science with recruitment data to empower the global workforce.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="#" className="text-slate-500 hover:text-white transition"><Twitter className="h-4 w-4" /></a>
              <a href="#" className="text-slate-500 hover:text-white transition"><Linkedin className="h-4 w-4" /></a>
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Product</p>
            <ul className="space-y-2.5">
              {footerProduct.map((l) => (
                <li key={l}><a href="#" className="text-sm text-slate-400 hover:text-white transition">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Company</p>
            <ul className="space-y-2.5">
              {footerCompany.map((l) => (
                <li key={l}><a href="#" className="text-sm text-slate-400 hover:text-white transition">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6 text-xs text-slate-600"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span>© 2024 HiredLens AI. All rights reserved.</span>
          <span>Designed for the Cognitive Filters</span>
        </div>
      </footer>
    </div>
  );
}
