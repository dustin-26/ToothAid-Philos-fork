import { getPriorityButtonStyle } from '../utils/priorityUi';

const LEVELS = ['P0', 'P1', 'P2', 'P3'];

export default function PriorityColorButtons({ value, onChange, disabled, label = 'Priority' }) {
  const current = String(value || 'P2').toUpperCase();
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      {label ? <label style={{ display: 'block', marginBottom: '8px' }}>{label}</label> : null}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {LEVELS.map((p) => (
          <button
            key={p}
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(p)}
            style={getPriorityButtonStyle(p, current === p)}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
