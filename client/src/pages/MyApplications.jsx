import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { openProtected } from '../api';
import StatusBadge from '../components/StatusBadge.jsx';

export default function MyApplications() {
  const [list, setList] = useState(null);
  useEffect(() => { api.get('/lc/my').then((r) => setList(r.data)); }, []);

  if (!list) return <p>Loading…</p>;
  if (!list.length)
    return <div className="card"><h2>No applications yet</h2><p><Link to="/apply">Apply for your Leaving Certificate</Link></p></div>;

  return (
    <div className="card">
      <h2>My applications</h2>
      <table>
        <thead><tr><th>Applied on</th><th>Class</th><th>Status</th><th>Admin remark</th><th></th></tr></thead>
        <tbody>
          {list.map((a) => (
            <tr key={a._id}>
              <td>{new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
              <td>{a.lastClass}</td>
              <td><StatusBadge status={a.status} /></td>
              <td>{a.adminRemark || '-'}</td>
              <td className="actions">
                <Link to={`/application/${a._id}`}>View</Link>
                {a.status === 'approved' && (
                  <button className="link" onClick={() => openProtected(`/lc/${a._id}/download`, true, `LC-${a.lcNumber.replace(/\//g, '-')}.pdf`)}>Download LC</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
