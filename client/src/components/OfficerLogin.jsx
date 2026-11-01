import { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { officerLogin, errorText } from '../api';

export default function OfficerLogin({ onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await officerLogin(pin);
      onSuccess(pin);
    } catch (err) {
      setError(err.response?.status === 401 ? 'Incorrect access PIN.' : errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto mt-10 w-full max-w-sm space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300"><Lock className="h-5 w-5" aria-hidden="true" /></span>
        <div>
          <h2 className="text-xl font-bold text-white">Officer sign-in</h2>
          <p className="text-sm text-slate-300">Enter the department access PIN.</p>
        </div>
      </div>
      <div>
        <label htmlFor="pin" className="mb-1.5 block text-sm font-semibold text-slate-200">Access PIN</label>
        <input id="pin" type="password" autoComplete="off" required value={pin} onChange={(e) => setPin(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-teal-400 focus:outline-none" />
      </div>
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 py-3 font-bold text-slate-950 hover:bg-teal-400 disabled:opacity-50">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
      </button>
    </form>
  );
}
