const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');

class User extends Model {
  matchPassword(p) { return bcrypt.compare(p, this.password); }
  toJSON() {
    const v = { ...this.get() };
    delete v.password;
    v._id = v.id; // keep React code unchanged
    return v;
  }
}

User.init({
  name: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(190), allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING(100), allowNull: false },
  phone: DataTypes.STRING(20),
  role: { type: DataTypes.ENUM('student', 'admin'), defaultValue: 'student' },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  hooks: {
    beforeSave: async (u) => {
      if (u.changed('password')) u.password = await bcrypt.hash(u.password, 10);
    },
  },
});

module.exports = User;
