import { waLink } from '../utils/whatsapp';

export default function WhatsAppButton({ app, message }) {
  const href = waLink(app, message);
  if (!href)
    return <button className="wa off" disabled title="Student has no phone number">WhatsApp</button>;
  return (
    <a className="wa" href={href} target="_blank" rel="noopener noreferrer" title="Open WhatsApp with message ready">
      WhatsApp
    </a>
  );
}
