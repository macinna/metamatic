export function formatPhoneForDisplay(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // Return original if not a standard US format
  return phone;
}

export function formatPhoneToE164(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Assume US number if 10 digits
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  // Already has country code
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+${cleaned}`;
  }
  
  // If already has + at the beginning, just clean it
  if (phone.startsWith('+')) {
    return `+${cleaned}`;
  }
  
  // Default: assume it needs +1 prefix for US
  return `+1${cleaned}`;
}

export function validateE164Phone(phone: string): boolean {
  // E.164 format: + followed by 1-15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

export function validateUSPhone(phone: string): boolean {
  // Remove any non-digit characters for validation
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a 10-digit US number or 11-digit with country code
  return (cleaned.length === 10 && /^[2-9]\d{9}$/.test(cleaned)) ||
         (cleaned.length === 11 && /^1[2-9]\d{9}$/.test(cleaned));
}