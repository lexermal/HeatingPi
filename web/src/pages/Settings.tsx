import { useCallback, useEffect, useState } from 'react';
import { api, Pin, Settings } from '../api';
import { EditableLabel, Loading, PageHeader, Switch, showError } from '../components/ui';

export default function SettingsPage() {
  const [pins, setPins] = useState<Pin[] | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [email, setEmail] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);

  const load = useCallback(async () => {
    const [p, s] = await Promise.all([api.pins(), api.settings()]);
    if (p.error) return showError(p.error.message);
    if (s.error) return showError(s.error.message);
    setPins(p.data);
    setSettings(s.data);
    setEmail(s.data.reportEmail);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!pins || !settings) return <Loading />;

  const updatePin = async (pin: Pin, patch: Partial<Pick<Pin, 'name' | 'activeByDefault'>>) => {
    const { data, error } = await api.updatePin(pin.id, patch);
    if (error) return showError(error.message);
    setPins((list) => list && list.map((p) => (p.id === data.id ? data : p)));
  };

  const save = async (patch: Partial<Settings>) => {
    const { data, error } = await api.saveSettings(patch);
    if (error) {
      showError(error.message);
      return false;
    }
    setSettings(data);
    return true;
  };

  return (
    <>
      <PageHeader title="Settings" lead="Relay names, defaults, schema rules and the monthly report." />

      <section className="hp-card hp-card-pad mt-4 rise" style={{ ['--i' as string]: 1 }}>
        <h2 className="h4">Relay defaults</h2>
        <p className="text-body-secondary small">State of each relay when no schema is running. Click a name to rename it.</p>
        <div className="relay-grid">
          {pins.map((p) => (
            <div key={p.id} className={`relay${p.activeByDefault ? ' is-on' : ''}`}>
              <Switch checked={p.activeByDefault} label={`${p.name} default ${p.activeByDefault ? 'on' : 'off'}`} onChange={(v) => updatePin(p, { activeByDefault: v })} />
              <div className="min-w-0 flex-grow-1">
                <EditableLabel value={p.name} onSave={(name) => updatePin(p, { name })} />
                <div className="relay-state">default {p.activeByDefault ? 'on' : 'off'}</div>
              </div>
              <span className="relay-no">{String(p.id).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="row g-3 mt-1">
        <div className="col-12 col-lg-6">
          <section className="hp-card hp-card-pad h-100 rise" style={{ ['--i' as string]: 2 }}>
            <h2 className="h4">Schema rules</h2>
            <div className="d-flex align-items-center gap-3 mt-3">
              <Switch checked={settings.oneSchemaMode} tone="ember" label="Allow only one active schema at a time" onChange={(v) => save({ oneSchemaMode: v })} />
              <span>Allow only one active schema at a time</span>
            </div>
            {!settings.oneSchemaMode && (
              <div className="mt-4">
                <label htmlFor="priority" className="eyebrow mb-1">
                  When several active schemas match
                </label>
                <select
                  id="priority"
                  className="form-select"
                  value={settings.multiSchemaPriority}
                  onChange={(e) => save({ multiSchemaPriority: e.target.value as Settings['multiSchemaPriority'] })}
                >
                  <option value="highest">Prefer the most specific schema (lowest max temperature)</option>
                  <option value="lowest">Prefer the schema with the lowest min temperature</option>
                </select>
              </div>
            )}
          </section>
        </div>
        <div className="col-12 col-lg-6">
          <section className="hp-card hp-card-pad h-100 rise" style={{ ['--i' as string]: 3 }}>
            <h2 className="h4">Monthly report</h2>
            <p className="text-body-secondary small">
              On the 1st of every month last month's readings are mailed as CSV to this address and then removed from the HeatingPi.
            </p>
            <form
              className="d-flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                setEmailSaved(await save({ reportEmail: email.trim() }));
              }}
            >
              <input
                type="email"
                required
                className="form-control"
                aria-label="Report e-mail address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailSaved(false);
                }}
              />
              <button type="submit" className="btn btn-primary text-nowrap" disabled={email.trim() === settings.reportEmail}>
                {emailSaved && email.trim() === settings.reportEmail ? 'Saved ✓' : 'Save'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
