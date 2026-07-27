const digitsOnly = (value) => String(value || "").replace(/\D/g, "");

export const formatCnic = (value) => {
  const digits = digitsOnly(value).slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

export const formatPhone = (value) => {
  const digits = digitsOnly(value).slice(0, 11);
  return digits.length <= 4 ? digits : `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

export const isValidCnic = (value) => /^\d{5}-\d{7}-\d$/.test(value);
export const isValidPhone = (value) => /^\d{4}-\d{7}$/.test(value);

export const maskCnic = (value) => {
  const digits = digitsOnly(value);
  return digits.length === 13 ? `*****-${digits.slice(5, 12)}-*` : "Invalid CNIC";
};
