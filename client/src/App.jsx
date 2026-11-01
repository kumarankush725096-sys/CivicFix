import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ReportForm from './components/ReportForm';
import TriageModal from './components/TriageModal';
import MyReports from './components/MyReports';
import Ledger from './components/Ledger';
import OfficerLogin from './components/OfficerLogin';
import OfficerDashboard from './components/OfficerDashboard';
import Toast from './components/Toast';
import { getReports, updateStatus, errorText } from './api';
import { printNotice } from './utils/printNotice';
import { safeGet, safeSet, safeRemove } from './utils/storage';

const PIN_KEY = 'civicfix:pin';
const MINE_KEY = 'civicfix:myReports';

function useNow(intervalMs = 60000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export default function App() {
  const [role, setRole] = useState('citizen');
  const [pin, setPin] = useState(() => safeGet(sessionStorage, PIN_KEY, ''));
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState('');
  const [myIds, setMyIds] = useState(() => {
    try { return JSON.parse(safeGet(localStorage, MINE_KEY, '[]')) || []; } catch { return []; }
  });
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);
  const now = useNow();

  const notify = useCallback((message, type = 'success') => setToast({ message, type }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const refresh = useCallback(async () => {
    try {
      setReports(await getReports());
      setFeedError('');
    } catch (err) {
      setFeedError(`Could not load reports. ${errorText(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const stats = useMemo(() => ({
    total: reports.length,
    urgent: reports.filter((r) => r.analysis?.priority === 'High' && r.status !== 'Resolved').length,
    resolved: reports.filter((r) => r.status === 'Resolved').length,
  }), [reports]);

  const myReports = useMemo(() => reports.filter((r) => myIds.includes(r.id)), [reports, myIds]);

  const handleSubmitted = (report) => {
    const next = [report.id, ...myIds.filter((id) => id !== report.id)].slice(0, 50);
    setMyIds(next);
    safeSet(localStorage, MINE_KEY, JSON.stringify(next));
    setResult(report);
    refresh();
  };

  const handlePrint = (report) => {
    if (!printNotice(report)) notify('Pop-up blocked. Allow pop-ups to print the notice.', 'error');
  };

  const handleLogin = (value) => {
    safeSet(sessionStorage, PIN_KEY, value);
    setPin(value);
    notify('Signed in as municipal officer.');
  };

  const handleLogout = () => {
    safeRemove(sessionStorage, PIN_KEY);
    setPin('');
    setRole('citizen');
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateStatus(id, status, pin);
      notify(`Docket #${id} marked ${status}.`);
      refresh();
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); notify('Session expired. Please sign in again.', 'error'); }
      else notify(errorText(err), 'error');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#060a12] font-sans text-slate-100">
      <Header role={role} onRoleChange={setRole} officerAuthed={Boolean(pin)} onLogout={handleLogout} />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-16 px-5 py-10">
        {role === 'citizen' ? (
          <>
            <Hero stats={stats} />
            <ReportForm onSubmitted={handleSubmitted} onToast={notify} />
            <MyReports reports={myReports} now={now} />
            <Ledger reports={reports} now={now} loading={loading} error={feedError} onRetry={refresh} />
          </>
        ) : pin ? (
          <OfficerDashboard reports={reports} now={now} onStatusChange={handleStatusChange} onPrint={handlePrint} />
        ) : (
          <OfficerLogin onSuccess={handleLogin} />
        )}
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-400">
        CivicFix: AI-assisted triage. Every report is reviewed by a municipal officer.
      </footer>

      <TriageModal report={result} now={now} onClose={() => setResult(null)} onPrint={handlePrint} />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
