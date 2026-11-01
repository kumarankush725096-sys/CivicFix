import { useMemo, useState } from 'react';
import { Layers, Search } from 'lucide-react';
import ReportCard from './ReportCard';
import { CATEGORIES, PRIORITY_RANK } from '../constants';
import { getSla } from '../utils/sla';

const FILTERS = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'urgent', label: 'Urgent', test: (r) => r.analysis?.priority === 'High' && r.status !== 'Resolved' },
  { id: 'water', label: 'Water', test: (r) => r.analysis?.category === CATEGORIES[2] },
  { id: 'roads', label: 'Roads', test: (r) => r.analysis?.category === CATEGORIES[0] },
  { id: 'sanitation', label: 'Sanitation', test: (r) => r.analysis?.category === CATEGORIES[1] },
  { id: 'electricity', label: 'Electricity', test: (r) => r.analysis?.category === CATEGORIES[3] },
  { id: 'pollution', label: 'Pollution', test: (r) => r.analysis?.category === CATEGORIES[4] },
  { id: 'resolved', label: 'Resolved', test: (r) => r.status === 'Resolved' },
];

const SORTS = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  priority: (a, b) => (PRIORITY_RANK[a.analysis?.priority] ?? 9) - (PRIORITY_RANK[b.analysis?.priority] ?? 9),
  deadline: (a, b) => (getSla(a).dueAt ?? Infinity) - (getSla(b).dueAt ?? Infinity),
};

export default function Ledger({ reports, now, loading, error, onRetry }) {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [q, setQ] = useState('');

  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter) || FILTERS[0];
    const term = q.trim().toLowerCase();
    return reports
      .filter(f.test)
      .filter((r) => !term || [r.title, r.location, r.description, r.analysis?.assignedDepartment].some((v) => v?.toLowerCase().includes(term)))
      .sort(SORTS[sort]);
  }, [reports, filter, sort, q]);

  return (
    <section id="ledger" className="scroll-mt-24 space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-white"><Layers className="h-6 w-6 text-emerald-400" aria-hidden="true" /> Public ledger</h2>
        <p className="mt-1 text-slate-300">Every report, its deadline and its status, visible to everyone.</p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter reports">
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)} aria-pressed={filter === f.id}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${filter === f.id ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reports" aria-label="Search reports"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort reports"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none">
            <option value="newest">Newest</option>
            <option value="priority">Highest priority</option>
            <option value="deadline">Nearest deadline</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-slate-400">Loading reports…</p>
      ) : error ? (
        <div className="py-12 text-center">
          <p className="text-rose-300">{error}</p>
          <button onClick={onRetry} className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Try again</button>
        </div>
      ) : visible.length === 0 ? (
        <p className="py-12 text-center text-slate-400">No reports match these filters.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => <ReportCard key={r.id} report={r} now={now} />)}
        </div>
      )}
    </section>
  );
}
