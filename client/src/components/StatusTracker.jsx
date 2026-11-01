import { STATUS_FLOW } from '../constants';

export default function StatusTracker({ status }) {
  const current = Math.max(0, STATUS_FLOW.indexOf(status));
  return (
    <ol className="flex items-center" aria-label={`Status: ${status}`}>
      {STATUS_FLOW.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`h-3 w-3 rounded-full border-2 ${
                  done ? 'border-emerald-400 bg-emerald-400' : 'border-slate-600 bg-transparent'
                }`}
              />
              <span className={`text-[11px] leading-none ${i === current ? 'font-semibold text-white' : 'text-slate-400'}`}>
                {step}
              </span>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <span className={`mx-1 mb-4 h-0.5 flex-1 ${i < current ? 'bg-emerald-400' : 'bg-slate-700'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
