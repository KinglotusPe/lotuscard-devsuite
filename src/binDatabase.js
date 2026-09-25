/**
 * Comprehensive Offline BIN / IIN (Issuer Identification Number) Database
 * Realistic metadata for credit and debit cards globally.
 */

export const BIN_DATABASE = [
  // Stripe Sandbox
  { prefix: '424242', bank: 'Stripe Test Payments', country: 'Estados Unidos', countryCode: 'US', flag: '🇺🇸', type: 'Crédito', tier: 'Sandbox Visa', currency: 'USD' },
  { prefix: '400000', bank: 'Stripe Test Simulator', country: 'Estados Unidos', countryCode: 'US', flag: '🇺🇸', type: 'Crédito', tier: 'Sandbox Visa', currency: 'USD' },
  { prefix: '411111', bank: 'Universal Test Network', country: 'Estados Unidos', countryCode: 'US', flag: '🇺🇸', type: 'Crédito', tier: 'Classic Visa', currency: 'USD' },
  { prefix: '555555', bank: 'Universal Test Network', country: 'Estados Unidos', countryCode: 'US', flag: '🇺🇸', type: 'Débito', tier: 'World Mastercard', currency: 'USD' },

  // USA Major Banks
  { prefix: '453201', bank: 'JPMorgan Chase Bank', country: 'Estados Unidos', countryCode: 'US', flag: '🇺🇸', type: 'Crédito', tier: 'Visa Signature Sapphire', currency: 'USD' },
  { prefix: '402400', bank: 'Bank of America', country: 'Estados Unidos', countryCode: 'US', flag: '🇺🇸', type: 'Crédito', tier: 'Visa Platinum Rewards', currency: 'USD' },
  { prefix: '474412', bank: 'Wells Fargo Bank', country: 'Estados Unidos', countryCode: 'US', flag: '🇺🇸', type: 'Débito', tier: 'Visa Debit Gold', currency: 'USD' },
  { prefix: '542418', bank: 'Citibank N.A.', country: 'Estados Unidos', countryCode: 'US', flag: '🇺🇸', type: 'Crédito', tier: 'Mastercard World Elite', currency: 'USD' },
  { prefix: '517805', bank: 'Capital One', country: 'Estados Unidos', countryCode: 'US', flag: '🇺🇸', type: 'Crédito', tier: 'Mastercard Quicksilver', currency: 'USD' },
  { prefix: '378282', bank: 'American Express Centurion', country: 'Estados Unidos', countryCode: 'US', flag: '🇺🇸', type: 'Crédito', tier: 'Amex Platinum Card', currency: 'USD' },
  { prefix: '340000', bank: 'American Express Corp', country: 'Estados Unidos', countryCode: 'US', flag: '🇺🇸', type: 'Crédito', tier: 'Amex Green Corporate', currency: 'USD' },
  { prefix: '601111', bank: 'Discover Financial', country: 'Estados Unidos', countryCode: 'US', flag: '🇺🇸', type: 'Crédito', tier: 'Discover it Cashback', currency: 'USD' },

  // México & Latin America
  { prefix: '415231', bank: 'BBVA México', country: 'México', countryCode: 'MX', flag: '🇲🇽', type: 'Débito', tier: 'Visa Electrón Libretón', currency: 'MXN' },
  { prefix: '455584', bank: 'BBVA México', country: 'México', countryCode: 'MX', flag: '🇲🇽', type: 'Crédito', tier: 'Visa Oro Internacional', currency: 'MXN' },
  { prefix: '557907', bank: 'Santander México', country: 'México', countryCode: 'MX', flag: '🇲🇽', type: 'Crédito', tier: 'Mastercard Fiesta Rewards', currency: 'MXN' },
  { prefix: '525678', bank: 'Citibanamex', country: 'México', countryCode: 'MX', flag: '🇲🇽', type: 'Crédito', tier: 'Mastercard Clásica', currency: 'MXN' },
  { prefix: '539958', bank: 'Nu México (Nubank)', country: 'México', countryCode: 'MX', flag: '🇲🇽', type: 'Crédito', tier: 'Mastercard Gold Contactless', currency: 'MXN' },
  { prefix: '491566', bank: 'Bancolombia', country: 'Colombia', countryCode: 'CO', flag: '🇨🇴', type: 'Débito', tier: 'Visa Débito Maestro', currency: 'COP' },

  // España & Europa
  { prefix: '454881', bank: 'Banco Santander', country: 'España', countryCode: 'ES', flag: '🇪🇸', type: 'Crédito', tier: 'Visa Platinum Smart', currency: 'EUR' },
  { prefix: '427631', bank: 'CaixaBank', country: 'España', countryCode: 'ES', flag: '🇪🇸', type: 'Débito', tier: 'Visa contactless Gold', currency: 'EUR' },
  { prefix: '516010', bank: 'BBVA España', country: 'España', countryCode: 'ES', flag: '🇪🇸', type: 'Crédito', tier: 'Mastercard Negocios', currency: 'EUR' },
  { prefix: '492985', bank: 'Barclays Bank UK', country: 'Reino Unido', countryCode: 'GB', flag: '🇬🇧', type: 'Crédito', tier: 'Barclaycard Visa Rewards', currency: 'GBP' },
  { prefix: '543460', bank: 'HSBC Bank PLC', country: 'Reino Unido', countryCode: 'GB', flag: '🇬🇧', type: 'Crédito', tier: 'Mastercard Premier', currency: 'GBP' },
  { prefix: '535282', bank: 'Revolut Ltd', country: 'Reino Unido', countryCode: 'GB', flag: '🇬🇧', type: 'Prepagada', tier: 'Mastercard Metal Ultra', currency: 'EUR' },

  // Asia / Internacional
  { prefix: '352800', bank: 'JCB International', country: 'Japón', countryCode: 'JP', flag: '🇯🇵', type: 'Crédito', tier: 'JCB The Class Platinum', currency: 'JPY' },
  { prefix: '300000', bank: 'Diners Club International', country: 'Estados Unidos', countryCode: 'US', flag: '🇺🇸', type: 'Crédito', tier: 'Diners Club Carte Blanche', currency: 'USD' }
];

/**
 * Looks up bank and issuing details for a card number or BIN prefix
 */
export function lookupBin(rawNumber) {
  const digits = String(rawNumber || '').replace(/\D/g, '');
  if (digits.length < 6) {
    return null;
  }

  const prefix6 = digits.slice(0, 6);
  const found = BIN_DATABASE.find(b => prefix6.startsWith(b.prefix));
  if (found) return found;

  // Generic fallback inference
  if (digits.startsWith('4')) {
    return { bank: 'Red Emisora Visa', country: 'Internacional', countryCode: 'GLOBAL', flag: '🌐', type: 'Crédito / Débito', tier: 'Visa Classic Standard', currency: 'USD' };
  } else if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) {
    return { bank: 'Red Emisora Mastercard', country: 'Internacional', countryCode: 'GLOBAL', flag: '🌐', type: 'Crédito / Débito', tier: 'Mastercard Standard', currency: 'USD' };
  } else if (/^3[47]/.test(digits)) {
    return { bank: 'American Express Network', country: 'Estados Unidos', countryCode: 'US', flag: '🇺🇸', type: 'Crédito', tier: 'Amex Member', currency: 'USD' };
  } else if (/^6011/.test(digits) || /^65/.test(digits)) {
    return { bank: 'Discover Financial Services', country: 'Estados Unidos', countryCode: 'US', flag: '🇺🇸', type: 'Crédito', tier: 'Discover Network Card', currency: 'USD' };
  } else if (/^35/.test(digits)) {
    return { bank: 'JCB International Co.', country: 'Japón', countryCode: 'JP', flag: '🇯🇵', type: 'Crédito', tier: 'JCB Standard Card', currency: 'JPY' };
  } else if (/^30/.test(digits) || /^36/.test(digits) || /^38/.test(digits)) {
    return { bank: 'Diners Club International', country: 'Estados Unidos', countryCode: 'US', flag: '🇺🇸', type: 'Crédito', tier: 'Diners Club Classic', currency: 'USD' };
  }

  return { bank: 'Institución Financiera No Especificada', country: 'Global', countryCode: 'GLOBAL', flag: '🌐', type: 'Estándar', tier: 'ISO/IEC 7812', currency: 'USD' };
}
