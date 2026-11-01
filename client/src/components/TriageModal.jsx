import { useEffect } from 'react';
import { Printer, Sparkles, X } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import SlaChip from './SlaChip';
import StatusTracker from './StatusTracker';

function Cell({ label, children }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-sm text-slate-100">{children}</div>
    </div>
  );
}

export default function TriageModal({ report, now, onClose, onPrint }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!report) return null;
  const a = report.analysis || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="triage-title" onClick={(e) => e.stopPropagation()}
        className="relative my-6 w-full max-w-xl space-y-5 rounded-3xl border border-emerald-500/30 bg-slate-900 p-6 shadow-2xl">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>

        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <Sparkles className="h-4 w-4" aria-hidden="true" /> Report received. Thank you / धन्यवाद
          </p>
          <h2 id="triage-title" className="mt-1 pr-8 text-xl font-bold text-white">{report.title}</h2>
          <p className="mt-0.5 font-mono text-sm text-slate-400">Docket #{report.id}</p>
          <div className="mt-3 flex flex-wrap gap-2"><PriorityBadge priority={a.priority} /><SlaChip report={report} now={now} /></div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Cell label="Assigned to"><span className="font-semibold text-emerald-300">{a.assignedDepartment || 'Pending'}</span></Cell>
          <Cell label="Resolution target">{a.slaHours ? `${a.slaHours} hours` : 'Not set'}</Cell>
        </div>
        <Cell label="AI summary">{a.summary || 'No summary available.'}</Cell>
        <Cell label="Recommended action">{a.recommendedAction || 'No action recorded.'}</Cell>
        <div className="grid gap-3 sm:grid-cols-2">
          <Cell label="Applicable rule"><span className="font-mono text-xs">{a.applicablePolicy || 'Not specified'}</span></Cell>
          <Cell label="AI confidence">{a.credibilityScore != null ? `${a.credibilityScore}%` : 'N/A'}</Cell>
        </div>

        <div className="pt-1"><StatusTracker status={report.status} /></div>
        <p className="text-sm text-slate-400">AI triage is advisory. A municipal officer reviews every report. Track this docket in “My reports” below.</p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={() => onPrint(report)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-700">
            <Printer className="h-4 w-4" aria-hidden="true" /> Print / Save as PDF
          </button>
          <button onClick={onClose} className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400">Done</button>
        </div>
      </div>
    </div>
  );
}
