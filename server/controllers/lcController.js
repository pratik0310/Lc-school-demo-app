const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { LCApplication: LC, User } = require('../models');
const generatePdf = require('../utils/generatePdf');
const mail = require('../utils/mailer');
const { UPLOAD_DIR } = require('../config/paths');

const withStudent = [{ model: User, as: 'student', attributes: ['id', 'name', 'email', 'phone'] }];
const canAccess = (req, app) => req.user.role === 'admin' || app.studentId === req.user.id;

// STUDENT: apply
exports.apply = async (req, res) => {
  const b = req.body;
  if (!req.files?.length) return res.status(400).json({ message: 'Upload at least one supporting document' });

  const open = await LC.findOne({
    where: { studentId: req.user.id, status: { [Op.in]: ['pending', 'more_info'] } },
  });
  if (open) return res.status(400).json({ message: 'You already have an open application' });

  let labels = b.labels || [];
  if (!Array.isArray(labels)) labels = [labels];

  const app = await LC.create({
    studentId: req.user.id,
    studentType: b.studentType === 'ex' ? 'ex' : 'current',
    fullName: b.fullName,
    fatherName: b.fatherName,
    motherName: b.motherName,
    dob: b.dob || null,
    admissionNo: b.admissionNo,
    admissionDate: b.admissionDate || null,
    lastClass: b.lastClass,
    yearOfLeaving: b.yearOfLeaving,
    reason: b.reason,
    documents: req.files.map((f, i) => ({
      label: labels[i] || 'Document',
      originalName: f.originalname,
      filename: f.filename,
      mimetype: f.mimetype,
    })),
  });

  mail.sendApplicationReceived(req.user, app);
  mail.notifyAdminNewApplication(req.user, app);
  res.status(201).json(app);
};

// STUDENT: own list
exports.myApplications = async (req, res) =>
  res.json(await LC.findAll({ where: { studentId: req.user.id }, order: [['createdAt', 'DESC']] }));

// ADMIN: all, optional ?status=
exports.allApplications = async (req, res) => {
  const where = req.query.status ? { status: req.query.status } : {};
  res.json(await LC.findAll({ where, include: withStudent, order: [['createdAt', 'DESC']] }));
};

// BOTH: one
exports.getOne = async (req, res) => {
  const app = await LC.findByPk(req.params.id, { include: withStudent });
  if (!app) return res.status(404).json({ message: 'Not found' });
  if (!canAccess(req, app)) return res.status(403).json({ message: 'Forbidden' });
  res.json(app);
};

// ADMIN: approve / reject / more_info
exports.updateStatus = async (req, res) => {
  const { status, remark } = req.body;
  if (!['approved', 'rejected', 'more_info'].includes(status))
    return res.status(400).json({ message: 'Invalid status' });
  if (status !== 'approved' && !remark)
    return res.status(400).json({ message: 'Remark required for reject / more info' });

  const app = await LC.findByPk(req.params.id, { include: withStudent });
  if (!app) return res.status(404).json({ message: 'Not found' });
  if (app.status === 'approved') return res.status(400).json({ message: 'Already approved' });

  app.status = status;
  app.adminRemark = remark || null;
  app.reviewedBy = req.user.id;
  app.reviewedAt = new Date();

  let pdfPath;
  if (status === 'approved') {
    app.lcNumber = `LC/${new Date().getFullYear()}/${String(app.id).padStart(4, '0')}`; // unique by id
    app.lcPdf = await generatePdf(app);
    pdfPath = path.join(UPLOAD_DIR, app.lcPdf);
  }
  await app.save();

  mail.sendStatusUpdate(app.student, app, pdfPath);
  res.json(app);
};

// BOTH: view supporting doc (auth checked)
exports.getDocument = async (req, res) => {
  const app = await LC.findByPk(req.params.id);
  if (!app) return res.status(404).json({ message: 'Not found' });
  if (!canAccess(req, app)) return res.status(403).json({ message: 'Forbidden' });
  const doc = app.documents.find((d) => d.filename === req.params.filename);
  if (!doc) return res.status(404).json({ message: 'File not found' });
  res.type(doc.mimetype).sendFile(path.join(UPLOAD_DIR, doc.filename));
};

// BOTH: download approved LC
exports.downloadLC = async (req, res) => {
  const app = await LC.findByPk(req.params.id);
  if (!app) return res.status(404).json({ message: 'Not found' });
  if (!canAccess(req, app)) return res.status(403).json({ message: 'Forbidden' });
  if (app.status !== 'approved' || !app.lcPdf) return res.status(400).json({ message: 'LC not approved yet' });
  const p = path.join(UPLOAD_DIR, app.lcPdf);
  if (!fs.existsSync(p)) return res.status(404).json({ message: 'PDF missing' });
  res.download(p, `LC-${app.lcNumber.replace(/\//g, '-')}.pdf`);
};
