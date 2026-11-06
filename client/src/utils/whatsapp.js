const COUNTRY_CODE = '91'; // India. Change if needed.

export function toWaNumber(phone) {
  const d = (phone || '').replace(/\D/g, '');
  if (!d) return null;
  if (d.length === 10) return COUNTRY_CODE + d;
  if (d.length === 11 && d.startsWith('0')) return COUNTRY_CODE + d.slice(1);
  return d; // already has country code
}

export function defaultMessage(a) {
  const hi = `Hello ${a.fullName},`;
  const ref = `(Admission No: ${a.admissionNo})`;
  switch (a.status) {
    case 'approved':
      return `${hi} your Leaving Certificate ${ref} is approved. LC No: ${a.lcNumber}. Please log in to the LC portal to download it. We also emailed the PDF to you.`;
    case 'rejected':
      return `${hi} your Leaving Certificate application ${ref} was rejected. Reason: ${a.adminRemark || '-'}. Please contact the school office for help.`;
    case 'more_info':
      return `${hi} we need more information for your Leaving Certificate application ${ref}. Admin note: ${a.adminRemark || '-'}. Please log in to the portal or contact the school office.`;
    default:
      return `${hi} we received your Leaving Certificate application ${ref}. Status: Pending. We will update you soon.`;
  }
}

export function waLink(a, message) {
  const n = toWaNumber(a.student?.phone);
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(message ?? defaultMessage(a))}`;
}
