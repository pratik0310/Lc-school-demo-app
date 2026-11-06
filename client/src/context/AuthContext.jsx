import { createContext, useContext, useState } from 'react';

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('lc_user') || 'null'));

  const login = (u) => { localStorage.setItem('lc_user', JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem('lc_user'); setUser(null); };

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}
