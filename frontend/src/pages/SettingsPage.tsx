import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme()
  return <div className="mx-auto max-w-3xl space-y-6"><div><p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Workspace</p><h1 className="mt-1 text-3xl font-semibold text-slate-950">Settings</h1><p className="mt-2 text-sm text-slate-500">Personalize the workspace on this device.</p></div><section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between gap-4 p-6"><div><h2 className="font-semibold text-slate-900">Appearance</h2><p className="mt-1 text-sm text-slate-500">Choose the visual mode for your operations workspace.</p></div><button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-cyan-600 hover:text-cyan-700">{theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}{theme === 'light' ? 'Dark mode' : 'Light mode'}</button></div><div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-500">Preference is saved automatically in this browser.</div></section></div>
}
