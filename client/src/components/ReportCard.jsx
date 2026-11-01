import { MapPin, Building2 } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import SlaChip from './SlaChip';
import StatusTracker from './StatusTracker';
import { reportImageUrl } from '../api';

export default function ReportCard({ report, now }) {
  const a = report.analysis || {};
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-5 transition hover:border-slate-600">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PriorityBadge priority={a.priority} />
        <SlaChip report={report} now={now} />
      </div>

      <div>
        <h3 className="line-clamp-2 text-base font-bold text-white">{report.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-300">{report.description}</p>
        <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-400"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span className="line-clamp-1">{report.location}</span></p>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-emerald-300"><Building2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span className="line-clamp-1">{a.assignedDepartment || 'Awaiting assignment'}</span></p>
      </div>

      {report.hasImage && (
        <img src={reportImageUrl(report.id)} alt={`Evidence for ${report.title}`} loading="lazy" className="h-32 w-full rounded-lg border border-slate-800 object-cover" />
      )}

      <div className="mt-auto space-y-2 border-t border-slate-800 pt-4">
        <StatusTracker status={report.status} />
        <p className="text-xs text-slate-400">Docket #{report.id} · {new Date(report.createdAt).toLocaleDateString()}</p>
      </div>
    </article>
  );
}
