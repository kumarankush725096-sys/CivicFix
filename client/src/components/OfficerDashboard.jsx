import { useMemo, useState } from 'react';
import { Building2, MapPin, Printer } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import SlaChip from './SlaChip';
import { CATEGORIES, OFFICER_STATUSES, PRIORITY_RANK } from '../constants';
import { getSla } from '../utils/sla';
import { reportImageUrl } from '../api';

function Stat({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className={`text-3xl font-black ${tone}`}>{value}</div>
      <div className="text-sm text-slate-300">{label}</div>
    </div>
  );
}

export default function OfficerDashboard({ reports, now, onStatusChange, onPrint }) {
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('open');

  const counts = useMemo(() => {
    const open = reports.filter((r) => r.status !== 'Resolved');
    return {
      open: open.length,
      overdue: open.filter((r) => getSla(r, now).state === 'overdue').length,
      urgent: open.filter((r) => r.analysis?.priority === 'High').length,
    };
  }, [reports, now]);

  // Work queue: unresolved first, then by priority, then nearest deadline.
  const queue = useMemo(() => {
    return reports
      .filter((r) => (category === 'all' ? true : r.analysis?.category === category))
      .filter((r) => (status === 'open' ? r.status !== 'Resolved' : status === 'all' ? true : r.status === status))
      .sort((a, b) => {
        const ra = a.status === 'Resolved' ? 1 : 0;
        const rb = b.status === 'Resolved' ? 1 : 0;
        if (ra !== rb) return ra - rb;
        const p = (PRIORITY_RANK[a.analysis?.priority] ?? 9) - (PRIORITY_RANK[b.analysis?.priority] ?? 9);
        if (p) return p;
        return (getSla(a).dueAt ?? Infinity) - (getSla(b).dueAt ?? Infinity);
      });
  }, [reports, category, status]);

  const select = 'rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-teal-400 focus:outline-none';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Officer dashboard</h1>
        <p className="mt-1 text-slate-300">Your work queue, sorted by urgency and deadline.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Open" value={counts.open} tone="text-white" />
        <Stat label="Urgent" value={counts.urgent} tone="text-rose-400" />
        <Stat label="Overdue" value={counts.overdue} tone="text-amber-400" />
      </div>

      <div className="flex flex-wrap gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className={select}>
          <option value="open">Open reports</option>
          <option value="all">All reports</option>
          {OFFICER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category" className={select}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {queue.length === 0 ? (
        <p className="py-12 text-center text-slate-400">Nothing in the queue.</p>
      ) : (
        <ul className="space-y-3">
          {queue.map((r) => (
            <li key={r.id} className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-5 lg:flex-row lg:items-center">
              {r.hasImage && <img src={reportImageUrl(r.id)} alt="" loading="lazy" className="h-20 w-full rounded-lg border border-slate-800 object-cover lg:w-28" />}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={r.analysis?.priority} />
                  <SlaChip report={r} now={now} />
                  <span className="font-mono text-xs text-slate-400">#{r.id}</span>
                </div>
                <h3 className="font-bold text-white">{r.title}</h3>
                <p className="flex items-center gap-1.5 text-sm text-slate-400"><MapPin className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="truncate">{r.location}</span></p>
                <p className="flex items-center gap-1.5 text-sm text-teal-300"><Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />{r.analysis?.assignedDepartment}</p>
                {r.analysis?.recommendedAction && <p className="text-sm text-slate-300">{r.analysis.recommendedAction}</p>}
              </div>
              <div className="flex shrink-0 gap-2 lg:flex-col">
                <select value={r.status === 'Submitted' ? 'In Review' : r.status} onChange={(e) => onStatusChange(r.id, e.target.value)}
                  aria-label={`Update status for docket ${r.id}`} className={select}>
                  {OFFICER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => onPrint(r)} className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-700">
                  <Printer className="h-4 w-4" aria-hidden="true" /> Notice
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
