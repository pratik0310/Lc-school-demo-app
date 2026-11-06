const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class LCApplication extends Model {
  toJSON() {
    const v = { ...this.get() };
    v._id = v.id; // keep React code unchanged
    return v;
  }
}

LCApplication.init({
  studentType: { type: DataTypes.ENUM('current', 'ex'), defaultValue: 'current' },
  fullName: { type: DataTypes.STRING(150), allowNull: false },
  fatherName: DataTypes.STRING(150),
  motherName: DataTypes.STRING(150),
  dob: DataTypes.DATEONLY,
  admissionNo: { type: DataTypes.STRING(50), allowNull: false },
  admissionDate: DataTypes.DATEONLY,
  lastClass: { type: DataTypes.STRING(50), allowNull: false },
  yearOfLeaving: { type: DataTypes.STRING(10), allowNull: false },
  reason: { type: DataTypes.TEXT, allowNull: false },

  // stored as TEXT (works on MySQL and MariaDB), used as array in code
  documents: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    defaultValue: '[]',
    get() {
      try { return JSON.parse(this.getDataValue('documents') || '[]'); } catch { return []; }
    },
    set(v) { this.setDataValue('documents', JSON.stringify(v || [])); },
  },

  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'more_info'), defaultValue: 'pending' },
  adminRemark: DataTypes.TEXT,
  reviewedBy: DataTypes.INTEGER,
  reviewedAt: DataTypes.DATE,
  lcNumber: DataTypes.STRING(30),
  lcPdf: DataTypes.STRING(100),
}, {
  sequelize,
  modelName: 'LCApplication',
  tableName: 'lc_applications',
});

module.exports = LCApplication;
