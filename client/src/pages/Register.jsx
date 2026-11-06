import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [err, setErr] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', f);
      login(data);
      nav('/apply');
    } catch (e) { setErr(errMsg(e)); }
  };

  return (
    <form className="card narrow" onSubmit={submit}>
      <h2>Create account</h2>
      {err && <p className="err">{err}</p>}
      <label>Full name<input required value={f.name} onChange={set('name')} /></label>
      <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
      <label>WhatsApp / phone number<input type="tel" required pattern="[0-9+\s-]{10,15}" placeholder="9876543210" value={f.phone} onChange={set('phone')} /></label>
      <label>Password (min 6)<input type="password" minLength={6} required value={f.password} onChange={set('password')} /></label>
      <button>Create account</button>
      <p className="muted">Have an account? <Link to="/login">Log in</Link></p>
    </form>
  );
}
