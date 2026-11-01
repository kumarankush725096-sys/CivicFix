import { useEffect, useState } from 'react';
import { AlertCircle, Compass, Image as ImageIcon, Loader2, MapPin, Send } from 'lucide-react';
import { submitReport, errorText } from '../api';

const STEPS = ['Uploading your report', 'AI is reading the details and photo', 'Routing to the right department'];
const MAX_IMAGE_MB = 5;

// Neutral labels on purpose: don't reveal the priority the AI is supposed to decide.
const DEMOS = [
  { label: 'Sample: exposed wire', title: 'Exposed live wiring sparking near school gate', location: 'Gate 2, Model Town Public School', description: 'Snapped high-voltage cable dangling about 4 feet above the pedestrian sidewalk.' },
  { label: 'Sample: water leak', title: 'Burst water main flooding street', location: 'Market Cross Road, Ward 5', description: 'Potable water flooding the road and creating a 2 ft ditch.' },
  { label: 'Sample: flickering lamp', title: 'Single residential streetlight flickering', location: 'Lane 4, Sector 7', description: 'Bulb flickers at night. The other 4 lights on the lane work fine.' },
];

const field = 'w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none';
const label = 'mb-1.5 block text-sm font-semibold text-slate-200';

export default function ReportForm({ onSubmitted, onToast }) {
  const [form, setForm] = useState({ title: '', location: '', description: '', reporterName: '', reporterContact: '' });
  const [coords, setCoords] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const showDemos = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('demo');

  useEffect(() => {
    if (!loading) { setStep(0); return; }
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 2500);
    return () => clearInterval(t);
  }, [loading]);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return onToast('Please choose a JPG, PNG or WebP image.', 'error');
    if (f.size > MAX_IMAGE_MB * 1024 * 1024) return onToast(`Image must be under ${MAX_IMAGE_MB} MB.`, 'error');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return onToast('Your browser does not support location detection.', 'error');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: c }) => {
        const { latitude: lat, longitude: lng } = c;
        setCoords({ lat, lng });
        let text = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
          if (r.ok) {
            const j = await r.json();
            if (j.display_name) text = j.display_name;
          }
        } catch { /* fall back to raw coordinates */ }
        setForm((f) => ({ ...f, location: text }));
        setLocating(false);
      },
      () => {
        onToast('Could not get your location. Please type it instead.', 'error');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => body.append(k, v));
    if (coords) { body.append('lat', coords.lat); body.append('lng', coords.lng); }
    if (file) body.append('image', file);
    try {
      const report = await submitReport(body);
      setForm({ title: '', location: '', description: '', reporterName: '', reporterContact: '' });
      setCoords(null); setFile(null); setPreview(null);
      onSubmitted(report);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="report" className="mx-auto w-full max-w-2xl scroll-mt-24 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl sm:p-8">
      <h2 className="text-2xl font-bold text-white">Report a civic issue</h2>
      <p className="mt-1 text-slate-300">Takes about a minute. A photo helps the AI judge severity.</p>

      {showDemos && (
        <div className="mt-4 flex flex-wrap gap-2">
          {DEMOS.map(({ label: l, ...d }) => (
            <button key={l} type="button" onClick={() => setForm((f) => ({ ...f, ...d }))}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700">{l}</button>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="title" className={label}>What is the problem?</label>
          <input id="title" name="title" required maxLength={120} value={form.title} onChange={set}
            placeholder="e.g. Deep pothole on main road" className={field} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label htmlFor="location" className="text-sm font-semibold text-slate-200">Where is it?</label>
            <button type="button" onClick={detectLocation} disabled={locating}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-sm text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-60">
              <Compass className={`h-4 w-4 ${locating ? 'animate-spin' : ''}`} aria-hidden="true" />
              {locating ? 'Detecting…' : 'Use my location'}
            </button>
          </div>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" aria-hidden="true" />
            <input id="location" name="location" required maxLength={250} value={form.location} onChange={set}
              placeholder="Street, colony or landmark" className={`${field} pl-11`} />
          </div>
        </div>

        <div>
          <label htmlFor="description" className={label}>Describe it</label>
          <textarea id="description" name="description" required rows={4} maxLength={1500} value={form.description} onChange={set}
            placeholder="How severe is it? Is anyone at risk? How long has it been there?" className={field} />
        </div>

        <div>
          <span className={label}>Photo (optional)</span>
          <div className="flex items-center gap-3">
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300 hover:border-emerald-500/60">
              <ImageIcon className="h-5 w-5" aria-hidden="true" />
              <span className="truncate">{file ? file.name : 'Attach a photo (max 5 MB)'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="sr-only" />
            </label>
            {preview && <img src={preview} alt="Selected evidence preview" className="h-14 w-14 shrink-0 rounded-lg border border-slate-700 object-cover" />}
          </div>
        </div>

        <details className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-200">Your contact (optional, for updates)</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input name="reporterName" maxLength={80} value={form.reporterName} onChange={set} placeholder="Name" aria-label="Your name" className={field} />
            <input name="reporterContact" maxLength={80} value={form.reporterContact} onChange={set} placeholder="Phone or email" aria-label="Phone or email" className={field} />
          </div>
        </details>

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <ol className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm" aria-live="polite">
            {STEPS.map((s, i) => (
              <li key={s} className={`flex items-center gap-2 ${i <= step ? 'text-white' : 'text-slate-500'}`}>
                {i < step ? <span className="text-emerald-400">✓</span> : i === step ? <Loader2 className="h-4 w-4 animate-spin text-emerald-400" /> : <span className="w-4" />}
                {s}
              </li>
            ))}
          </ol>
        )}

        <button type="submit" disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-base font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50">
          {loading ? 'Analyzing…' : <>Submit report <Send className="h-4 w-4" aria-hidden="true" /></>}
        </button>
      </form>
    </section>
  );
}
