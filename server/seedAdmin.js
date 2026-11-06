require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { init, User } = require('./models');

init()
  .then(async () => {
    console.log('Admin count:', await User.count({ where: { role: 'admin' } }));
    process.exit();
  })
  .catch((e) => { console.error(e.message); process.exit(1); });
