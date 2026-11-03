import { useCallback, useEffect, useState } from 'react';
import { api, downloadAndDelete, TemperatureStats } from '../api';
import { Sparkline } from '../components/charts';
import { Loading, Modal, PageHeader, showError } from '../components/ui';

const fmtDate = (ms: number | null) => (ms === null ? '–' : new Date(ms).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }));
const fmtTime = (ms: number | null) => (ms === null ? '' : new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

export default function Temperature() {
  const [stats, setStats] = useState<TemperatureStats | null>(null);
  const [recent, setRecent] = useState<{ date: number; value: number }[]>([]);
  const [reportEmail, setReportEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmMail, setConfirmMail] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [st, se, re] = await Promise.all([api.temperatureStats(), api.settings(), api.temperatureRecent()]);
    if (st.error) return showError(st.error.message);
    setStats(st.data);
    if (se.data) setReportEmail(se.data.reportEmail);
    if (re.data) setRecent(re.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!stats) return <Loading />;

  return (
    <>
      <PageHeader
        title="Temperature log"
        lead="Readings are stored every minute and removed once they were downloaded or mailed, so storage never fills up."
      />

      <div className="row g-3 mt-2">
        {[
          { label: 'Stored readings', value: stats.count.toLocaleString(), sub: stats.count ? `≈ ${(stats.count / 1440).toFixed(1)} days` : '' },
          { label: 'Oldest', value: fmtDate(stats.first), sub: fmtTime(stats.first) },
          { label: 'Newest', value: fmtDate(stats.last), sub: fmtTime(stats.last) },
        ].map((s, i) => (
          <div key={s.label} className="col-12 col-md-4">
            <div className="hp-card hp-card-pad h-100 rise" style={{ ['--i' as string]: i }}>
              <div className="eyebrow">{s.label}</div>
              <div className="stat-value mt-1">{s.value}</div>
              <div className="mono small text-body-secondary">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <section className="hp-card hp-card-pad mt-3 rise" style={{ ['--i' as string]: 3 }}>
        <span className="eyebrow">Last 24 hours</span>
        <div className="mt-2">
          <Sparkline points={recent} />
        </div>
      </section>

      <section className="hp-card hp-card-pad mt-3 rise" style={{ ['--i' as string]: 4 }}>
        <h2 className="h4">Export</h2>
        <p className="text-body-secondary small">
          The previous month is mailed automatically on the 1st to <b>{reportEmail}</b>. You can also export everything now; exported readings are removed from
          the HeatingPi.
        </p>
        <div className="d-flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-primary px-4"
            disabled={busy || stats.count === 0}
            onClick={async () => {
              setBusy(true);
              const { data, error } = await downloadAndDelete();
              setBusy(false);
              if (error) showError(error.message);
              else setLastResult(`Downloaded ${data.count} readings; they were removed from the HeatingPi.`);
              load();
            }}
          >
            Download CSV
          </button>
          <button type="button" className="btn btn-outline-primary px-4" disabled={busy || stats.count === 0} onClick={() => setConfirmMail(true)}>
            Send by e-mail now
          </button>
        </div>
        {lastResult && <div className="alert alert-success mt-3 mb-0 py-2">{lastResult}</div>}
      </section>

      {confirmMail && (
        <Modal
          title="Send temperature log"
          submitLabel="Send"
          busy={busy}
          onClose={() => setConfirmMail(false)}
          onSubmit={async () => {
            setBusy(true);
            const { data, error } = await api.mailNow();
            setBusy(false);
            setConfirmMail(false);
            if (error) showError(error.message);
            else setLastResult(`Sent ${data.count} readings to ${data.to}; they were removed from the HeatingPi.`);
            load();
          }}
        >
          All {stats.count} readings will be sent to <b>{reportEmail}</b> and then removed from the HeatingPi.
        </Modal>
      )}
    </>
  );
}
