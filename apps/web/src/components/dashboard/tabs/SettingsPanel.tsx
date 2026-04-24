import { User, Bell, Shield, LogOut, Moon, Sun, Palette } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const CARD = { background: '#161b27', border: '1px solid rgba(255,255,255,0.06)' };

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6" style={CARD}>
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function SettingsPanel() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account preferences and application settings.</p>
      </div>

      {/* Account Info */}
      <SectionCard title="Account">
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/5">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-black text-white"
            style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>
            {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <p className="font-bold text-white text-base">{user?.fullName ?? 'User'}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <span className="mt-1 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(37,99,235,0.2)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.3)' }}>
              {user?.subscription ?? 'free'} plan
            </span>
          </div>
        </div>
        <SettingRow label="Full Name" description={user?.fullName ?? ''}>
          <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition">Edit</button>
        </SettingRow>
        <SettingRow label="Email Address" description={user?.email ?? ''}>
          <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition">Change</button>
        </SettingRow>
        <SettingRow label="Password" description="Last changed: unknown">
          <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition">Update</button>
        </SettingRow>
      </SectionCard>

      {/* Appearance */}
      <SectionCard title="Appearance">
        <SettingRow label="Theme" description="Choose between dark and light mode">
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold">
              <Moon className="h-3 w-3" /> Dark
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-slate-400 hover:text-white text-xs font-semibold transition">
              <Sun className="h-3 w-3" /> Light
            </button>
          </div>
        </SettingRow>
        <SettingRow label="Accent Color" description="Personalize the interface colour">
          <div className="flex items-center gap-2">
            {['#2563eb', '#7c3aed', '#059669', '#dc2626'].map(c => (
              <button key={c} className="h-6 w-6 rounded-full ring-2 ring-white/20 hover:ring-white/60 transition"
                style={{ background: c }} />
            ))}
          </div>
        </SettingRow>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notifications">
        <SettingRow label="Analysis Complete" description="Notify when AI analysis finishes">
          <Toggle defaultOn />
        </SettingRow>
        <SettingRow label="Interview Reminders" description="Get reminders before your practice sessions">
          <Toggle defaultOn={false} />
        </SettingRow>
        <SettingRow label="Weekly Reports" description="Receive a weekly progress digest">
          <Toggle defaultOn />
        </SettingRow>
      </SectionCard>

      {/* Security */}
      <SectionCard title="Security & Privacy">
        <SettingRow label="Two-Factor Authentication" description="Add an extra layer of security">
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition">
            Enable
          </button>
        </SettingRow>
        <SettingRow label="Active Sessions" description="Manage devices logged into your account">
          <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition">View All</button>
        </SettingRow>
        <SettingRow label="Data & Privacy" description="Download or delete your account data">
          <button className="text-xs font-semibold text-slate-400 hover:text-white transition">Manage</button>
        </SettingRow>
      </SectionCard>

      {/* Log Out */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-red-400">Sign Out</p>
            <p className="text-xs text-slate-500 mt-0.5">You will be returned to the login page.</p>
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

function Toggle({ defaultOn }: { defaultOn: boolean }) {
  return (
    <div className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${defaultOn ? 'bg-blue-600' : 'bg-slate-700'}`}>
      <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${defaultOn ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </div>
  );
}
