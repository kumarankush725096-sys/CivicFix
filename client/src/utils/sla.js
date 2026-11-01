const H = 3600000;

export function getSla(report, now = Date.now()) {
  if (report.status === 'Resolved') return { state: 'closed', label: 'Closed', dueAt: null };
  const hours = report.analysis?.slaHours;
  if (!hours) return { state: 'unknown', label: 'SLA not set', dueAt: null };

  const dueAt = new Date(report.createdAt).getTime() + hours * H;
  const diff = dueAt - now;
  const abs = Math.abs(diff);
  const h = Math.floor(abs / H);
  const m = Math.floor((abs % H) / 60000);
  const text = h >= 48 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h ${m}m`;

  if (diff < 0) return { state: 'overdue', label: `Overdue ${text}`, dueAt };
  return { state: diff < 6 * H ? 'soon' : 'ok', label: `Due in ${text}`, dueAt };
}
