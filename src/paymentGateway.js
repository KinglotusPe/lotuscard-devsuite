/**
 * Payment Gateway & Terminal Simulator
 * Simulates Stripe, Adyen & Visa Direct checkout authorization processing
 * with 3D Secure challenges, decline reason codes, and authentic JSON responses.
 */

import { isValidLuhn, detectBrand, sanitizeNumber } from './luhn.js';
import { lookupBin } from './binDatabase.js';
import { sound } from './sound.js';

export function simulateGatewayTransaction({
  cardNumber,
  cardHolder = 'DEV TESTER',
  expMonth = '12',
  expYear = '28',
  cvv = '123',
  amount = 2500, // $25.00
  currency = 'USD'
}) {
  const digits = sanitizeNumber(cardNumber);
  const brand = detectBrand(digits);
  const binInfo = lookupBin(digits);

  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date();
      const chargeId = `ch_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
      const authCode = Math.floor(100000 + Math.random() * 900000).toString();

      // 1. Check if Luhn is invalid
      if (!isValidLuhn(digits)) {
        sound.playDeclineBuzz();
        return resolve({
          httpStatus: 402,
          status: 'failed',
          declineCode: 'card_declined_luhn',
          title: 'Tarjeta Declinada (Luhn Inválido)',
          message: 'El número de tarjeta no supera la comprobación matemática de suma de verificación de la red.',
          requires3DS: false,
          chargeId,
          json: {
            id: chargeId,
            object: 'charge',
            amount,
            currency: currency.toLowerCase(),
            status: 'failed',
            failure_code: 'card_declined',
            failure_message: 'The card number checksum is invalid.',
            outcome: {
              network_status: 'declined_by_network',
              reason: 'invalid_number',
              risk_level: 'elevated',
              seller_message: 'The card was declined because the card number is invalid.'
            },
            payment_method_details: {
              card: {
                brand: brand.id,
                last4: digits.slice(-4) || '0000',
                funding: binInfo?.type === 'Débito' ? 'debit' : 'credit',
                checks: { cvc_check: 'unavailable' }
              }
            }
          }
        });
      }

      // 2. Specific Stripe sandbox triggers
      if (digits === '4000002760003184' || digits === '4000000000003063') {
        // 3D Secure / SCA Challenge required
        return resolve({
          httpStatus: 202,
          status: 'requires_action',
          declineCode: 'authentication_required',
          title: 'Autenticación 3D Secure Requerida (SCA)',
          message: 'El banco emisor solicita verificación en dos pasos (3DS2) del titular antes de procesar el cobro.',
          requires3DS: true,
          chargeId,
          json: {
            id: chargeId,
            object: 'charge',
            amount,
            currency: currency.toLowerCase(),
            status: 'pending',
            next_action: {
              type: 'use_stripe_sdk',
              use_stripe_sdk: {
                type: 'three_d_secure_redirect',
                stripe_js: 'https://hooks.stripe.com/redirect/authenticate/src_test3ds'
              }
            },
            outcome: {
              network_status: 'action_required',
              reason: 'authentication_required',
              seller_message: 'The payment requires 3DS customer action.'
            }
          }
        });
      }

      if (digits === '4000000000000127') {
        sound.playDeclineBuzz();
        return resolve({
          httpStatus: 402,
          status: 'failed',
          declineCode: 'insufficient_funds',
          title: 'Fondos Insuficientes',
          message: 'La transacción fue rechazada por el banco emisor debido a saldo insuficiente en la cuenta asociada.',
          requires3DS: false,
          chargeId,
          json: {
            id: chargeId,
            object: 'charge',
            amount,
            currency: currency.toLowerCase(),
            status: 'failed',
            failure_code: 'insufficient_funds',
            failure_message: 'Your card has insufficient funds.',
            outcome: {
              network_status: 'declined_by_network',
              reason: 'insufficient_funds',
              seller_message: 'The card has insufficient funds to complete the purchase.'
            }
          }
        });
      }

      if (digits === '4000000000000069') {
        sound.playDeclineBuzz();
        return resolve({
          httpStatus: 402,
          status: 'failed',
          declineCode: 'expired_card',
          title: 'Tarjeta Caducada / Vencida',
          message: 'La fecha de expiración indicada corresponde a un plástico que ya caducó en los registros bancarios.',
          requires3DS: false,
          chargeId,
          json: {
            id: chargeId,
            object: 'charge',
            amount,
            currency: currency.toLowerCase(),
            status: 'failed',
            failure_code: 'expired_card',
            failure_message: 'Your card has expired.'
          }
        });
      }

      if (digits === '4000000000000119') {
        sound.playDeclineBuzz();
        return resolve({
          httpStatus: 402,
          status: 'failed',
          declineCode: 'incorrect_cvc',
          title: 'Código CVC / CVV Incorrecto',
          message: 'El código de seguridad de 3 o 4 dígitos no coincide con el criptograma del emisor.',
          requires3DS: false,
          chargeId,
          json: {
            id: chargeId,
            object: 'charge',
            amount,
            currency: currency.toLowerCase(),
            status: 'failed',
            failure_code: 'incorrect_cvc',
            failure_message: 'Your card security code is incorrect.'
          }
        });
      }

      if (digits === '4000000000000044') {
        sound.playDeclineBuzz();
        return resolve({
          httpStatus: 402,
          status: 'failed',
          declineCode: 'lost_card',
          title: 'Tarjeta Reportada Perdida / Bloqueada',
          message: 'El emisor reporta la cuenta como extraviada o retenida con orden de bloqueo preventivo.',
          requires3DS: false,
          chargeId,
          json: {
            id: chargeId,
            object: 'charge',
            amount,
            currency: currency.toLowerCase(),
            status: 'failed',
            failure_code: 'lost_card',
            failure_message: 'The card has been reported lost.'
          }
        });
      }

      if (digits === '4000000000000002') {
        sound.playDeclineBuzz();
        return resolve({
          httpStatus: 402,
          status: 'failed',
          declineCode: 'card_declined',
          title: 'Tarjeta Declinada (Generic Decline)',
          message: 'El emisor bancario denegó la autorización sin especificar la causa interna.',
          requires3DS: false,
          chargeId,
          json: {
            id: chargeId,
            object: 'charge',
            amount,
            currency: currency.toLowerCase(),
            status: 'failed',
            failure_code: 'card_declined',
            failure_message: 'Your card was declined.'
          }
        });
      }

      // Default: Successful payment authorization
      sound.playSuccessChime();
      return resolve({
        httpStatus: 200,
        status: 'succeeded',
        declineCode: null,
        title: 'Cobro Aprobado Exitosamente (200 OK)',
        message: 'La pasarela autorizó y liquidó los fondos en modo Sandbox sin fricción.',
        requires3DS: false,
        chargeId,
        authCode,
        json: {
          id: chargeId,
          object: 'charge',
          amount,
          amount_captured: amount,
          currency: currency.toLowerCase(),
          status: 'succeeded',
          paid: true,
          livemode: false,
          captured: true,
          authorization_code: authCode,
          billing_details: {
            name: cardHolder
          },
          outcome: {
            network_status: 'approved_by_network',
            risk_level: 'normal',
            risk_score: 5,
            seller_message: 'Payment complete.'
          },
          payment_method_details: {
            type: 'card',
            card: {
              brand: brand.id,
              country: binInfo?.countryCode || 'US',
              funding: binInfo?.type === 'Débito' ? 'debit' : 'credit',
              last4: digits.slice(-4),
              exp_month: parseInt(expMonth, 10),
              exp_year: parseInt(expYear.length === 2 ? '20' + expYear : expYear, 10),
              checks: {
                cvc_check: 'pass',
                address_postal_code_check: 'pass'
              },
              issuer: binInfo?.bank || 'Banco de Pruebas'
            }
          }
        }
      });
    }, 1100);
  });
}
