import { useCallback, useEffect, useState } from 'react';
import { api, Pin, PinMode, Schema } from '../api';
import { RangeBar } from '../components/charts';
import { Loading, Modal, PageHeader, Switch, showError } from '../components/ui';

const MODES = [
  { value: 0, label: 'Off' },
  { value: 1, label: 'On' },
  { value: 2, label: 'Keep' },
];

export default function Schemas() {
  const [schemas, setSchemas] = useState<Schema[] | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [temp, setTemp] = useState<number | null>(null);
  const [editing, setEditing] = useState<Schema | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Schema | null>(null);

  const load = useCallback(async () => {
    const [s, p, d] = await Promise.all([api.schemas(), api.pins(), api.dashboard()]);
    if (s.error) return showError(s.error.message);
    if (p.error) return showError(p.error.message);
    setSchemas(s.data);
    setPins(p.data);
    if (d.data) setTemp(d.data.temperature);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!schemas) return <Loading />;

  const toggle = async (s: Schema) => {
    // Optimistic flip so the switch animates immediately.
    setSchemas((list) => list && list.map((x) => (x.id === s.id ? { ...x, active: !s.active } : x)));
    const { error } = await api.activateSchema(s.id, !s.active);
    if (error) showError(error.message);
    load();
  };

  return (
    <>
      <PageHeader
        title="Schemas"
        lead={
          <>
            A schema switches the relays while the temperature is inside its range.
            {temp !== null && (
              <>
                {' '}
                Now <b className="mono">{temp.toFixed(1)} °C</b>.
              </>
            )}
          </>
        }
        action={
          <button type="button" className="btn btn-primary px-4" onClick={() => setEditing('new')}>
            + New schema
          </button>
        }
      />

      <div className="d-flex flex-column gap-2 mt-4">
        {schemas.length === 0 && <p className="text-body-secondary">No schemas found.</p>}
        {schemas.map((s, i) => (
          <div key={s.id} className={`hp-card schema-card rise${s.running ? ' is-running' : ''}`} style={{ ['--i' as string]: i }}>
            <Switch checked={s.active} tone="ember" label={`${s.active ? 'Disable' : 'Activate'} ${s.name}`} onChange={() => toggle(s)} />
            <div className="min-w-0">
              <div className="d-flex align-items-center gap-2">
                <span className="schema-name">{s.name}</span>
                {s.running && <span className="chip chip-running py-0">running</span>}
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="flex-grow-1" style={{ maxWidth: 320 }}>
                  <RangeBar min={s.min} max={s.max} now={temp} />
                </div>
                <span className="mono small text-body-secondary text-nowrap mt-2">
                  {s.min}° – {s.max}°
                </span>
              </div>
              <div className="mode-dots" title="Pin modes: filled green = on, grey = off, dashed = keep">
                {pins.map((p) => (
                  <span key={p.id} className="mode-dot" data-mode={s.modes.find((m) => m.pinId === p.id)?.mode ?? 2} />
                ))}
              </div>
            </div>
            <div className="d-flex gap-1 schema-actions">
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setEditing(s)}>
                Edit
              </button>
              <button type="button" className="btn btn-sm btn-ghost-danger" onClick={() => setDeleting(s)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <SchemaModal
          pins={pins}
          schema={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {deleting && (
        <Modal
          title="Delete schema"
          submitLabel="Delete"
          submitClass="btn-danger"
          onClose={() => setDeleting(null)}
          onSubmit={async () => {
            const { error } = await api.deleteSchema(deleting.id);
            if (error) showError(error.message);
            setDeleting(null);
            load();
          }}
        >
          Do you really want to delete <b>{deleting.name}</b>?
        </Modal>
      )}
    </>
  );
}

function SchemaModal(props: { pins: Pin[]; schema: Schema | null; onClose: () => void; onSaved: () => void }) {
  const { schema, pins } = props;
  const [name, setName] = useState(schema?.name ?? '');
  const [min, setMin] = useState(schema ? String(schema.min) : '');
  const [max, setMax] = useState(schema ? String(schema.max) : '');
  const [modes, setModes] = useState<PinMode[]>(() =>
    pins.map((p) => ({ pinId: p.id, mode: schema?.modes.find((m) => m.pinId === p.id)?.mode ?? 2 }))
  );
  const [busy, setBusy] = useState(false);

  const setMode = (pinId: number, mode: number) => setModes((list) => list.map((m) => (m.pinId === pinId ? { ...m, mode } : m)));
  const setAll = (mode: number) => setModes((list) => list.map((m) => ({ ...m, mode })));

  const submit = async () => {
    if (!name.trim()) return showError('The schema name needs to be set.');
    if (min === '' || max === '' || Number(min) >= Number(max)) return showError('The max temperature needs to be larger than the min temperature.');
    setBusy(true);
    const input = { name: name.trim(), min: Number(min), max: Number(max), modes };
    const { error } = schema ? await api.editSchema(schema.id, input) : await api.addSchema(input);
    setBusy(false);
    if (error) return showError(error.message);
    props.onSaved();
  };

  return (
    <Modal title={schema ? `Edit “${schema.name}”` : 'New schema'} onClose={props.onClose} onSubmit={submit} busy={busy}>
      <label className="eyebrow mb-1" htmlFor="schema-name">
        Name
      </label>
      <input id="schema-name" className="form-control mb-3" placeholder="e.g. Comfort 20°" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} autoFocus />

      <div className="row g-2 mb-1">
        <div className="col-6">
          <label className="eyebrow mb-1">From (°C)</label>
          <input className="form-control" type="number" step="0.1" value={min} onChange={(e) => setMin(e.target.value)} />
        </div>
        <div className="col-6">
          <label className="eyebrow mb-1">To (°C)</label>
          <input className="form-control" type="number" step="0.1" value={max} onChange={(e) => setMax(e.target.value)} />
        </div>
      </div>
      {min !== '' && max !== '' && Number(min) < Number(max) && <RangeBar min={Number(min)} max={Number(max)} />}

      <div className="d-flex align-items-center justify-content-between mt-4 mb-2 flex-wrap gap-2">
        <span className="eyebrow">Relays while running</span>
        <div className="d-flex gap-1">
          {MODES.map((m) => (
            <button key={m.value} type="button" className="btn btn-sm btn-ghost" onClick={() => setAll(m.value)}>
              All {m.label.toLowerCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="row g-2">
        {pins.map((p) => {
          const mode = modes.find((m) => m.pinId === p.id)?.mode ?? 2;
          return (
            <div key={p.id} className="col-12 col-md-6">
              <div className="relay py-2" style={{ minHeight: 0 }}>
              <span className="relay-name">{p.name}</span>
              <div className="segmented" role="group" aria-label={`${p.name} mode`}>
                {MODES.map((m) => (
                  <button key={m.value} type="button" data-mode={m.value} aria-pressed={mode === m.value} onClick={() => setMode(p.id, m.value)}>
                    {m.label}
                  </button>
                ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="small text-body-secondary mt-2 mb-0">“Keep” leaves the relay as it is.</p>
    </Modal>
  );
}
