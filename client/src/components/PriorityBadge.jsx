import { PRIORITY_STYLES } from '../constants';

export default function PriorityBadge({ priority }) {
  const cls = PRIORITY_STYLES[priority] || 'bg-slate-700/40 text-slate-300 border-slate-600';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {priority ? `${priority} priority` : 'Unrated'}
    </span>
  );
}
