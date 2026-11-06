import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((cfg) => {
  const u = JSON.parse(localStorage.getItem('lc_user') || 'null');
  if (u?.token) cfg.headers.Authorization = `Bearer ${u.token}`;
  return cfg;
});

export const errMsg = (e) => e.response?.data?.message || e.message;

// open protected file (document or LC pdf) in new tab / download
export async function openProtected(url, download = false, name = 'file') {
  const res = await api.get(url, { responseType: 'blob' });
  const blobUrl = URL.createObjectURL(res.data);
  if (download) {
    const a = document.createElement('a');
    a.href = blobUrl; a.download = name; a.click();
  } else window.open(blobUrl, '_blank');
}

export default api;
