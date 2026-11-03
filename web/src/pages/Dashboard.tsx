import { useEffect, useState } from 'react';
import { api, Dashboard as DashboardData } from '../api';
import { Gauge, Sparkline } from '../components/charts';
import { Led, Loading } from '../components/ui';

const POLL_MS = 10000;
const CHART_POLL_MS = 5 * 60 * 1000;

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recent, setRecent] = useState<{ date: number; value: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    let stopped = false;
    let lastChart = 0;
    const load = async () => {
      // Skip polling while the tab is hidden: saves Pi CPU when a phone leaves the page open.
      if (document.visibilityState === 'visible') {
        const res = await api.dashboard();
        if (stopped) return;
        if (res.error) setError(res.error.message);
        else {
          setData(res.data);
          setError(null);
        }
        if (Date.now() - lastChart > CHART_POLL_MS) {
          lastChart = Date.now();
          const r = await api.temperatureRecent();
          if (!stopped && r.data) setRecent(r.data);
        }
      }
      timer = window.setTimeout(load, POLL_MS);
    };
    load();
    const onVisible = () => document.visibilityState === 'visible' && (window.clearTimeout(timer), load());
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  if (!data) return error ? <div className="alert alert-danger mt-4">{error}</div> : <Loading />;

  const running = data.activeSchemas.find((s) => s.running);
  const onCount = data.pins.filter((p) => p.active).length;

  return (
    <>
      {error && <div className="alert alert-warning mt-3 py-2">Connection problem: {error}</div>}

      <div className="row g-3 mt-2 mt-md-4">
        <div className="col-12 col-lg-5">
          <section className="hp-card hp-card-pad h-100 rise" style={{ ['--i' as string]: 0 }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="eyebrow">Room temperature</span>
              {data.simulated && <span className="chip">simulated</span>}
            </div>
            <Gauge value={data.temperature} range={running ? { min: running.min, max: running.max } : undefined}>
              <div className="gauge-value">
                {data.temperature === null ? '–' : data.temperature.toFixed(1)}
                <span className="gauge-unit">°C</span>
              </div>
              <div className="small text-body-secondary mt-1">{running ? `${running.min}° – ${running.max}° band` : 'pin defaults'}</div>
            </Gauge>
            {data.sensorError && (
              <div className="alert alert-danger py-2 mt-3 mb-0">Sensor error: {data.sensorError}. Pins use their default state.</div>
            )}
          </section>
        </div>

        <div className="col-12 col-lg-7 d-flex flex-column gap-3">
          <section className="hp-card hp-card-pad rise" style={{ ['--i' as string]: 1 }}>
            <span className="eyebrow">Now running</span>
            <div className="d-flex align-items-center gap-3 mt-2">
              <Led on={!!running} tone="ember" title={running ? 'running' : 'nothing running'} />
              <div className="min-w-0">
                <div className="h3 m-0 text-truncate">{running ? running.name : 'No schema in range'}</div>
                <div className="text-body-secondary small">
                  {running ? `Active between ${running.min} and ${running.max} °C` : 'All pins follow their default state.'}
                </div>
              </div>
            </div>
            {data.activeSchemas.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mt-3">
                {data.activeSchemas.map((s) => (
                  <span key={s.id} className={`chip${s.running ? ' chip-running' : ''}`} title={s.running ? 'running' : 'active, temperature not in range'}>
                    <Led on tone={s.running ? 'ember' : 'amber'} />
                    {s.name}
                  </span>
                ))}
              </div>
            )}
            {data.activeSchemas.length === 0 && <p className="text-body-secondary mt-3 mb-0">No active schemas found.</p>}
          </section>

          <section className="hp-card hp-card-pad rise flex-grow-1" style={{ ['--i' as string]: 2 }}>
            <span className="eyebrow">Last 24 hours</span>
            <div className="mt-2">
              <Sparkline points={recent} />
            </div>
          </section>
        </div>
      </div>

      <section className="mt-4 rise" style={{ ['--i' as string]: 3 }}>
        <div className="d-flex align-items-baseline justify-content-between mb-2">
          <h2 className="h4 m-0">Relays</h2>
          <span className="eyebrow">
            {onCount} of {data.pins.length} on
          </span>
        </div>
        <div className="relay-grid">
          {data.pins.map((p) => (
            <div key={p.id} className={`relay${p.active ? ' is-on' : ''}`}>
              <Led on={p.active} title={p.active ? 'on' : 'off'} />
              <div className="min-w-0">
                <div className="relay-name">{p.name}</div>
                <div className="relay-state">{p.active ? 'on' : 'off'}</div>
              </div>
              <span className="relay-no">{String(p.id).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
