/**
 * LotusGen Synthetic Engine
 * Algorithmic card generator with PRNG entropy and precise Luhn check digit derivation.
 * Created for LotusCard DevSuite // Kinglotusp (El Reyno de Loto).
 */

import { detectBrand, CARD_BRANDS, sanitizeNumber } from './luhn.js';

// Pre-allocated crypto buffer for fast, non-blocking random generation
const RANDOM_BUFFER_SIZE = 512;
const randomBuffer = new Uint32Array(RANDOM_BUFFER_SIZE);
let randomBufferIndex = RANDOM_BUFFER_SIZE;

/**
 * Cryptographically secure integer generator [0, max)
 */
export function secureRandomInt(max) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    if (randomBufferIndex >= RANDOM_BUFFER_SIZE) {
      window.crypto.getRandomValues(randomBuffer);
      randomBufferIndex = 0;
    }
    const val = randomBuffer[randomBufferIndex++];
    return Math.floor((val / 0x100000000) * max);
  }
  return Math.floor(Math.random() * max);
}

/**
 * Returns random digit 0-9
 */
export function randomDigit() {
  return secureRandomInt(10);
}

/**
 * Generates valid CVV for given brand or BIN
 */
export function generateCVV(binOrBrand) {
  const isAmex = typeof binOrBrand === 'string' 
    ? /^3[47]/.test(binOrBrand) 
    : binOrBrand?.id === 'amex';
  const length = isAmex ? 4 : 3;
  let cvv = '';
  for (let i = 0; i < length; i++) {
    cvv += randomDigit();
  }
  return cvv;
}

/**
 * Generates random future expiration month and year
 */
export function generateRandomExpiry(minYearOffset = 2, maxYearOffset = 5) {
  const month = (secureRandomInt(12) + 1).toString().padStart(2, '0');
  const currentYear = new Date().getFullYear();
  const yearOffset = minYearOffset + secureRandomInt(maxYearOffset - minYearOffset + 1);
  const year = (currentYear + yearOffset).toString();
  return { month, year, yearShort: year.slice(-2) };
}

/**
 * Common BIN Presets for quick generation
 */
export const BIN_PRESETS = [
  { name: 'Visa Classic (4532)', bin: '453201xxxxxxxxxx', brand: 'Visa' },
  { name: 'Visa Gold (4024)', bin: '40240071xxxxxxxx', brand: 'Visa' },
  { name: 'Mastercard Standard (5424)', bin: '542418xxxxxxxxxx', brand: 'Mastercard' },
  { name: 'Mastercard 2-series (2221)', bin: '222100xxxxxxxxxx', brand: 'Mastercard' },
  { name: 'American Express (3782)', bin: '378282xxxxxxxxx', brand: 'American Express' },
  { name: 'Discover Global (6011)', bin: '601111xxxxxxxxxx', brand: 'Discover' },
  { name: 'JCB International (3528)', bin: '352800xxxxxxxxxx', brand: 'JCB' },
  { name: 'Diners Club (3000)', bin: '300000xxxxxxxx', brand: 'Diners Club' },
];

/**
 * Generates a single valid card number following a BIN pattern with wildcard 'x'/'X'
 */
export function generateSingleCardFromPattern(binPattern) {
  const cleaned = (binPattern || '').trim();
  const brand = detectBrand(cleaned);
  
  let targetLength = 16;
  if (brand.id === 'amex') targetLength = 15;
  else if (brand.id === 'diners') targetLength = 14;

  const payloadLength = targetLength - 1; // Last digit is check digit
  const digits = [];

  for (let i = 0; i < cleaned.length && digits.length < payloadLength; i++) {
    const char = cleaned[i];
    if (char === 'x' || char === 'X') {
      digits.push(randomDigit());
    } else if (/\d/.test(char)) {
      digits.push(parseInt(char, 10));
    }
  }

  // If shorter than payloadLength, pad with random digits
  while (digits.length < payloadLength) {
    digits.push(randomDigit());
  }

  // Calculate check digit using Luhn Mod 10
  let sum = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];
    const posFromRightOfPartial = digits.length - 1 - i;
    // In final card, check digit is pos 0 (not doubled).
    // The rightmost payload digit (pos 0 here) will be at pos 1 (doubled).
    if (posFromRightOfPartial % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  const remainder = sum % 10;
  const checkDigit = (10 - remainder) % 10;
  digits.push(checkDigit);

  return digits.join('');
}

/**
 * Generates a batch of test cards with custom options
 */
export function generateBatchCards({
  binPattern = '453201xxxxxxxxxx',
  count = 10,
  expMonth = 'rnd',
  expYear = 'rnd',
  cvv = 'rnd',
  separator = '|',
  includeBrand = false,
  format = 'pipe' // 'pipe' | 'json' | 'csv' | 'xml'
}) {
  const sanitizedCount = Math.min(Math.max(parseInt(count, 10) || 10, 1), 100);
  const cards = [];
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < sanitizedCount; i++) {
    const cardNumber = generateSingleCardFromPattern(binPattern);
    const brand = detectBrand(cardNumber);

    // Month
    let month = expMonth;
    if (month === 'rnd' || !month) {
      month = (secureRandomInt(12) + 1).toString().padStart(2, '0');
    }

    // Year
    let year = expYear;
    if (year === 'rnd' || !year) {
      const offset = 2 + secureRandomInt(4);
      year = (currentYear + offset).toString();
    } else if (year.length === 2) {
      year = '20' + year;
    }

    // CVV
    let finalCvv = cvv;
    if (finalCvv === 'rnd' || !finalCvv) {
      finalCvv = generateCVV(brand);
    }

    cards.push({
      cardNumber,
      month,
      year,
      cvv: finalCvv,
      brand: brand.name
    });
  }

  // Format outputs
  if (format === 'json') {
    return JSON.stringify(cards, null, 2);
  }

  if (format === 'csv') {
    const header = 'CardNumber,ExpMonth,ExpYear,CVV,Brand\n';
    const rows = cards.map(c => `${c.cardNumber},${c.month},${c.year},${c.cvv},${c.brand}`).join('\n');
    return header + rows;
  }

  if (format === 'xml') {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<cards>\n';
    cards.forEach(c => {
      xml += `  <card>\n    <number>${c.cardNumber}</number>\n    <month>${c.month}</month>\n    <year>${c.year}</year>\n    <cvv>${c.cvv}</cvv>\n    <brand>${c.brand}</brand>\n  </card>\n`;
    });
    xml += '</cards>';
    return xml;
  }

  // Default PIPE format: CARD|MM|YYYY|CVV
  return cards.map(c => {
    let line = `${c.cardNumber}${separator}${c.month}${separator}${c.year}${separator}${c.cvv}`;
    if (includeBrand) {
      line += `${separator}${c.brand}`;
    }
    return line;
  }).join('\n');
}

/**
 * Saves generation session into localStorage history
 */
export function saveGenerationToHistory(bin, count, format) {
  try {
    const raw = localStorage.getItem('luhnlab_gen_history');
    const history = raw ? JSON.parse(raw) : [];
    history.unshift({
      timestamp: new Date().toLocaleTimeString(),
      bin,
      count,
      format
    });
    if (history.length > 8) history.pop();
    localStorage.setItem('luhnlab_gen_history', JSON.stringify(history));
  } catch (e) {
    // Ignore storage quota
  }
}

/**
 * Retrieves generation history
 */
export function getGenerationHistory() {
  try {
    const raw = localStorage.getItem('luhnlab_gen_history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
