import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const GRADE_OPTIONS = [
  '',
  'Kindergarten',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6'
];

export default function ParentFormPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState(null);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const fieldsMap = meta?.fields && typeof meta.fields === 'object' ? meta.fields : {};

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/parent-form/${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || data.ok === false) {
          setError(data.error || 'This link is not valid.');
          setMeta(null);
          return;
        }
        setMeta(data);
        setForm({ ...(data.initial || {}) });
      } catch (e) {
        if (!cancelled) setError('Could not load the form. Check your connection.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const enabledKeys = useMemo(() => Object.keys(fieldsMap).filter((k) => fieldsMap[k]), [fieldsMap]);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/parent-form/${encodeURIComponent(token)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) {
        setError(data.error || 'Submission failed.');
        return;
      }
      setDone(true);
    } catch (err) {
      setError('Submission failed. Check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <p style={{ color: '#6b7280' }}>Loading…</p>
      </div>
    );
  }

  if (error && !meta) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <h1 style={{ fontSize: '20px', marginBottom: 12 }}>Form unavailable</h1>
          <p style={{ color: '#4b5563', lineHeight: 1.5 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <h1 style={{ fontSize: '20px', marginBottom: 12 }}>Thank you</h1>
          <p style={{ color: '#4b5563', lineHeight: 1.5 }}>Your responses have been saved. This link is now closed.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '24px 16px 48px' }}>
      <div
        style={{
          maxWidth: 520,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}
      >
        <h1 style={{ fontSize: '22px', margin: '0 0 8px', color: '#111827' }}>Information update</h1>
        <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: 15 }}>
          Patient: <strong style={{ color: '#111827' }}>{meta?.childName || 'Patient'}</strong>
        </p>

        {error ? (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 10,
              background: 'rgba(239,68,68,0.1)',
              color: '#b91c1c',
              fontSize: 14
            }}
          >
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          {fieldsMap.allergy ? (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Allergy</label>
              <textarea
                value={form.allergy ?? ''}
                onChange={(e) => setField('allergy', e.target.value)}
                rows={2}
                style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15 }}
                placeholder="List known allergies, or write “None”."
              />
            </div>
          ) : null}

          {fieldsMap.spedCategory ? (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>SPED</label>
              <select
                value={form.spedCategory ?? ''}
                onChange={(e) => setField('spedCategory', e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15 }}
              >
                <option value="">—</option>
                <option value="deaf">Deaf / hard of hearing</option>
                <option value="autism">Autism spectrum</option>
                <option value="others">Other</option>
              </select>
            </div>
          ) : null}

          {fieldsMap.spedOtherDetail ? (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>SPED (other details)</label>
              <input
                type="text"
                value={form.spedOtherDetail ?? ''}
                onChange={(e) => setField('spedOtherDetail', e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15 }}
              />
            </div>
          ) : null}

          {fieldsMap.behaviourFrankl ? (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Behaviour (Frankl scale)</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setField('behaviourFrankl', String(n))}
                    style={{
                      flex: '1 1 72px',
                      padding: '12px 8px',
                      borderRadius: 10,
                      border: String(form.behaviourFrankl) === String(n) ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      background: String(form.behaviourFrankl) === String(n) ? '#eff6ff' : '#fff',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {fieldsMap.medicalOtherNotes ? (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Other medical notes</label>
              <textarea
                value={form.medicalOtherNotes ?? ''}
                onChange={(e) => setField('medicalOtherNotes', e.target.value)}
                rows={3}
                style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15 }}
              />
            </div>
          ) : null}

          {fieldsMap.guardianPhone ? (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Guardian phone</label>
              <input
                type="tel"
                value={form.guardianPhone ?? ''}
                onChange={(e) => setField('guardianPhone', e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15 }}
              />
            </div>
          ) : null}

          {fieldsMap.messenger ? (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Messenger</label>
              <input
                type="text"
                value={form.messenger ?? ''}
                onChange={(e) => setField('messenger', e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15 }}
              />
            </div>
          ) : null}

          {fieldsMap.grade ? (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Grade</label>
              <select
                value={form.grade ?? ''}
                onChange={(e) => setField('grade', e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15 }}
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g || 'empty'} value={g}>
                    {g === '' ? '—' : g}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {fieldsMap.class ? (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Class</label>
              <input
                type="text"
                value={form.class ?? ''}
                onChange={(e) => setField('class', e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15 }}
              />
            </div>
          ) : null}

          {fieldsMap.notes ? (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Notes</label>
              <textarea
                value={form.notes ?? ''}
                onChange={(e) => setField('notes', e.target.value)}
                rows={3}
                style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15 }}
              />
            </div>
          ) : null}

          {enabledKeys.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No fields were enabled for this form.</p>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                marginTop: 8,
                padding: 14,
                borderRadius: 12,
                border: 'none',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                cursor: submitting ? 'wait' : 'pointer'
              }}
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
