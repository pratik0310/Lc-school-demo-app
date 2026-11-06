const fs = require('fs');
const nodemailer = require('nodemailer');

const useBrevo = !!process.env.BREVO_API_KEY;

const transporter = useBrevo ? null : nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// never crash request if mail fails
async function sendMail({ to, subject, html, attachments = [] }) {
  try {
    if (useBrevo) {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { name: process.env.MAIL_FROM_NAME || 'School Office', email: process.env.MAIL_FROM_EMAIL },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          ...(attachments.length && {
            attachment: attachments.map((a) => ({
              name: a.filename,
              content: fs.readFileSync(a.path).toString('base64'),
            })),
          }),
        }),
      });
      if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
    } else {
      await transporter.sendMail({ from: process.env.MAIL_FROM, to, subject, html, attachments });
    }
    console.log('Mail sent to', to);
  } catch (e) {
    console.error('Mail failed:', e.message);
  }
}

const wrap = (title, body) => `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #ddd;border-radius:8px;overflow:hidden">
    <div style="background:#1f3a5f;color:#fff;padding:14px 20px;font-size:18px">${process.env.SCHOOL_NAME || 'School'} – LC Portal</div>
    <div style="padding:20px;color:#222;line-height:1.5"><h3 style="margin-top:0">${title}</h3>${body}</div>
  </div>`;

exports.sendApplicationReceived = (user, app) =>
  sendMail({
    to: user.email,
    subject: 'LC application received',
    html: wrap('Application received', `
      <p>Hi ${user.name}, we got your Leaving Certificate application.</p>
      <p><b>Admission No:</b> ${app.admissionNo}<br><b>Class:</b> ${app.lastClass}</p>
      <p>Status: <b>Pending</b>. We will email you after review.</p>`),
  });

exports.notifyAdminNewApplication = (user, app) =>
  sendMail({
    to: process.env.ADMIN_EMAIL,
    subject: `New LC application – ${app.fullName}`,
    html: wrap('New LC application', `
      <p><b>${app.fullName}</b> (${user.email}) applied for LC.</p>
      <p>Admission No: ${app.admissionNo}<br>Class: ${app.lastClass}<br>Reason: ${app.reason}</p>
      <p><a href="${process.env.CLIENT_URL}/admin/${app.id}">Open application</a></p>`),
  });

exports.sendStatusUpdate = (user, app, pdfPath) => {
  const map = {
    approved: ['LC approved', 'Your Leaving Certificate is approved. PDF attached; you can also download it from the portal.'],
    rejected: ['LC application rejected', 'Your application was rejected.'],
    more_info: ['More information needed', 'Admin needs more information or documents.'],
  };
  const [title, msg] = map[app.status] || ['Status update', 'Status changed.'];
  return sendMail({
    to: user.email,
    subject: title,
    html: wrap(title, `
      <p>Hi ${user.name},</p><p>${msg}</p>
      ${app.lcNumber ? `<p><b>LC No:</b> ${app.lcNumber}</p>` : ''}
      ${app.adminRemark ? `<p><b>Admin remark:</b> ${app.adminRemark}</p>` : ''}
      <p><a href="${process.env.CLIENT_URL}/my-applications">Open portal</a></p>`),
    attachments: pdfPath ? [{ filename: `LC-${app.lcNumber.replace(/\//g, '-')}.pdf`, path: pdfPath }] : [],
  });
};