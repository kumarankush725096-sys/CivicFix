import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  CheckCircle2,
  Send,
  MapPin,
  Clock,
  Filter,
  Layers,
  CheckCheck,
  ShieldAlert,
  FileText,
  Activity,
  Building2,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  Printer,
  Compass,
  UserCheck,
  Briefcase,
  HeartHandshake,
  X
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function App() {
  // Auth state: 'citizen' or 'official'
  const [userRole, setUserRole] = useState('citizen'); // 'citizen' | 'official'
  const [citizenInfo, setCitizenInfo] = useState({ name: 'Ankush Kumar', contact: '+91 98765 43210' });
  const [officialInfo, setOfficialInfo] = useState({ empId: 'EMP-DELHI-409', dept: 'Water Board' });

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Triage & feeds
  const [activeReport, setActiveReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  // Thank you modal
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [latestSubmittedReport, setLatestSubmittedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API_BASE}/reports`);
      if (res.data.success) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error('Failed to load reports feed:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Browser Geolocation for Live Location
  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('Aapke browser me Geolocation support nahi hai.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          location: `GPS: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E (Verified Live Geotag)`,
        }));
        setLocating(false);
      },
      (error) => {
        console.error('Location error:', error);
        alert('Live location fetch nahi ho saki. Kripya manually type karein.');
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('location', formData.location);
    payload.append('description', formData.description);
    payload.append('reportedBy', `${citizenInfo.name} (${citizenInfo.contact})`);
    if (imageFile) {
      payload.append('image', imageFile);
    }

    try {
      const res = await axios.post(`${API_BASE}/report`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setActiveReport(res.data.report);
        setLatestSubmittedReport(res.data.report);
        setShowThankYouModal(true);
        setFormData({ title: '', location: '', description: '' });
        setImageFile(null);
        setPreviewUrl(null);
        fetchReports();
      }
    } catch (err) {
      const errorText = err.response?.data?.error || err.message || 'Submission failed';
      setErrorMessage(typeof errorText === 'object' ? JSON.stringify(errorText) : errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, nextStatus) => {
    try {
      await axios.patch(`${API_BASE}/reports/${id}/status`, { status: nextStatus });
      fetchReports();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Print Notice Function
  const handlePrintNotice = (report) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CivicFix Municipal Notice - Docket #${report.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #111; }
            .header { border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; }
            .title { font-size: 20px; font-weight: 800; color: #064e3b; margin: 0; }
            .badge { padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #fee2e2; color: #991b1b; }
            .section { margin-bottom: 16px; }
            .label { font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: bold; }
            .value { font-size: 14px; margin-top: 2px; }
            .policy-box { background: #f0fdf4; border-left: 4px solid #059669; padding: 12px; margin-top: 15px; }
            .footer { margin-top: 30px; border-top: 1px dashed #ccc; padding-top: 15px; font-size: 11px; color: #666; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">OFFICIAL MUNICIPAL ACTION DIRECTIVE</div>
              <div style="font-size: 12px; color: #555;">Smart Municipal Governance Act | Autonomous AI Triage</div>
            </div>
            <div class="badge">${report.analysis?.priority || 'Normal'} Priority | SLA: ${report.analysis?.slaHours || 24}h</div>
          </div>
          <div class="section">
            <div class="label">Docket Reference</div>
            <div class="value"><strong>#${report.id}</strong> | <strong>Authority:</strong> ${report.analysis?.assignedDepartment}</div>
            <div class="value"><strong>Location:</strong> ${report.location}</div>
            <div class="value"><strong>Reported Date:</strong> ${new Date(report.createdAt).toLocaleString()}</div>
          </div>
          <div class="section">
            <div class="label">Incident Summary</div>
            <div class="value">${report.analysis?.summary}</div>
          </div>
          <div class="section">
            <div class="label">Field Team Directive</div>
            <div class="value">${report.analysis?.recommendedAction}</div>
          </div>
          <div class="policy-box">
            <div class="label" style="color: #065f46;">Statutory Standard / Civic Code</div>
            <div class="value" style="color: #064e3b; font-family: monospace;">${report.analysis?.applicablePolicy || 'Public Safety & Civic Charter'}</div>
          </div>
          <div class="footer">
            <div>Verified by CivicFix GovTech Intelligence</div>
            <div>Authorized Field Officer Signature: _______________________</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const totalReports = reports.length;
  const highPriorityCount = reports.filter((r) => r.analysis?.priority === 'High').length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;

  const filteredReports = reports.filter((r) => {
    if (userRole === 'official' && officialInfo.dept) {
      if (selectedFilter === 'MY_DEPT') {
        return r.analysis?.assignedDepartment?.toLowerCase().includes(officialInfo.dept.toLowerCase());
      }
    }
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'HIGH') return r.analysis?.priority === 'High';
    if (selectedFilter === 'RESOLVED') return r.status === 'Resolved';
    return (
      r.analysis?.category?.toLowerCase().includes(selectedFilter.toLowerCase()) ||
      r.analysis?.assignedDepartment?.toLowerCase().includes(selectedFilter.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col font-sans">
      {/* Top Header & Role Switcher */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Building2 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white">
                  Civic<span className="text-emerald-400">Fix</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-300 rounded border border-slate-700">
                  GovTech 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transparent Civic Grievance & Infrastructure Intelligence Portal
              </p>
            </div>
          </div>

          {/* Role Switching Tabs */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
            <button
              onClick={() => setUserRole('citizen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                userRole === 'citizen'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Citizen Portal
            </button>
            <button
              onClick={() => setUserRole('official')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                userRole === 'official'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> Municipal Officer
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        {/* User Identity Banner */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          {userRole === 'citizen' ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                {citizenInfo.name[0]}
              </div>
              <div>
                <span className="text-slate-400">Logged in as Citizen:</span>{' '}
                <strong className="text-white">{citizenInfo.name}</strong> ({citizenInfo.contact})
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                M
              </div>
              <div>
                <span className="text-slate-400">Official Desk:</span>{' '}
                <strong className="text-white">{officialInfo.empId}</strong> | Department:{' '}
                <span className="text-teal-400 font-semibold">{officialInfo.dept}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-slate-400">
            <span>Total Logged: <strong className="text-white">{totalReports}</strong></span>
            <span>Emergency: <strong className="text-rose-400">{highPriorityCount}</strong></span>
            <span>Resolved: <strong className="text-emerald-400">{resolvedCount}</strong></span>
          </div>
        </section>

        {/* Section 1: Grievance Lodging (Left) & AI Triage (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submission Form */}
          <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Lodge Citizen Grievance
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Civic Redressal Form</span>
            </div>

            {/* Fast Demo Chips */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                ⚡ Fast Demo Scenarios (One-Click Fill):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      title: 'Exposed live wiring sparking near school gate',
                      location: 'Gate 2, Model Town Public School',
                      description: 'Snapped high-voltage utility cable dangling 4 feet above pedestrian sidewalk.',
                    })
                  }
                  className="text-[11px] px-2.5 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition"
                >
                  🚨 Live Wire (High)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      title: 'Burst water main line flooding street',
                      location: 'Market Cross Road, Ward 5',
                      description: 'Heavy potable water flooding road and creating 2ft ditch.',
                    })
                  }
                  className="text-[11px] px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition"
                >
                  💧 Water Leak (Medium)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      title: 'Single residential streetlight flickering',
                      location: 'Lane 4, Sector 7',
                      description: 'Bulb flickers intermittently late night. Other 4 lights functional.',
                    })
                  }
                  className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  💡 Flickering Lamp (Low)
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Issue Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Deep road pothole causing traffic jam"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Dual Location: Live GPS + Manual Type */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Location Details
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLiveLocation}
                    disabled={locating}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md transition"
                  >
                    <Compass className={`w-3 h-3 ${locating ? 'animate-spin' : ''}`} />
                    {locating ? 'Detecting...' : '📍 Auto-Detect Live GPS'}
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter street, colony or click Auto-Detect"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Description & Hazards
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe severity, hazards, or timeline..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Upload Ground Photo (Evidence)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer bg-slate-950/60 transition">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-300">
                      {imageFile ? imageFile.name : 'Attach photo for visual verification'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  {previewUrl && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex-shrink-0">
                      <img src={previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="font-mono break-all">{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    AI Triage & Policy Verification in Progress...
                  </>
                ) : (
                  <>
                    Submit Grievance <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </section>

          {/* AI Forensic Triage Output & Notice Printer */}
          <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Autonomous Triage & Compliance Verdict
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Gemini 3.8 Flash</span>
              </div>

              {activeReport ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-xs text-slate-400 font-mono">Docket #{activeReport.id}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{activeReport.title}</h4>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        activeReport.analysis?.priority === 'High'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : activeReport.analysis?.priority === 'Medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {activeReport.analysis?.priority} Urgency
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Assigned Authority
                      </span>
                      <span className="text-emerald-400 font-bold block mt-0.5">
                        {activeReport.analysis?.assignedDepartment}
                      </span>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Mandated SLA Timeframe
                      </span>
                      <span className="text-teal-300 font-bold block mt-0.5">
                        {activeReport.analysis?.slaHours || 24} Hours
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-xl space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Technical Summary
                      </span>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">
                        {activeReport.analysis?.summary}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Procedural Action Directive
                      </span>
                      <p className="text-emerald-300 mt-0.5 font-medium leading-relaxed">
                        {activeReport.analysis?.recommendedAction}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Statutory Policy / Bylaw
                        </span>
                        <span className="text-slate-300 font-mono text-[11px] block mt-0.5">
                          {activeReport.analysis?.applicablePolicy || 'Municipal Service Standard'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Credibility
                        </span>
                        <span className="text-emerald-400 font-bold text-xs">
                          {activeReport.analysis?.credibilityScore || 96}% Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Print Notice Action */}
                  <button
                    onClick={() => handlePrintNotice(activeReport)}
                    className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition"
                  >
                    <Printer className="w-4 h-4 text-emerald-400" />
                    Export Official Municipal Dispatch Order (PDF)
                  </button>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-8 text-slate-500">
                  <ShieldAlert className="w-10 h-10 mb-3 stroke-[1.5] text-slate-600" />
                  <p className="text-sm font-medium text-slate-400">No active triage evaluation.</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Fill the form or click a demo scenario to see live autonomous routing.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Section 2: Public Civic Ledger & Transparency Feed */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                Public Civic Ledger & Resolution Accountability
              </h3>
              <p className="text-xs text-slate-400">
                Transparent live register of citizen reports, enforcement deadlines, and resolution statuses
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
              {userRole === 'official' && (
                <button
                  onClick={() => setSelectedFilter('MY_DEPT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedFilter === 'MY_DEPT'
                      ? 'bg-teal-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 text-teal-300 border border-teal-500/30 hover:bg-slate-700'
                  }`}
                >
                  🏢 My Department ({officialInfo.dept})
                </button>
              )}
              {['ALL', 'HIGH', 'Water', 'Pollution', 'Road', 'RESOLVED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedFilter === filter
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No civic records matching criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredReports.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-mono text-slate-500">Docket #{item.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.analysis?.priority === 'High'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {item.analysis?.priority || 'Normal'} Urgency
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-600" /> {item.location}
                    </p>

                    {item.imageUrl && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-slate-800 h-32 w-full bg-slate-900">
                        <img src={item.imageUrl} alt="Hazard evidence" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-900 space-y-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Authority:</span>
                        <span className="text-emerald-400 font-semibold">{item.analysis?.assignedDepartment}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Policy Standard:</span>
                        <span className="text-slate-400 font-mono text-[10px]">{item.analysis?.applicablePolicy}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs">
                    <span
                      className={`font-semibold text-[11px] flex items-center gap-1.5 ${
                        item.status === 'Resolved' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {item.status || 'Under Investigation'}
                    </span>
                    {item.status !== 'Resolved' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'Resolved')}
                        className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 px-2.5 py-1 rounded-md text-slate-300 font-semibold transition"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Close Docket
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Formal Citizen Thank You & Appreciation Modal */}
      {showThankYouModal && latestSubmittedReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowThankYouModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <HeartHandshake className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">
                Dhanyawad Jagruk Nagrik! 🙏
              </h3>
              <p className="text-xs text-emerald-400 font-medium">
                Aapka yogdan ek surakshit aur swachh shahar banane me anmol hai.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Grievance Reference:</span>
                <strong className="text-white font-mono">Docket #{latestSubmittedReport.id}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Assigned Authority:</span>
                <strong className="text-emerald-400">{latestSubmittedReport.analysis?.assignedDepartment}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Target SLA:</span>
                <strong className="text-teal-300">{latestSubmittedReport.analysis?.slaHours} Hours</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Aapki report autonomous AI triage dwara verify karke sambandhit vibhag ke field dispatch team ko bhej di gayi hai. Aap is docket ki status live ledger me track kar sakte hain.
            </p>

            <button
              onClick={() => setShowThankYouModal(false)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition"
            >
              Theek Hai, Live Status Dekhein
            </button>
          </div>
        </div>
      )}
    </div>
  );
}