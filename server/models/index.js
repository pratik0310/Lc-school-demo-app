const sequelize = require('../config/db');
const User = require('./User');
const LCApplication = require('./LCApplication');

LCApplication.belongsTo(User, { as: 'student', foreignKey: { name: 'studentId', allowNull: false } });
User.hasMany(LCApplication, { foreignKey: 'studentId' });

async function init() {
  await sequelize.authenticate();
  await sequelize.sync(); // creates tables if missing
  console.log('MySQL connected, tables ready');

  // auto-create first admin (no SSH needed on shared hosting)
  const email = process.env.SEED_ADMIN_EMAIL;
  const pass = process.env.SEED_ADMIN_PASSWORD;
  if (email && pass && !(await User.findOne({ where: { role: 'admin' } }))) {
    await User.create({ name: 'Admin', email: email.toLowerCase().trim(), password: pass, role: 'admin' });
    console.log('Admin created:', email);
  }
}

module.exports = { sequelize, User, LCApplication, init };
