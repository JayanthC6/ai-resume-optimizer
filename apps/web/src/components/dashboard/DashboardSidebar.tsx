import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  KeyRound,
  FileEdit,
  Map,
  HelpCircle,
  Mic,
  FolderSearch,
  Clock,
  Settings,
  LifeBuoy,
  TrendingUp,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';
import { useState } from 'react';

export type TabKey =
  | 'overview'
  | 'keywords'
  | 'rewrites'
  | 'roadmap'
  | 'interview'
  | 'portfolio'
  | 'history'
  | 'mock-interview'
  | 'settings'
  | 'support';

type SidebarItem = {
  key: TabKey;
  label: string;
  icon: React.ElementType;
};

const NAV_ITEMS: SidebarItem[] = [
  { key: 'overview',       label: 'Overview',         icon: LayoutDashboard },
  { key: 'keywords',       label: 'Keywords',         icon: KeyRound },
  { key: 'rewrites',       label: 'Rewrites',         icon: FileEdit },
  { key: 'roadmap',        label: 'Skill Roadmap',    icon: Map },
  { key: 'interview',      label: 'Q&A Prep',         icon: HelpCircle },
  { key: 'mock-interview', label: 'Mock Interview',   icon: Mic },
  { key: 'portfolio',      label: 'Portfolio',        icon: FolderSearch },
  { key: 'history',        label: 'History',          icon: Clock },
];

type Props = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onNewAnalysis?: () => void;
};

export function DashboardSidebar({ activeTab, onTabChange, onNewAnalysis }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* ── Logo ── */}
      <div className="px-5 pt-5 pb-6">
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)' }}
          >
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">HiredLens</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mt-0.5">
              AI Career Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                onTabChange(item.key);
                setMobileOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-white' : 'text-slate-500 group-hover:text-white')} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Footer nav ── */}
      <div className="px-3 pb-3 space-y-0.5 border-t border-slate-800 pt-3 mt-2">
        <button
          onClick={() => { onTabChange('settings'); setMobileOpen(false); }}
          className={cn(
            'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group',
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white',
          )}
        >
          <Settings className={cn('h-4 w-4 shrink-0', activeTab === 'settings' ? 'text-white' : 'text-slate-500 group-hover:text-white')} />
          Settings
        </button>
        <button
          onClick={() => { onTabChange('support'); setMobileOpen(false); }}
          className={cn(
            'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group',
            activeTab === 'support'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white',
          )}
        >
          <LifeBuoy className={cn('h-4 w-4 shrink-0', activeTab === 'support' ? 'text-white' : 'text-slate-500 group-hover:text-white')} />
          Support
        </button>
      </div>

      {/* ── New Analysis CTA ── */}
      <div className="px-4 pb-5 pt-2">
        <button
          onClick={() => {
            onNewAnalysis?.();
            setMobileOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'linear-gradient(90deg, #2563eb, #1d4ed8)' }}
        >
          <PlusCircle className="h-4 w-4" />
          New Analysis
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen((p) => !p)}
        className="fixed left-4 top-4 z-50 rounded-xl p-2.5 shadow-lg lg:hidden"
        style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.08)' }}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <Menu className="h-5 w-5 text-white" />
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-56 transition-transform duration-300 lg:static lg:translate-x-0 lg:h-screen',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{
          background: '#0f1623',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
