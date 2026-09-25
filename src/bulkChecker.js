/**
 * Bulk Card Checker Module
 * Inspired by checkerV2-CC (AvastrOficial)
 * Validates batches of cards (Luhn, expiration dates, CVV integrity, brand identification).
 */

import { isValidLuhn, detectBrand, sanitizeNumber } from './luhn.js';

/**
 * Parses a single input line supporting multiple delimiters (| / , ; space)
 */
export function parseCardLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Split by common delimiters: |, ;, /, or spaces
  let parts = trimmed.split(/[|;,/\s]+/).filter(Boolean);

  if (parts.length === 0) return null;

  const rawNumber = sanitizeNumber(parts[0]);
  let month = parts[1] ? sanitizeNumber(parts[1]) : null;
  let year = parts[2] ? sanitizeNumber(parts[2]) : null;
  let cvv = parts[3] ? sanitizeNumber(parts[3]) : null;

  // Normalize month & year if formatted like MMYY
  if (parts.length === 2 && parts[1].length === 4) {
    month = parts[1].slice(0, 2);
    year = parts[1].slice(2, 4);
  }

  // Format 2-digit year to 4-digit year
  let fullYear = year;
  if (year && year.length === 2) {
    fullYear = '20' + year;
  }

  return {
    originalLine: trimmed,
    number: rawNumber,
    month: month ? month.padStart(2, '0') : null,
    year: fullYear,
    yearShort: year ? year.slice(-2) : null,
    cvv: cvv || null
  };
}

/**
 * Evaluates card validity against Luhn, expiration date, and CVV format
 */
export function evaluateCard(parsed) {
  if (!parsed || !parsed.number) {
    return {
      status: 'die',
      statusText: 'Sin número',
      reason: 'No se detectó número de tarjeta',
      card: parsed
    };
  }

  const { number, month, year, cvv } = parsed;
  const brand = detectBrand(number);
  const luhnValid = isValidLuhn(number);

  // Check Luhn
  if (!luhnValid) {
    return {
      status: 'die',
      statusText: 'Checksum Inválido (Die)',
      reason: 'Falló el algoritmo de Luhn (Mod 10)',
      brand,
      card: parsed
    };
  }

  // Check length against brand
  if (!brand.lengths.includes(number.length)) {
    return {
      status: 'die',
      statusText: 'Longitud Inválida',
      reason: `Longitud de ${number.length} dígitos no corresponde a ${brand.name}`,
      brand,
      card: parsed
    };
  }

  // Check Expiration Date if provided
  let isExpired = false;
  if (month && year) {
    const expM = parseInt(month, 10);
    const expY = parseInt(year, 10);
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1; // 1-12

    if (expM < 1 || expM > 12) {
      return {
        status: 'warning',
        statusText: 'Mes Inválido',
        reason: `Mes ${month} fuera de rango (01-12)`,
        brand,
        card: parsed
      };
    }

    if (expY < curYear || (expY === curYear && expM < curMonth)) {
      isExpired = true;
    }
  }

  if (isExpired) {
    return {
      status: 'warning',
      statusText: 'Tarjeta Caducada',
      reason: `Fecha vencida (${month}/${year})`,
      brand,
      card: parsed
    };
  }

  // Check CVV length if provided
  if (cvv) {
    const expectedCvvLen = brand.id === 'amex' ? 4 : 3;
    if (cvv.length !== expectedCvvLen) {
      return {
        status: 'warning',
        statusText: 'CVV Dudoso',
        reason: `CVV tiene ${cvv.length} dígitos (esperado: ${expectedCvvLen} para ${brand.name})`,
        brand,
        card: parsed
      };
    }
  }

  return {
    status: 'live',
    statusText: 'Aprobada (Live / Válida)',
    reason: `Luhn OK • ${brand.name} • ${month && year ? `${month}/${year}` : 'Sin fecha'}`,
    brand,
    card: parsed
  };
}

/**
 * Runs bulk verification on a raw text input with a progress callback
 */
export async function runBulkCheck(rawInput, onProgress) {
  const lines = rawInput
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const results = {
    total: lines.length,
    processed: 0,
    live: [],
    die: [],
    warning: []
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parsed = parseCardLine(line);
    const evaluation = evaluateCard(parsed);

    if (evaluation.status === 'live') {
      results.live.push(evaluation);
    } else if (evaluation.status === 'warning') {
      results.warning.push(evaluation);
    } else {
      results.die.push(evaluation);
    }

    results.processed = i + 1;

    if (onProgress) {
      onProgress({
        current: i + 1,
        total: lines.length,
        percentage: Math.round(((i + 1) / lines.length) * 100),
        liveCount: results.live.length,
        dieCount: results.die.length,
        warningCount: results.warning.length,
        latest: evaluation
      });
    }

    // Yield back to event loop for smooth UI rendering if list is large
    if (lines.length > 20 && i % 15 === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
  }

  return results;
}
