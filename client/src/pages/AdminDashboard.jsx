import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import StatusBadge from '../components/StatusBadge.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';

const FILTERS = [['', 'All'], ['pending', 'Pending'], ['more_info', 'More info'], ['approved', 'Approved'], ['rejected', 'Rejected']];

export default function AdminDashboard() {
  const [status, setStatus] = useState('pending');
  const [list, setList] = useState(null);

  useEffect(() => {
    setList(null);
    api.get('/lc', { params: status ? { status } : {} }).then((r) => setList(r.data));
  }, [status]);

  return (
    <div className="card">
      <h2>LC applications</h2>
      <div className="tabs">
        {FILTERS.map(([v, l]) => (
          <button key={v} className={status === v ? 'tab on' : 'tab'} onClick={() => setStatus(v)}>{l}</button>
        ))}
      </div>
      {!list ? <p>Loading…</p> : !list.length ? <p className="muted">Nothing here.</p> : (
        <table>
          <thead><tr><th>Student</th><th>Admission no.</th><th>Class</th><th>Type</th><th>Applied</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {list.map((a) => (
              <tr key={a._id}>
                <td>{a.fullName}<div className="muted">{a.student?.email}<br />{a.student?.phone}</div></td>
                <td>{a.admissionNo}</td>
                <td>{a.lastClass}</td>
                <td>{a.studentType === 'ex' ? 'Ex-student' : 'Current'}</td>
                <td>{new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
                <td><StatusBadge status={a.status} /></td>
                <td className="actions">
                  <Link to={`/admin/${a._id}`}>Review</Link>
                  <WhatsAppButton app={a} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
