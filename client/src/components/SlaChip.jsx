import { Clock } from 'lucide-react';
import { getSla } from '../utils/sla';

const TONE = {
  ok: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  soon: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  overdue: 'text-rose-300 bg-rose-500/10 border-rose-500/40',
  closed: 'text-slate-300 bg-slate-700/40 border-slate-600',
  unknown: 'text-slate-400 bg-slate-800 border-slate-700',
};

export default function SlaChip({ report, now }) {
  const sla = getSla(report, now);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE[sla.state]}`}>
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      {sla.label}
    </span>
  );
}
