import ReportCard from './ReportCard';

export default function MyReports({ reports, now }) {
  if (!reports.length) return null;
  return (
    <section id="mine" className="scroll-mt-24 space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">My reports</h2>
        <p className="mt-1 text-slate-300">Reports you submitted from this device.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => <ReportCard key={r.id} report={r} now={now} />)}
      </div>
    </section>
  );
}
