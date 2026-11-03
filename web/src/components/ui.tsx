import { ReactNode, useEffect, useState, KeyboardEvent } from 'react';

// ---------------------------------------------------------------------------
// Icons (inline SVG instead of an icon library to keep the bundle small)
// ---------------------------------------------------------------------------
export function FlameIcon({ size = 22, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 2c.6 3.2-1 5-2.6 6.8C7.8 10.6 6 12.6 6 15.5A6 6 0 0 0 12 22a6 6 0 0 0 6-6.3c0-2.6-1.4-4.2-2.4-5.6-.3 1.6-1 2.7-2.2 3.3.4-3.6-.1-8.4-1.4-11.4Z" />
    </svg>
  );
}

export function Led({ on, tone = 'on', title }: { on: boolean; tone?: 'on' | 'ember' | 'amber'; title?: string }) {
  return <span className={`led${on ? ` ${tone}` : ''}`} role="img" aria-label={title} title={title} />;
}

/** Accessible pill toggle. */
export function Switch(props: { checked: boolean; onChange: (v: boolean) => void; label: string; tone?: 'ember' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      aria-label={props.label}
      title={props.label}
      className={`hp-switch${props.tone ? ` ${props.tone}` : ''}`}
      onClick={() => props.onChange(!props.checked)}
    />
  );
}

// ---------------------------------------------------------------------------
// Error toasts (errors only — success is shown through the UI state itself)
// ---------------------------------------------------------------------------
let pushToast: (msg: string) => void = () => undefined;
export const showError = (msg: string) => pushToast(msg);

export function Toasts() {
  const [items, setItems] = useState<{ id: number; msg: string }[]>([]);
  useEffect(() => {
    pushToast = (msg) => {
      const id = Date.now() + Math.random();
      setItems((list) => [...list, { id, msg }]);
      setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 6000);
    };
  }, []);
  return (
    <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1100 }}>
      {items.map((t) => (
        <div key={t.id} className="toast show text-bg-danger border-0" role="alert">
          <div className="d-flex">
            <div className="toast-body">{t.msg}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              aria-label="Close"
              onClick={() => setItems((list) => list.filter((x) => x.id !== t.id))}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
export function Modal(props: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitClass?: string;
  busy?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && props.onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [props]);

  return (
    <>
      <div className="modal d-block" tabIndex={-1} role="dialog" onClick={props.onClose}>
        <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
          <form
            className="modal-content rise"
            onSubmit={(e) => {
              e.preventDefault();
              props.onSubmit();
            }}
          >
            <div className="modal-header">
              <h5 className="modal-title">{props.title}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={props.onClose} />
            </div>
            <div className="modal-body">{props.children}</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={props.onClose}>
                Cancel
              </button>
              <button type="submit" className={`btn ${props.submitClass || 'btn-primary'}`} disabled={props.busy}>
                {props.submitLabel || 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  );
}

// ---------------------------------------------------------------------------
// Click-to-edit text (pin names)
// ---------------------------------------------------------------------------
export function EditableLabel({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const commit = () => {
    setEditing(false);
    const v = draft.trim();
    if (v && v !== value) onSave(v);
    else setDraft(value);
  };

  if (!editing) {
    return (
      <button
        type="button"
        className="btn btn-link p-0 text-reset text-decoration-none text-start mw-100 text-truncate fw-medium"
        title="Click to rename"
        onClick={() => setEditing(true)}
      >
        {value} <span className="text-body-secondary small">✎</span>
      </button>
    );
  }
  return (
    <input
      autoFocus
      className="form-control form-control-sm"
      value={draft}
      maxLength={40}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') {
          setDraft(value);
          setEditing(false);
        }
      }}
    />
  );
}

export function Loading() {
  return (
    <div className="d-flex align-items-center gap-2 mt-5 text-body-secondary">
      <div className="spinner-border spinner-border-sm" role="status" />
      <span>Loading…</span>
    </div>
  );
}

export function PageHeader({ title, lead, action }: { title: string; lead?: ReactNode; action?: ReactNode }) {
  return (
    <div className="d-flex align-items-end justify-content-between gap-3 flex-wrap rise">
      <div>
        <h1 className="page-title">{title}</h1>
        {lead && <p className="page-lead m-0">{lead}</p>}
      </div>
      {action}
    </div>
  );
}
