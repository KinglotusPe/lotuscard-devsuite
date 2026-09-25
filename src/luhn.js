/**
 * Luhn Algorithm Engine & Card Utilities
 * ISO/IEC 7812-1 compliant Modulo 10 implementation
 */

export const CARD_BRANDS = {
  VISA: {
    id: 'visa',
    name: 'Visa',
    pattern: /^4\d{0,18}$/,
    format: [4, 4, 4, 4, 3],
    lengths: [13, 16, 19],
    cvvLength: 3,
    gradient: 'from-blue-600 via-indigo-700 to-slate-900',
    accentColor: '#3b82f6',
    icon: 'visa'
  },
  MASTERCARD: {
    id: 'mastercard',
    name: 'Mastercard',
    pattern: /^(5[1-5]\d{0,14}|2(2[2-9]\d{0,12}|[3-6]\d{0,13}|7[0-1]\d{0,12}|720\d{0,11}))$/,
    format: [4, 4, 4, 4],
    lengths: [16],
    cvvLength: 3,
    gradient: 'from-amber-600 via-rose-700 to-zinc-900',
    accentColor: '#f43f5e',
    icon: 'mastercard'
  },
  AMEX: {
    id: 'amex',
    name: 'American Express',
    pattern: /^3[47]\d{0,13}$/,
    format: [4, 6, 5],
    lengths: [15],
    cvvLength: 4,
    gradient: 'from-cyan-700 via-teal-800 to-slate-950',
    accentColor: '#06b6d4',
    icon: 'amex'
  },
  DISCOVER: {
    id: 'discover',
    name: 'Discover',
    pattern: /^(6011|65|64[4-9]|622)\d{0,15}$/,
    format: [4, 4, 4, 4],
    lengths: [16, 19],
    cvvLength: 3,
    gradient: 'from-orange-600 via-amber-700 to-slate-900',
    accentColor: '#f97316',
    icon: 'discover'
  },
  JCB: {
    id: 'jcb',
    name: 'JCB',
    pattern: /^(?:2131|1800|35\d{0,2})\d{0,15}$/,
    format: [4, 4, 4, 4],
    lengths: [16, 19],
    cvvLength: 3,
    gradient: 'from-emerald-700 via-teal-800 to-zinc-950',
    accentColor: '#10b981',
    icon: 'jcb'
  },
  DINERS: {
    id: 'diners',
    name: 'Diners Club',
    pattern: /^3(?:0[0-5]|[68]\d)\d{0,11}$/,
    format: [4, 6, 4],
    lengths: [14],
    cvvLength: 3,
    gradient: 'from-blue-700 via-slate-800 to-zinc-950',
    accentColor: '#60a5fa',
    icon: 'diners'
  },
  GENERIC: {
    id: 'generic',
    name: 'Tarjeta Genérica',
    pattern: /^\d*$/,
    format: [4, 4, 4, 4],
    lengths: [16],
    cvvLength: 3,
    gradient: 'from-slate-700 via-zinc-800 to-slate-950',
    accentColor: '#94a3b8',
    icon: 'generic'
  }
};

/**
 * Sanitizes input by removing all non-digit characters
 */
export function sanitizeNumber(input) {
  return String(input || '').replace(/\D/g, '');
}

/**
 * Detects card brand based on prefix/BIN pattern
 */
export function detectBrand(rawNumber) {
  const digits = sanitizeNumber(rawNumber);
  if (!digits) return CARD_BRANDS.GENERIC;

  for (const brand of Object.values(CARD_BRANDS)) {
    if (brand.id === 'generic') continue;
    if (brand.pattern.test(digits)) {
      return brand;
    }
  }
  return CARD_BRANDS.GENERIC;
}

/**
 * Formats a card number according to brand spacing
 */
export function formatCardNumber(rawNumber, brand = null) {
  const digits = sanitizeNumber(rawNumber);
  const cardBrand = brand || detectBrand(digits);
  const groups = cardBrand.format;
  
  let formatted = '';
  let index = 0;
  for (let i = 0; i < groups.length; i++) {
    const size = groups[i];
    if (index >= digits.length) break;
    const chunk = digits.slice(index, index + size);
    formatted += (formatted ? ' ' : '') + chunk;
    index += size;
  }
  if (index < digits.length) {
    formatted += ' ' + digits.slice(index);
  }
  return formatted;
}

/**
 * Validates a number using the Luhn algorithm (mod 10).
 * Returns boolean.
 */
export function isValidLuhn(rawNumber) {
  const digits = sanitizeNumber(rawNumber);
  if (digits.length < 2) return false;

  let sum = 0;
  let shouldDouble = false;

  // Traverse from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Generates an exhaustive step-by-step breakdown of the Luhn operation
 * for educational and debugging visualization.
 */
export function getLuhnBreakdown(rawNumber) {
  const digits = sanitizeNumber(rawNumber);
  if (!digits) {
    return {
      isValid: false,
      digits: [],
      steps: [],
      totalSum: 0,
      remainder: 0,
      checkDigit: null,
      message: 'Ingresa al menos 2 dígitos para calcular la suma de verificación.'
    };
  }

  const steps = [];
  let totalSum = 0;
  const len = digits.length;

  // Moving from right to left:
  // Position 0 from right (i = len - 1) is NOT doubled (check digit)
  // Position 1 from right (i = len - 2) IS doubled
  for (let i = 0; i < len; i++) {
    const digit = parseInt(digits[i], 10);
    const posFromRight = len - 1 - i;
    const isDoubled = posFromRight % 2 === 1;
    const rawDoubled = isDoubled ? digit * 2 : digit;
    const reducedVal = rawDoubled > 9 ? rawDoubled - 9 : rawDoubled;
    const reductionNote = isDoubled && rawDoubled > 9 ? `${rawDoubled} → 1+${rawDoubled - 10} = ${reducedVal}` : null;

    steps.push({
      index: i,
      posFromRight,
      digit,
      isDoubled,
      rawDoubled,
      reducedVal,
      reductionNote,
      isCheckDigit: posFromRight === 0
    });
  }

  totalSum = steps.reduce((acc, step) => acc + step.reducedVal, 0);
  const remainder = totalSum % 10;
  const isValid = len >= 2 && remainder === 0;

  return {
    digits: digits.split('').map(Number),
    steps,
    totalSum,
    remainder,
    isValid,
    length: len,
    checkDigit: digits[len - 1]
  };
}

/**
 * Calculates the exact check digit for a given payload of N digits,
 * such that the full (N+1) digit sequence will pass the Luhn checksum.
 */
export function calculateRequiredCheckDigit(rawPartialNumber) {
  const digits = sanitizeNumber(rawPartialNumber);
  if (!digits) return null;

  // In the final (N+1)-digit number, the appended check digit will be at posFromRight = 0 (not doubled).
  // The rightmost digit of the payload (at index digits.length - 1) will be at posFromRight = 1 (DOUBLED).
  // The next one at posFromRight = 2 (NOT DOUBLED), and so on.
  let sum = 0;
  const steps = [];

  for (let i = digits.length - 1; i >= 0; i--) {
    const digit = parseInt(digits[i], 10);
    const posFromRightOfPartial = digits.length - 1 - i;
    const isDoubled = posFromRightOfPartial % 2 === 0; // First digit to left of check digit is doubled!
    const rawDoubled = isDoubled ? digit * 2 : digit;
    const reducedVal = rawDoubled > 9 ? rawDoubled - 9 : rawDoubled;

    sum += reducedVal;

    steps.unshift({
      digit,
      isDoubled,
      rawDoubled,
      reducedVal
    });
  }

  const remainder = sum % 10;
  // If sum % 10 is 0, check digit is 0. Otherwise 10 - remainder.
  const requiredCheckDigit = (10 - remainder) % 10;
  const fullNumber = digits + requiredCheckDigit;

  return {
    partialNumber: digits,
    partialSum: sum,
    remainder,
    requiredCheckDigit,
    fullNumber,
    verificationSum: sum + requiredCheckDigit,
    steps
  };
}
