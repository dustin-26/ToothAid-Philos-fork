import {
  APPOINTMENT_PROCEDURE_PRESETS,
  APPOINTMENT_PROCEDURE_UI_OTHER
} from '../constants/appointmentProcedures';

export default function AppointmentProcedureField({
  selectValue,
  customValue,
  onSelectChange,
  onCustomChange,
  disabled = false,
  label = 'Procedure'
}) {
  return (
    <>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>{label}</label>
        <select
          className="form-control"
          value={selectValue}
          onChange={(e) => onSelectChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">— Select —</option>
          {APPOINTMENT_PROCEDURE_PRESETS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
          <option value={APPOINTMENT_PROCEDURE_UI_OTHER}>Other</option>
        </select>
      </div>
      {selectValue === APPOINTMENT_PROCEDURE_UI_OTHER && (
        <div className="form-group" style={{ marginTop: '10px', marginBottom: 0 }}>
          <input
            type="text"
            className="form-control"
            value={customValue}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder="Other"
            disabled={disabled}
            aria-label="Other procedure"
          />
        </div>
      )}
    </>
  );
}
