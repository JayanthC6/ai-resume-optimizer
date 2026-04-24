import { LogOut, Moon, Sun, Laptop } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

/* ── Theme helpers (mirrors ThemeSwitcher logic) ── */
type ThemeMode = 'light' | 'dark' | 'system';
const THEME_KEY = 'hiredlens-theme';

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', isDark);
  root.dataset.themeMode = isDark ? 'dark' : 'light';
  localStorage.setItem(THEME_KEY, mode);
}

function getStoredMode(): ThemeMode {
  const s = localStorage.getItem(THEME_KEY);
  return s === 'light' || s === 'dark' || s === 'system' ? s : 'system';
}

/* ── Small reusable pieces ── */
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)' }}>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--dash-text-primary)' }}>{label}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color: 'var(--dash-text-muted)' }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${on ? 'bg-blue-600' : 'bg-slate-600'}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

/* ── Main Settings Panel ── */
export function SettingsPanel() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  /* Theme state — synced with localStorage + document class */
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredMode);

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    applyTheme(mode);
  };

  /* Re-sync if system preference changes while system mode is active */
  useEffect(() => {
    if (themeMode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [themeMode]);

  /* Notification toggles */
  const [notif, setNotif] = useState({ analysis: true, reminders: false, weekly: true });
  const toggleNotif = (k: keyof typeof notif) => setNotif((p) => ({ ...p, [k]: !p[k] }));

  const handleLogout = () => { logout(); navigate('/login'); };

  const themeButtons: { mode: ThemeMode; icon: React.ElementType; label: string }[] = [
    { mode: 'light', icon: Sun, label: 'Light' },
    { mode: 'dark', icon: Moon, label: 'Dark' },
    { mode: 'system', icon: Laptop, label: 'System' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--dash-text-primary)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--dash-text-secondary)' }}>
          Manage your account preferences and application settings.
        </p>
      </div>

      {/* Account */}
      <SectionCard title="Account">
        <div className="flex items-center gap-4 mb-4 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>
            {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <p className="font-bold text-base" style={{ color: 'var(--dash-text-primary)' }}>{user?.fullName ?? 'User'}</p>
            <p className="text-sm" style={{ color: 'var(--dash-text-secondary)' }}>{user?.email}</p>
            <span className="mt-1 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(37,99,235,0.2)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.3)' }}>
              {(user as any)?.subscription ?? 'free'} plan
            </span>
          </div>
        </div>
        <Row label="Full Name" desc={user?.fullName ?? ''}>
          <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition">Edit</button>
        </Row>
        <Row label="Email Address" desc={user?.email ?? ''}>
          <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition">Change</button>
        </Row>
        <Row label="Password" desc="Last changed: unknown">
          <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition">Update</button>
        </Row>
      </SectionCard>

      {/* Appearance */}
      <SectionCard title="Appearance">
        <Row label="Theme" desc="Choose between light, dark, or follow your system">
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {themeButtons.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition"
                style={
                  themeMode === mode
                    ? { background: '#2563eb', color: '#fff' }
                    : { color: 'var(--dash-text-secondary)' }
                }
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Current theme" desc="Applied immediately across the whole dashboard">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg capitalize"
            style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa' }}>
            {themeMode}
          </span>
        </Row>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notifications">
        <Row label="Analysis Complete" desc="Notify when AI analysis finishes">
          <Toggle on={notif.analysis} onToggle={() => toggleNotif('analysis')} />
        </Row>
        <Row label="Interview Reminders" desc="Get reminders before your practice sessions">
          <Toggle on={notif.reminders} onToggle={() => toggleNotif('reminders')} />
        </Row>
        <Row label="Weekly Reports" desc="Receive a weekly progress digest">
          <Toggle on={notif.weekly} onToggle={() => toggleNotif('weekly')} />
        </Row>
      </SectionCard>

      {/* Security */}
      <SectionCard title="Security & Privacy">
        <Row label="Two-Factor Authentication" desc="Add an extra layer of security">
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:bg-white/5"
            style={{ border: '1px solid var(--dash-card-border)', color: 'var(--dash-text-secondary)' }}>
            Enable
          </button>
        </Row>
        <Row label="Active Sessions" desc="Manage devices logged into your account">
          <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition">View All</button>
        </Row>
        <Row label="Data & Privacy" desc="Download or delete your account data">
          <button className="text-xs font-semibold transition"
            style={{ color: 'var(--dash-text-secondary)' }}>Manage</button>
        </Row>
      </SectionCard>

      {/* Sign Out */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-red-400">Sign Out</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--dash-text-muted)' }}>You will be returned to the login page.</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-400 transition hover:bg-red-500/10"
            style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
