require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const path = require('path');
const express = require('express');
const cors = require('cors');
const { init } = require('./models'); // after dotenv: db config reads env

const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/lc', require('./routes/lcRoutes'));

// React build lives in server/public (client `npm run build` writes here)
const pub = path.join(__dirname, 'public');
app.use(express.static(pub));
app.get('*', (req, res, next) =>
  req.path.startsWith('/api') ? next() : res.sendFile(path.join(pub, 'index.html'))
);

// error handler (multer, sequelize, others)
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 400).json({ message: err.message || 'Server error' });
});

init()
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('Server running')))
  .catch((e) => { console.error('Startup error:', e.message); process.exit(1); });
