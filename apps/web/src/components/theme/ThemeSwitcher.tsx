import { useEffect, useState } from 'react';
import { Laptop, Moon, Palette, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

type ThemeMode = 'light' | 'dark' | 'system';

const THEME_KEY = 'hiredlens-theme';

function resolveTheme(mode: ThemeMode) {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

export function ThemeSwitcher() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    const activeTheme = resolveTheme(mode);
    root.classList.toggle('dark', activeTheme === 'dark');
    root.dataset.themeMode = activeTheme;
    localStorage.setItem(THEME_KEY, mode);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      document.documentElement.classList.toggle('dark', media.matches);
      document.documentElement.dataset.themeMode = media.matches ? 'dark' : 'light';
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [mode]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full border-slate-300 bg-white/90 dark:border-slate-700 dark:bg-slate-900/80">
          <Palette className="h-4 w-4" />
          Theme
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Professional Skin</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setMode('light')}>
          <Sun className="h-4 w-4" />
          Light
          {mode === 'light' ? <span className="ml-auto text-xs text-sky-600">Active</span> : null}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode('dark')}>
          <Moon className="h-4 w-4" />
          Dark
          {mode === 'dark' ? <span className="ml-auto text-xs text-sky-600">Active</span> : null}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode('system')}>
          <Laptop className="h-4 w-4" />
          System
          {mode === 'system' ? <span className="ml-auto text-xs text-sky-600">Active</span> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
