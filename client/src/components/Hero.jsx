import { ArrowDown, Camera, Sparkles, Send, CheckCheck } from 'lucide-react';

const STEPS = [
  { icon: Camera, title: 'Report', text: 'Describe the issue, add a photo and location.' },
  { icon: Sparkles, title: 'AI triage', text: 'Priority, department and deadline set instantly.' },
  { icon: Send, title: 'Dispatch', text: 'Routed to the right municipal team.' },
  { icon: CheckCheck, title: 'Resolve', text: 'Track progress on the public ledger.' },
];

function Stat({ value, label, tone }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4 text-center">
      <div className={`text-3xl font-black ${tone}`}>{value}</div>
      <div className="mt-1 text-sm text-slate-300">{label}</div>
    </div>
  );
}

export default function Hero({ stats }) {
  return (
    <section id="top" className="space-y-10">
      <div className="mx-auto max-w-3xl pt-6 text-center">
        <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
          See a problem in your city? <span className="text-emerald-400">Fix it with one report.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          CivicFix uses AI to triage every complaint, assign the right department and set a resolution deadline you can
          track in public.
        </p>
        <a
          href="#report"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-base font-bold text-slate-950 transition hover:bg-emerald-400"
        >
          Report an issue <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <div className="mx-auto grid max-w-2xl grid-cols-3 gap-3">
        <Stat value={stats.total} label="Reports" tone="text-white" />
        <Stat value={stats.urgent} label="Urgent open" tone="text-rose-400" />
        <Stat value={stats.resolved} label="Resolved" tone="text-emerald-400" />
      </div>

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-slate-400">Step {i + 1}</span>
            </div>
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="mt-1 text-sm text-slate-300">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
