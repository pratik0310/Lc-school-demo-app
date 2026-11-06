const label = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', more_info: 'More info needed' };
export default function StatusBadge({ status }) {
  return <span className={`badge ${status}`}>{label[status]}</span>;
}
