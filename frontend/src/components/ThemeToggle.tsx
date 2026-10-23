'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme, Theme } from '../lib/theme-context';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'segmented';
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ variant = 'button', className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse ${className}`} />
    );
  }

  // Segmented control variant (ideal for settings page)
  if (variant === 'segmented') {
    const options: { id: Theme; label: string; icon: typeof Sun }[] = [
      { id: 'light', label: 'Light', icon: Sun },
      { id: 'dark', label: 'Dark', icon: Moon },
      { id: 'system', label: 'System', icon: Laptop },
    ];

    return (
      <div className={`inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 ${className}`}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? (opt.id === 'light' ? 'text-amber-500' : opt.id === 'dark' ? 'text-blue-400' : 'text-purple-400') : ''}`} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition cursor-pointer"
          title={`Theme: ${theme}`}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-blue-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span className="capitalize">{theme}</span>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-36 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={() => { setTheme('light'); setIsDropdownOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                theme === 'light' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </div>
              {theme === 'light' && <Check className="w-3.5 h-3.5 text-blue-600" />}
            </button>

            <button
              onClick={() => { setTheme('dark'); setIsDropdownOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                theme === 'dark' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>Dark</span>
              </div>
              {theme === 'dark' && <Check className="w-3.5 h-3.5 text-blue-600" />}
            </button>

            <button
              onClick={() => { setTheme('system'); setIsDropdownOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                theme === 'system' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Laptop className="w-3.5 h-3.5 text-purple-400" />
                <span>System</span>
              </div>
              {theme === 'system' && <Check className="w-3.5 h-3.5 text-blue-600" />}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Default quick action button: 1-click toggle with smooth icon animation
  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode (Current: ${theme})`}
      className={`relative inline-flex items-center justify-center gap-2 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/70 transition-all cursor-pointer group shadow-2xs hover:shadow-xs active:scale-95 ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform duration-200" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 group-hover:rotate-45 transition-transform duration-200" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-medium capitalize">
          {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
}
