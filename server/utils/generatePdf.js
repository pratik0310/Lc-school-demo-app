const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { UPLOAD_DIR } = require('../config/paths');

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '-');

module.exports = (app) =>
  new Promise((resolve, reject) => {
    const filename = `lc-${app.lcNumber.replace(/\//g, '-')}.pdf`;
    const filePath = path.join(UPLOAD_DIR, filename);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text(process.env.SCHOOL_NAME || 'School Name', { align: 'center' });
    doc.fontSize(10).text(process.env.SCHOOL_ADDRESS || '', { align: 'center' });
    doc.moveDown().fontSize(16).text('SCHOOL LEAVING CERTIFICATE', { align: 'center', underline: true });
    doc.moveDown().fontSize(11).text(`LC No: ${app.lcNumber}`, { align: 'right' });
    doc.text(`Date of issue: ${fmt(new Date())}`, { align: 'right' });
    doc.moveDown();

    const rows = [
      ['Student name', app.fullName],
      ["Father's name", app.fatherName],
      ["Mother's name", app.motherName],
      ['Date of birth', fmt(app.dob)],
      ['Admission No', app.admissionNo],
      ['Date of admission', fmt(app.admissionDate)],
      ['Last class studied', app.lastClass],
      ['Year of leaving', app.yearOfLeaving],
      ['Reason for leaving', app.reason],
      ['Conduct', 'Good'],
    ];
    rows.forEach(([k, v]) => {
      doc.font('Helvetica-Bold').text(`${k}: `, { continued: true }).font('Helvetica').text(v || '-');
      doc.moveDown(0.5);
    });

    doc.moveDown(4);
    doc.text('Class Teacher', 50, doc.y, { continued: true }).text('Principal', { align: 'right' });
    doc.end();

    stream.on('finish', () => resolve(filename));
    stream.on('error', reject);
  });
