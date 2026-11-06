import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';

const DOC_TYPES = ['ID proof', 'Fee receipt / no-dues', 'Last marksheet', 'Application letter', 'Other'];

export default function Apply() {
  const nav = useNavigate();
  const [f, setF] = useState({
    studentType: 'current', fullName: '', fatherName: '', motherName: '', dob: '',
    admissionNo: '', admissionDate: '', lastClass: '', yearOfLeaving: '', reason: '',
  });
  const [docs, setDocs] = useState([{ label: DOC_TYPES[0], file: null }]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const setDoc = (i, patch) => setDocs(docs.map((d, j) => (j === i ? { ...d, ...patch } : d)));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    const picked = docs.filter((d) => d.file);
    if (!picked.length) return setErr('Attach at least one supporting document');

    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    picked.forEach((d) => { fd.append('labels', d.label); fd.append('documents', d.file); });

    try {
      setBusy(true);
      await api.post('/lc', fd);
      nav('/my-applications');
    } catch (e) { setErr(errMsg(e)); setBusy(false); }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>Apply for Leaving Certificate</h2>
      {err && <p className="err">{err}</p>}

      <div className="grid">
        <label>I am a
          <select value={f.studentType} onChange={set('studentType')}>
            <option value="current">Current student</option>
            <option value="ex">Ex-student</option>
          </select>
        </label>
        <label>Full name<input required value={f.fullName} onChange={set('fullName')} /></label>
        <label>Father's name<input value={f.fatherName} onChange={set('fatherName')} /></label>
        <label>Mother's name<input value={f.motherName} onChange={set('motherName')} /></label>
        <label>Date of birth<input type="date" value={f.dob} onChange={set('dob')} /></label>
        <label>Admission no.<input required value={f.admissionNo} onChange={set('admissionNo')} /></label>
        <label>Date of admission<input type="date" value={f.admissionDate} onChange={set('admissionDate')} /></label>
        <label>Last class studied<input required value={f.lastClass} onChange={set('lastClass')} /></label>
        <label>Year of leaving<input required placeholder="2026" value={f.yearOfLeaving} onChange={set('yearOfLeaving')} /></label>
      </div>
      <label>Reason for leaving<textarea required rows={3} value={f.reason} onChange={set('reason')} /></label>

      <h3>Supporting documents</h3>
      <p className="muted">PDF, JPG or PNG, up to 5 MB each.</p>
      {docs.map((d, i) => (
        <div className="docrow" key={i}>
          <select value={d.label} onChange={(e) => setDoc(i, { label: e.target.value })}>
            {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setDoc(i, { file: e.target.files[0] })} />
          {docs.length > 1 && <button type="button" className="ghost" onClick={() => setDocs(docs.filter((_, j) => j !== i))}>Remove</button>}
        </div>
      ))}
      {docs.length < 6 && (
        <button type="button" className="ghost" onClick={() => setDocs([...docs, { label: DOC_TYPES[0], file: null }])}>Add another document</button>
      )}

      <div><button disabled={busy}>{busy ? 'Submitting…' : 'Submit application'}</button></div>
    </form>
  );
}
