import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { errMsg, openProtected } from '../api';
import StatusBadge from '../components/StatusBadge.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';
import { defaultMessage } from '../utils/whatsapp';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '-');

export default function ApplicationDetail({ admin }) {
  const { id } = useParams();
  const [a, setA] = useState(null);
  const [remark, setRemark] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [waText, setWaText] = useState('');

  const load = () =>
    api.get(`/lc/${id}`).then((r) => { setA(r.data); setWaText(defaultMessage(r.data)); });
  useEffect(() => { load(); }, [id]);

  const decide = async (status) => {
    setMsg('');
    try {
      setBusy(true);
      await api.patch(`/lc/${id}/status`, { status, remark });
      setRemark('');
      await load();
      setMsg(status === 'approved' ? 'Approved. LC PDF emailed to the student.' : 'Updated. Student notified by email.');
    } catch (e) { setMsg(errMsg(e)); }
    setBusy(false);
  };

  if (!a) return <p>Loading…</p>;

  const rows = [
    ['Student', a.fullName], ["Father's name", a.fatherName], ["Mother's name", a.motherName],
    ['Date of birth', fmt(a.dob)], ['Admission no.', a.admissionNo], ['Date of admission', fmt(a.admissionDate)],
    ['Last class', a.lastClass], ['Year of leaving', a.yearOfLeaving], ['Reason', a.reason],
    ['Account', `${a.student?.name} · ${a.student?.email}`], ['Phone', a.student?.phone],
  ];

  return (
    <div className="card">
      <h2>Application <StatusBadge status={a.status} /></h2>
      {a.lcNumber && <p><b>LC no:</b> {a.lcNumber}</p>}
      <dl>{rows.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v || '-'}</dd></div>))}</dl>

      <h3>Supporting documents</h3>
      <ul>
        {a.documents.map((d) => (
          <li key={d.filename}>
            {d.label}: <button className="link" onClick={() => openProtected(`/lc/${a._id}/doc/${d.filename}`)}>{d.originalName}</button>
          </li>
        ))}
      </ul>

      {a.adminRemark && <p><b>Admin remark:</b> {a.adminRemark}</p>}

      {a.status === 'approved' && (
        <div><button onClick={() => openProtected(`/lc/${a._id}/download`, true, 'LC.pdf')}>Download LC (PDF)</button></div>
      )}

      {admin && a.status !== 'approved' && (
        <div className="decide">
          <h3>Decision</h3>
          <label>Remark (required for reject / more info)
            <textarea rows={3} value={remark} onChange={(e) => setRemark(e.target.value)} />
          </label>
          <div className="row">
            <button disabled={busy} onClick={() => decide('approved')}>Approve and issue LC</button>
            <button disabled={busy} className="ghost" onClick={() => decide('more_info')}>Ask for more info</button>
            <button disabled={busy} className="danger" onClick={() => decide('rejected')}>Reject</button>
          </div>
        </div>
      )}

      {admin && (
        <div className="decide">
          <h3>WhatsApp notification</h3>
          <label>Message (edit before sending)
            <textarea rows={4} value={waText} onChange={(e) => setWaText(e.target.value)} />
          </label>
          <div className="row">
            <WhatsAppButton app={a} message={waText} />
            <button type="button" className="ghost" onClick={() => setWaText(defaultMessage(a))}>Reset message</button>
          </div>
          <p className="muted">Opens WhatsApp with the message ready. Admin presses send.</p>
        </div>
      )}
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}
