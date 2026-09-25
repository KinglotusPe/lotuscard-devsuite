/**
 * Comprehensive Sandbox / Test Cards Catalog
 * Standard developer test cards documented by Stripe, Adyen, Braintree & payment networks.
 */

export const TEST_CARD_PRESETS = [
  {
    category: 'Stripe - Pasarela Oficial',
    cards: [
      {
        id: 'stripe-success',
        title: 'Cobro Exitoso (Success)',
        number: '4242424242424242',
        brand: 'Visa',
        status: 'success',
        statusText: 'Aprobado sin fricción',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        description: 'La tarjeta de prueba estándar por excelencia. Simula una transacción aprobada inmediatamente en modo test.',
        cvv: '123',
        expMonth: '12',
        expYearOffset: 3,
        gateway: 'Stripe'
      },
      {
        id: 'stripe-funds',
        title: 'Fondos Insuficientes (Insufficient Funds)',
        number: '4000000000000127',
        brand: 'Visa',
        status: 'warning',
        statusText: 'Declinada por saldo',
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        description: 'Simula el código de error `insufficient_funds`. Ideal para probar alertas al usuario en tu checkout.',
        cvv: '123',
        expMonth: '10',
        expYearOffset: 2,
        gateway: 'Stripe'
      },
      {
        id: 'stripe-3ds',
        title: 'Autenticación 3D Secure Requerida',
        number: '4000002760003184',
        brand: 'Visa',
        status: 'info',
        statusText: 'Requiere desafío 3DS',
        badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        description: 'Dispara el flujo SCA / 3D Secure interactivo (Strong Customer Authentication) con modal de verificación.',
        cvv: '123',
        expMonth: '08',
        expYearOffset: 2,
        gateway: 'Stripe'
      },
      {
        id: 'stripe-declined',
        title: 'Tarjeta Declinada Genérica (Card Declined)',
        number: '4000000000000002',
        brand: 'Visa',
        status: 'error',
        statusText: 'Declinada por el banco',
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        description: 'Simula la respuesta `generic_decline` emitida por el banco emisor emitiendo rechazo directo.',
        cvv: '123',
        expMonth: '11',
        expYearOffset: 1,
        gateway: 'Stripe'
      },
      {
        id: 'stripe-expired',
        title: 'Tarjeta Vencida (Expired Card)',
        number: '4000000000000069',
        brand: 'Visa',
        status: 'error',
        statusText: 'Fecha caducada',
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        description: 'Simula el rechazo `expired_card`. Útil para probar la expiración de medios de pago guardados.',
        cvv: '123',
        expMonth: '01',
        expYearOffset: -1, // Expired
        gateway: 'Stripe'
      },
      {
        id: 'stripe-incorrect-cvc',
        title: 'CVC / CVV Incorrecto',
        number: '4000000000000119',
        brand: 'Visa',
        status: 'warning',
        statusText: 'Fallo de CVC',
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        description: 'Simula el rechazo de seguridad `incorrect_cvc` cuando el código de validación no coincide.',
        cvv: '999',
        expMonth: '05',
        expYearOffset: 2,
        gateway: 'Stripe'
      },
      {
        id: 'stripe-lost-card',
        title: 'Tarjeta Reportada Perdida / Bloqueada',
        number: '4000000000000044',
        brand: 'Visa',
        status: 'error',
        statusText: 'Tarjeta perdida (Lost card)',
        badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        description: 'Simula el rechazo de seguridad por tarjeta extraviada o bloqueada preventivamente.',
        cvv: '123',
        expMonth: '09',
        expYearOffset: 2,
        gateway: 'Stripe'
      }
    ]
  },
  {
    category: 'Redes Bancarias Internacionales (Sandbox)',
    cards: [
      {
        id: 'visa-standard',
        title: 'Visa Clásica Sandbox',
        number: '4111111111111111',
        brand: 'Visa',
        status: 'success',
        statusText: 'Válida en Braintree / Adyen',
        badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        description: 'Tarjeta de pruebas universal Visa (BIN 411111) adoptada en sandbox por la mayoría de adquirentes.',
        cvv: '456',
        expMonth: '10',
        expYearOffset: 3,
        gateway: 'Universal'
      },
      {
        id: 'mastercard-standard',
        title: 'Mastercard Débito / Crédito Test',
        number: '5555555555554444',
        brand: 'Mastercard',
        status: 'success',
        statusText: 'Mastercard Oficial Test',
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        description: 'Tarjeta Mastercard de pruebas estándar compatible con 3DS2 y tokenización.',
        cvv: '789',
        expMonth: '11',
        expYearOffset: 3,
        gateway: 'Universal'
      },
      {
        id: 'amex-standard',
        title: 'American Express Test (15 Dígitos)',
        number: '378282246310005',
        brand: 'American Express',
        status: 'success',
        statusText: 'Formato 4-6-5 (CID 4 dígitos)',
        badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        description: 'Tarjeta Amex de 15 dígitos con CVV / CID frontal de 4 dígitos para validar espaciado y longitud.',
        cvv: '4321',
        expMonth: '04',
        expYearOffset: 4,
        gateway: 'Universal'
      },
      {
        id: 'discover-standard',
        title: 'Discover Network Test',
        number: '6011111111111117',
        brand: 'Discover',
        status: 'success',
        statusText: 'Red Discover (BIN 6011)',
        badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        description: 'Prueba de procesamiento en el riel de pagos Discover Card de 16 dígitos.',
        cvv: '321',
        expMonth: '07',
        expYearOffset: 2,
        gateway: 'Universal'
      },
      {
        id: 'jcb-standard',
        title: 'JCB International Test',
        number: '3528000000000007',
        brand: 'JCB',
        status: 'success',
        statusText: 'JCB Japón / Asia-Pacífico',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        description: 'Tarjeta JCB de 16 dígitos para verificar cobertura de métodos de pago internacionales.',
        cvv: '555',
        expMonth: '12',
        expYearOffset: 3,
        gateway: 'Universal'
      },
      {
        id: 'diners-standard',
        title: 'Diners Club (14 Dígitos)',
        number: '30000000000004',
        brand: 'Diners Club',
        status: 'success',
        statusText: '14 dígitos (BIN 3000)',
        badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        description: 'Tarjeta Diners Club International con longitud especial de 14 dígitos.',
        cvv: '888',
        expMonth: '06',
        expYearOffset: 2,
        gateway: 'Universal'
      }
    ]
  }
];

/**
 * Returns preset by id
 */
export function getPresetById(id) {
  for (const group of TEST_CARD_PRESETS) {
    const found = group.cards.find(c => c.id === id);
    if (found) return found;
  }
  return null;
}
