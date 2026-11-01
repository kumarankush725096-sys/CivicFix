import { Building2, UserCheck, Briefcase, LogOut } from 'lucide-react';

export default function Header({ role, onRoleChange, officerAuthed, onLogout }) {
  const tab = (id, label, Icon) => (
    <button
      onClick={() => onRoleChange(id)}
      aria-pressed={role === id}
      className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
        role === id ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" /> {label}
    </button>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        <a href="#top" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400">
            <Building2 className="h-5 w-5 text-slate-950" aria-hidden="true" />
          </span>
          <span className="text-xl font-black tracking-tight text-white">
            Civic<span className="text-emerald-400">Fix</span>
          </span>
        </a>

        <nav className="flex items-center gap-2" aria-label="Portal">
          <div className="flex gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1">
            {tab('citizen', 'Citizen', UserCheck)}
            {tab('officer', 'Officer', Briefcase)}
          </div>
          {officerAuthed && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:text-white"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
