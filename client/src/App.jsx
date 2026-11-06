import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Apply from './pages/Apply.jsx';
import MyApplications from './pages/MyApplications.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ApplicationDetail from './pages/ApplicationDetail.jsx';

function Guard({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/my-applications'} replace />;
}

export default function App() {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="bar">
        <Link to="/" className="brand">LC Portal</Link>
        <nav>
          {user?.role === 'student' && (<>
            <Link to="/apply">Apply for LC</Link>
            <Link to="/my-applications">My applications</Link>
          </>)}
          {user?.role === 'admin' && <Link to="/admin">All applications</Link>}
          {user ? <button className="link" onClick={logout}>Log out ({user.name})</button>
                : <Link to="/login">Log in</Link>}
        </nav>
      </header>
      <main className="wrap">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/apply" element={<Guard role="student"><Apply /></Guard>} />
          <Route path="/my-applications" element={<Guard role="student"><MyApplications /></Guard>} />
          <Route path="/admin" element={<Guard role="admin"><AdminDashboard /></Guard>} />
          <Route path="/admin/:id" element={<Guard role="admin"><ApplicationDetail admin /></Guard>} />
          <Route path="/application/:id" element={<Guard role="student"><ApplicationDetail /></Guard>} />
        </Routes>
      </main>
    </>
  );
}
