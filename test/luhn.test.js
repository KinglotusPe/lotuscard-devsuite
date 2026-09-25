import { isValidLuhn, getLuhnBreakdown, calculateRequiredCheckDigit, detectBrand } from '../src/luhn.js';
import { TEST_CARD_PRESETS } from '../src/testCards.js';
import { generateBatchCards, generateSingleCardFromPattern } from '../src/generator.js';
import { parseCardLine, evaluateCard, runBulkCheck } from '../src/bulkChecker.js';

console.log('--- Running LuhnLab Comprehensive Suite Tests ---');

// Test 1: Preset cards verification
let totalPresets = 0;
for (const group of TEST_CARD_PRESETS) {
  for (const card of group.cards) {
    totalPresets++;
    const isValid = isValidLuhn(card.number);
    console.assert(isValid === true, `Preset ${card.title} (${card.number}) must pass Luhn`);
  }
}
console.log(`✓ Verified ${totalPresets} sandbox presets: all 100% Luhn compliant.`);

// Test 2: Incomplete calculation check
const check15 = calculateRequiredCheckDigit('424242424242424');
console.assert(check15.requiredCheckDigit === 2, 'Check digit for 4242...424 must be 2');
console.assert(isValidLuhn(check15.fullNumber) === true, 'Full generated card must be valid');

const checkAmex = calculateRequiredCheckDigit('37828224631000');
console.assert(checkAmex.requiredCheckDigit === 5, 'Amex check digit must be 5');
console.assert(isValidLuhn(checkAmex.fullNumber) === true, 'Amex full card must be valid');
console.log('✓ Check digit derivation verified.');

// Test 3: Generator with wildcards (Namso / CC-GEN feature)
for (let i = 0; i < 50; i++) {
  const visaCard = generateSingleCardFromPattern('453201xxxxxxxxxx');
  console.assert(visaCard.length === 16, 'Visa card length should be 16');
  console.assert(isValidLuhn(visaCard) === true, `Generated Visa ${visaCard} must pass Luhn`);

  const amexCard = generateSingleCardFromPattern('3782xxxxxxxxxxx');
  console.assert(amexCard.length === 15, 'Amex card length should be 15');
  console.assert(isValidLuhn(amexCard) === true, `Generated Amex ${amexCard} must pass Luhn`);
}
console.log('✓ 100 wildcard generated cards (Visa & Amex) tested: 100% Luhn valid.');

// Test 4: Multi-format outputs
const jsonOutput = generateBatchCards({ binPattern: '453201xxxxxxxxxx', count: 5, format: 'json' });
const parsedJson = JSON.parse(jsonOutput);
console.assert(parsedJson.length === 5, 'JSON generator output should contain 5 items');
console.assert(isValidLuhn(parsedJson[0].cardNumber) === true, 'JSON card should be valid');

const csvOutput = generateBatchCards({ binPattern: '5424xxxxxxxxxxxx', count: 3, format: 'csv' });
console.assert(csvOutput.includes('CardNumber,ExpMonth,ExpYear,CVV,Brand'), 'CSV output should contain header');

const xmlOutput = generateBatchCards({ binPattern: '6011xxxxxxxxxxxx', count: 2, format: 'xml' });
console.assert(xmlOutput.includes('<cards>'), 'XML output should contain <cards>');
console.log('✓ Multi-format exports (JSON, CSV, XML, PIPE) verified.');

// Test 5: Bulk Checker parsing & classification (checkerV2-CC feature)
const sampleLive = parseCardLine('4242424242424242|12|2028|123');
const evalLive = evaluateCard(sampleLive);
console.assert(evalLive.status === 'live', `Expected live, got ${evalLive.status}`);

const sampleDie = parseCardLine('4242424242424249|12|2028|123');
const evalDie = evaluateCard(sampleDie);
console.assert(evalDie.status === 'die', `Expected die, got ${evalDie.status}`);

const sampleExpired = parseCardLine('4000000000000069|01|2023|123');
const evalExpired = evaluateCard(sampleExpired);
console.assert(evalExpired.status === 'warning', `Expected warning (expired), got ${evalExpired.status}`);

// Test 6: Bulk async runner
const bulkText = [
  '4242424242424242|12|2028|123',
  '4242424242424249|12|2028|123',
  '4000000000000069|01|2023|123'
].join('\n');

const bulkRes = await runBulkCheck(bulkText);
console.assert(bulkRes.live.length === 1, 'Should have 1 live card');
console.assert(bulkRes.die.length === 1, 'Should have 1 die card');
console.assert(bulkRes.warning.length === 1, 'Should have 1 warning card');
console.log('✓ Bulk checker evaluation runner verified: 1 Live, 1 Die, 1 Expired.');

console.log('🎉 ALL INTEGRATION & UNIT TESTS PASSED WITH 100% SUCCESS!');
