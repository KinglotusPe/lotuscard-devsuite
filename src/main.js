import './style.css';
import confetti from 'canvas-confetti';
import { 
  isValidLuhn, 
  getLuhnBreakdown, 
  calculateRequiredCheckDigit, 
  detectBrand, 
  formatCardNumber, 
  sanitizeNumber,
  CARD_BRANDS 
} from './luhn.js';
import { TEST_CARD_PRESETS } from './testCards.js';
import { BRAND_LOGOS, CHIP_SVG, CONTACTLESS_SVG } from './cardLogos.js';
import { generateBatchCards } from './generator.js';
import { runBulkCheck, parseCardLine } from './bulkChecker.js';
import { lookupBin } from './binDatabase.js';
import { sound } from './sound.js';
import { simulateGatewayTransaction } from './paymentGateway.js';

// DOM Element References
const dom = {
  // Sound
  btnToggleSound: document.getElementById('btnToggleSound'),
  soundIconOn: document.getElementById('soundIconOn'),
  soundIconOff: document.getElementById('soundIconOff'),

  // Card Mockup Elements
  cardContainer: document.getElementById('cardContainer'),
  cardInner: document.getElementById('cardInner'),
  cardFront: document.getElementById('cardFront'),
  cardGlare: document.getElementById('cardGlare'),
  cardChipContainer: document.getElementById('cardChipContainer'),
  cardContactlessContainer: document.getElementById('cardContactlessContainer'),
  cardBrandLogo: document.getElementById('cardBrandLogo'),
  cardBackLogoMini: document.getElementById('cardBackLogoMini'),
  cardDisplayNumber: document.getElementById('cardDisplayNumber'),
  cardDisplayHolder: document.getElementById('cardDisplayHolder'),
  cardDisplayExpiry: document.getElementById('cardDisplayExpiry'),
  cardDisplayCVV: document.getElementById('cardDisplayCVV'),
  btnFlipCard: document.getElementById('btnFlipCard'),

  // BIN Info Box
  binInfoBox: document.getElementById('binInfoBox'),
  binBankName: document.getElementById('binBankName'),
  binCountryFlag: document.getElementById('binCountryFlag'),
  binBankText: document.getElementById('binBankText'),
  binCardTypeBadge: document.getElementById('binCardTypeBadge'),
  binTierText: document.getElementById('binTierText'),
  binCountryCurrency: document.getElementById('binCountryCurrency'),

  // Checkout Simulator Inputs
  inputCardNumber: document.getElementById('inputCardNumber'),
  btnPasteCardNumber: document.getElementById('btnPasteCardNumber'),
  panLengthBadge: document.getElementById('panLengthBadge'),
  inputCardHolder: document.getElementById('inputCardHolder'),
  selectExpMonth: document.getElementById('selectExpMonth'),
  selectExpYear: document.getElementById('selectExpYear'),
  inputCVV: document.getElementById('inputCVV'),
  cvvHint: document.getElementById('cvvHint'),
  btnSimulateTerminalCharge: document.getElementById('btnSimulateTerminalCharge'),
  btnCopyFullCheckout: document.getElementById('btnCopyFullCheckout'),
  btnSimulateSubmit: document.getElementById('btnSimulateSubmit'),
  btnResetAll: document.getElementById('btnResetAll'),

  // Tabs
  tabBtnValidator: document.getElementById('tabBtnValidator'),
  tabBtnGenerator: document.getElementById('tabBtnGenerator'),
  tabBtnBulkChecker: document.getElementById('tabBtnBulkChecker'),
  tabBtnCheckDigit: document.getElementById('tabBtnCheckDigit'),
  tabBtnSandbox: document.getElementById('tabBtnSandbox'),
  tabContentValidator: document.getElementById('tabContentValidator'),
  tabContentGenerator: document.getElementById('tabContentGenerator'),
  tabContentBulkChecker: document.getElementById('tabContentBulkChecker'),
  tabContentCheckDigit: document.getElementById('tabContentCheckDigit'),
  tabContentSandbox: document.getElementById('tabContentSandbox'),

  // Validator Tab Elements
  luhnStatusBanner: document.getElementById('luhnStatusBanner'),
  formulaSumValue: document.getElementById('formulaSumValue'),
  formulaRemainderValue: document.getElementById('formulaRemainderValue'),
  formulaEvaluationBadge: document.getElementById('formulaEvaluationBadge'),
  breakdownGrid: document.getElementById('breakdownGrid'),

  // Generator Tab Elements
  genBinPattern: document.getElementById('genBinPattern'),
  genBrandBadge: document.getElementById('genBrandBadge'),
  genQuantity: document.getElementById('genQuantity'),
  genMonth: document.getElementById('genMonth'),
  genYear: document.getElementById('genYear'),
  genCvvOpt: document.getElementById('genCvvOpt'),
  btnGenerateCards: document.getElementById('btnGenerateCards'),
  genOutputTextarea: document.getElementById('genOutputTextarea'),
  genOutputCountBadge: document.getElementById('genOutputCountBadge'),
  btnCopyGenerated: document.getElementById('btnCopyGenerated'),
  btnDownloadGenerated: document.getElementById('btnDownloadGenerated'),
  btnSendToChecker: document.getElementById('btnSendToChecker'),
  btnLoadFirstInMockup: document.getElementById('btnLoadFirstInMockup'),

  // Bulk Checker Tab Elements
  bulkInputTextarea: document.getElementById('bulkInputTextarea'),
  bulkInputCountBadge: document.getElementById('bulkInputCountBadge'),
  btnLoadSampleBulk: document.getElementById('btnLoadSampleBulk'),
  btnStartBulkCheck: document.getElementById('btnStartBulkCheck'),
  btnCopyLiveOnly: document.getElementById('btnCopyLiveOnly'),
  btnClearBulk: document.getElementById('btnClearBulk'),
  bulkProgressContainer: document.getElementById('bulkProgressContainer'),
  bulkProgressBar: document.getElementById('bulkProgressBar'),
  bulkProgressPercent: document.getElementById('bulkProgressPercent'),
  countLiveBadge: document.getElementById('countLiveBadge'),
  countDieBadge: document.getElementById('countDieBadge'),
  countWarningBadge: document.getElementById('countWarningBadge'),
  countTotalBadge: document.getElementById('countTotalBadge'),
  bulkResultsList: document.getElementById('bulkResultsList'),

  // Check Digit Tab Elements
  inputPartialNumber: document.getElementById('inputPartialNumber'),
  btnQuickFill15: document.getElementById('btnQuickFill15'),
  btnQuickFillAmex14: document.getElementById('btnQuickFillAmex14'),
  checkDigitResultCard: document.getElementById('checkDigitResultCard'),

  // Sandbox Catalog
  presetsCatalogContainer: document.getElementById('presetsCatalogContainer'),
  searchPresetInput: document.getElementById('searchPresetInput'),

  // Terminal Modal
  terminalModal: document.getElementById('terminalModal'),
  btnCloseTerminal: document.getElementById('btnCloseTerminal'),
  btnCloseTerminalFooter: document.getElementById('btnCloseTerminalFooter'),
  terminalHttpStatusBadge: document.getElementById('terminalHttpStatusBadge'),
  terminalProcessingView: document.getElementById('terminalProcessingView'),
  terminal3DSView: document.getElementById('terminal3DSView'),
  btnAuthorize3DS: document.getElementById('btnAuthorize3DS'),
  terminalResultView: document.getElementById('terminalResultView'),
  terminalStatusBanner: document.getElementById('terminalStatusBanner'),
  receiptChargeId: document.getElementById('receiptChargeId'),
  receiptAmount: document.getElementById('receiptAmount'),
  receiptLast4: document.getElementById('receiptLast4'),
  receiptAuthCode: document.getElementById('receiptAuthCode'),
  receiptCvcCheck: document.getElementById('receiptCvcCheck'),
  terminalJsonOutput: document.getElementById('terminalJsonOutput'),
  btnCopyGatewayJson: document.getElementById('btnCopyGatewayJson'),

  // Documentation Modal
  btnOpenDocs: document.getElementById('btnOpenDocs'),
  btnCloseDocs: document.getElementById('btnCloseDocs'),
  btnCloseDocsFooter: document.getElementById('btnCloseDocsFooter'),
  docsModal: document.getElementById('docsModal'),

  // Toast Container
  toastContainer: document.getElementById('toastContainer')
};

// Application State
let currentBrand = CARD_BRANDS.GENERIC;
let currentSkin = 'lotus';
let isFlipped = false;
let hasCelebrated = false;
let latestBulkResults = null;
let currentBulkFilter = 'all';
let currentGatewayResponse = null;

// Card Skin Styles
const CARD_SKINS = {
  lotus: 'from-purple-950 via-slate-950 to-indigo-950 text-amber-200 border-amber-500/30',
  obsidian: 'from-slate-950 via-zinc-900 to-black text-slate-100',
  royal: 'from-blue-900 via-indigo-950 to-slate-950 text-white',
  titanium: 'from-slate-300 via-zinc-400 to-slate-500 text-slate-900',
  emerald: 'from-emerald-950 via-teal-900 to-slate-950 text-emerald-100',
  rose: 'from-rose-950 via-purple-950 to-slate-950 text-rose-100'
};

/**
 * Toast Notification System
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const typeStyles = {
    success: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-glow-emerald',
    error: 'bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-glow-rose',
    warning: 'bg-amber-950/90 border-amber-500/50 text-amber-200',
    info: 'bg-slate-900/90 border-electric-500/50 text-electric-200 shadow-glow-blue'
  };

  const icons = {
    success: `<svg class="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>`,
    error: `<svg class="w-4 h-4 text-rose-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg class="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info: `<svg class="w-4 h-4 text-electric-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`
  };

  toast.className = `flex items-center gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-md text-xs font-medium shadow-2xl transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto ${typeStyles[type] || typeStyles.info}`;
  toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;

  dom.toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/**
 * Copies text to clipboard with fallback
 */
async function copyToClipboard(text, successMsg = 'Copiado al portapapeles') {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }
    showToast(successMsg, 'success');
  } catch (err) {
    showToast('No se pudo copiar: permiso denegado', 'error');
  }
}

/**
 * Downloads a file to user device
 */
function downloadFile(filename, content, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Archivo ${filename} descargado`, 'success');
}

/**
 * Initializes Expiry Date Selectors
 */
function initExpirySelectors() {
  dom.selectExpMonth.innerHTML = '';
  for (let m = 1; m <= 12; m++) {
    const val = m.toString().padStart(2, '0');
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = val;
    dom.selectExpMonth.appendChild(opt);
  }
  dom.selectExpMonth.value = '12';

  const currentYear = new Date().getFullYear();
  dom.selectExpYear.innerHTML = '';
  for (let y = currentYear; y <= currentYear + 10; y++) {
    const opt = document.createElement('option');
    opt.value = y.toString().slice(-2);
    opt.textContent = y.toString();
    dom.selectExpYear.appendChild(opt);
  }
  dom.selectExpYear.value = (currentYear + 3).toString().slice(-2);
}

/**
 * Updates 3D Virtual Card Mockup and BIN Intelligence
 */
function updateCardMockup() {
  const rawNumber = dom.inputCardNumber.value;
  const digits = sanitizeNumber(rawNumber);
  currentBrand = detectBrand(digits);
  const binInfo = lookupBin(digits);

  // Update Brand Logo
  const logoSvg = BRAND_LOGOS[currentBrand.icon] || BRAND_LOGOS.generic;
  dom.cardBrandLogo.innerHTML = logoSvg;
  dom.cardBackLogoMini.innerHTML = logoSvg;

  // Apply card skin & brand gradient
  const skinClass = CARD_SKINS[currentSkin] || CARD_SKINS.obsidian;
  dom.cardFront.className = `card-front p-6 flex flex-col justify-between bg-gradient-to-tr ${skinClass} transition-all duration-300 overflow-hidden`;

  // CVV input constraint
  dom.inputCVV.maxLength = currentBrand.cvvLength;
  dom.cvvHint.textContent = `${currentBrand.cvvLength} dígitos (${currentBrand.name === 'American Express' ? 'Frente/CID' : 'Reverso'})`;

  // Formatted Card Number
  if (!digits) {
    dom.cardDisplayNumber.textContent = '•••• •••• •••• ••••';
    dom.cardDisplayNumber.classList.add('text-slate-400/60');
    dom.cardDisplayNumber.classList.remove('text-white');
  } else {
    dom.cardDisplayNumber.textContent = formatCardNumber(digits, currentBrand);
    dom.cardDisplayNumber.classList.remove('text-slate-400/60');
    dom.cardDisplayNumber.classList.add('text-white');
  }

  // Cardholder Name
  const holderText = dom.inputCardHolder.value.trim();
  dom.cardDisplayHolder.textContent = holderText || 'DEV TESTER';

  // Expiry Date MM/YY
  const expMonth = dom.selectExpMonth.value;
  const expYear = dom.selectExpYear.value;
  dom.cardDisplayExpiry.textContent = `${expMonth}/${expYear}`;

  // CVV Display
  const cvvText = dom.inputCVV.value.trim();
  dom.cardDisplayCVV.textContent = cvvText || '•••';

  // Digit Counter Badge
  dom.panLengthBadge.textContent = `${digits.length} dígitos`;
  if (currentBrand.lengths.includes(digits.length)) {
    dom.panLengthBadge.className = 'text-[11px] font-mono text-emerald-400 font-semibold';
  } else {
    dom.panLengthBadge.className = 'text-[11px] font-mono text-slate-400';
  }

  // Update BIN Intelligence Box
  if (binInfo) {
    dom.binCountryFlag.textContent = binInfo.flag;
    dom.binBankText.textContent = binInfo.bank;
    dom.binCardTypeBadge.textContent = binInfo.type;
    dom.binTierText.textContent = `${binInfo.tier} (${currentBrand.name})`;
    dom.binCountryCurrency.textContent = `${binInfo.country} • ${binInfo.currency}`;
  } else {
    dom.binCountryFlag.textContent = '💳';
    dom.binBankText.textContent = currentBrand.name;
    dom.binCardTypeBadge.textContent = 'Estándar';
    dom.binTierText.textContent = 'Ingresa 6 dígitos para BIN lookup';
    dom.binCountryCurrency.textContent = 'Internacional';
  }
}

/**
 * 3D Mouse & Touch Parallax with Dynamic Holographic Glare
 */
function setupCardParallax() {
  const updateTilt = (clientX, clientY) => {
    if (isFlipped) return;

    const rect = dom.cardContainer.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -14; // Max 14deg
    const rotateY = ((x - centerX) / centerX) * 16;  // Max 16deg

    dom.cardInner.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

    // Update dynamic glare position
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    dom.cardGlare.style.setProperty('--glare-x', `${glareX}%`);
    dom.cardGlare.style.setProperty('--glare-y', `${glareY}%`);
    dom.cardGlare.style.opacity = '1';
  };

  const resetTilt = () => {
    if (isFlipped) return;
    dom.cardInner.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    dom.cardGlare.style.opacity = '0';
  };

  // Desktop mouse parallax
  dom.cardContainer.addEventListener('mousemove', (e) => updateTilt(e.clientX, e.clientY));
  dom.cardContainer.addEventListener('mouseleave', resetTilt);

  // Mobile touchscreen parallax (sliding finger over card tilts in 3D)
  dom.cardContainer.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      updateTilt(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });
  dom.cardContainer.addEventListener('touchend', resetTilt, { passive: true });
  dom.cardContainer.addEventListener('touchcancel', resetTilt, { passive: true });
}

/**
 * Renders Luhn Validator Status & Step-by-Step Breakdown
 */
function renderLuhnValidation() {
  const rawNumber = dom.inputCardNumber.value;
  const digits = sanitizeNumber(rawNumber);
  const breakdown = getLuhnBreakdown(digits);

  if (digits.length < 2) {
    dom.luhnStatusBanner.className = 'p-5 rounded-2xl border transition-all duration-300 bg-slate-900/60 border-slate-800 text-slate-300';
    dom.luhnStatusBanner.innerHTML = `
      <div class="flex items-start gap-3.5">
        <div class="p-2.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
          </svg>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-white">Ingresa una secuencia para validar</h4>
          <p class="text-xs text-slate-400 mt-1 leading-relaxed">
            Escribe un número en el formulario, usa el <span class="text-purple-400 font-medium">Sintetizador LotusGen</span> o elige una tarjeta en el <span class="text-electric-400 font-medium">Sandbox Lab</span>.
          </p>
        </div>
      </div>
    `;

    dom.formulaSumValue.textContent = '0';
    dom.formulaRemainderValue.textContent = '0';
    dom.formulaEvaluationBadge.className = 'p-2 rounded text-center flex-1 min-w-[130px] font-sans bg-slate-800 text-slate-400 text-xs';
    dom.formulaEvaluationBadge.innerHTML = 'Esperando dígitos...';

    dom.breakdownGrid.innerHTML = `
      <div class="w-full py-8 text-center text-xs text-slate-500 font-mono">
        No hay datos para desglosar. Ingresa al menos 2 dígitos.
      </div>
    `;
    hasCelebrated = false;
    return;
  }

  if (breakdown.isValid) {
    dom.luhnStatusBanner.className = 'p-5 rounded-2xl border transition-all duration-300 bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-glow-emerald';
    dom.luhnStatusBanner.innerHTML = `
      <div class="flex items-start gap-3.5">
        <div class="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h4 class="text-sm font-bold text-emerald-300 flex items-center gap-2">
              <span>Suma de Verificación VÁLIDA (Checksum OK)</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">MOD 10 == 0</span>
            </h4>
            <span class="text-xs font-mono text-emerald-400/90">${digits.length} dígitos verificados</span>
          </div>
          <p class="text-xs text-slate-300 mt-1 leading-relaxed">
            La secuencia cumple con el algoritmo de Luhn (ISO/IEC 7812-1). La suma total ponderada es <strong class="text-white">${breakdown.totalSum}</strong>, divisible entre 10 (residuo 0).
          </p>
        </div>
      </div>
    `;

    dom.formulaEvaluationBadge.className = 'p-2 rounded text-center flex-1 min-w-[130px] font-sans bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold';
    dom.formulaEvaluationBadge.innerHTML = '✓ VÁLIDO (Residuo 0)';

    if (!hasCelebrated && digits.length >= 13) {
      sound.playSuccessChime();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#38bdf8', '#10b981', '#6366f1']
      });
      hasCelebrated = true;
    }
  } else {
    dom.luhnStatusBanner.className = 'p-5 rounded-2xl border transition-all duration-300 bg-rose-950/40 border-rose-500/40 text-rose-200 shadow-glow-rose';
    dom.luhnStatusBanner.innerHTML = `
      <div class="flex items-start gap-3.5">
        <div class="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h4 class="text-sm font-bold text-rose-300 flex items-center gap-2">
              <span>Suma de Verificación INVÁLIDA</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">Residuo: ${breakdown.remainder}</span>
            </h4>
            <span class="text-xs font-mono text-rose-400/90">${digits.length} dígitos</span>
          </div>
          <p class="text-xs text-slate-300 mt-1 leading-relaxed">
            La suma ponderada es <strong class="text-white">${breakdown.totalSum}</strong>, pero <span class="font-mono text-rose-300">${breakdown.totalSum} % 10 = ${breakdown.remainder}</span>. Para que sea válido, el residuo debe ser 0.
          </p>
        </div>
      </div>
    `;

    dom.formulaEvaluationBadge.className = 'p-2 rounded text-center flex-1 min-w-[130px] font-sans bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold';
    dom.formulaEvaluationBadge.innerHTML = `✗ INVÁLIDO (${breakdown.remainder} ≠ 0)`;
    hasCelebrated = false;
  }

  dom.formulaSumValue.textContent = breakdown.totalSum;
  dom.formulaRemainderValue.textContent = breakdown.remainder;

  // Render Step-by-Step Breakdown Grid
  dom.breakdownGrid.innerHTML = '';
  breakdown.steps.forEach((step) => {
    const card = document.createElement('div');
    const isDouble = step.isDoubled;
    const isCheck = step.isCheckDigit;

    card.className = `flex-1 min-w-[62px] max-w-[85px] p-2.5 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
      isCheck 
        ? 'bg-amber-950/30 border-amber-500/40 ring-1 ring-amber-500/30' 
        : isDouble 
          ? 'bg-electric-950/30 border-electric-500/40' 
          : 'bg-slate-950/60 border-slate-800'
    }`;

    card.innerHTML = `
      <div class="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">
        ${isCheck ? 'Control' : `P${step.posFromRight}`}
      </div>
      
      <div class="my-1 text-lg font-bold font-mono ${isCheck ? 'text-amber-300' : isDouble ? 'text-electric-300' : 'text-slate-200'}">
        ${step.digit}
      </div>

      <div class="text-[10px] font-mono px-1 py-0.5 rounded w-full ${
        isDouble ? 'bg-electric-500/20 text-electric-300' : 'bg-slate-800/80 text-slate-400'
      }">
        ${isDouble ? '× 2' : '× 1'}
      </div>

      <div class="mt-1.5 pt-1.5 border-t border-slate-800/80 w-full">
        <div class="text-[11px] font-bold font-mono text-white">
          +${step.reducedVal}
        </div>
        ${step.reductionNote ? `<div class="text-[8px] text-electric-400/80 font-mono -mt-0.5 truncate" title="${step.reductionNote}">${step.rawDoubled}→${step.reducedVal}</div>` : ''}
      </div>
    `;

    dom.breakdownGrid.appendChild(card);
  });
}

/**
 * Executes LotusGen Pattern-Based Card Generation
 */
function handleGenerateCards() {
  const binPattern = dom.genBinPattern.value.trim() || '453201xxxxxxxxxx';
  const count = parseInt(dom.genQuantity.value, 10) || 10;
  const expMonth = dom.genMonth.value;
  const expYear = dom.genYear.value;
  const cvv = dom.genCvvOpt.value;

  const selectedFormatEl = document.querySelector('input[name="genFormat"]:checked');
  const format = selectedFormatEl ? selectedFormatEl.value : 'pipe';

  const output = generateBatchCards({
    binPattern,
    count,
    expMonth,
    expYear,
    cvv,
    separator: '|',
    includeBrand: false,
    format
  });

  dom.genOutputTextarea.value = output;
  dom.genOutputCountBadge.textContent = `${count} tarjetas sintetizadas`;
  sound.playSuccessChime();
  showToast(`Sintetizadas ${count} tarjetas válidas por Luhn`, 'success');
}

/**
 * Runs Bulk Verification (LotusAuditor Engine)
 */
async function handleStartBulkCheck() {
  const rawInput = dom.bulkInputTextarea.value.trim();
  if (!rawInput) {
    showToast('Ingresa o pega al menos una tarjeta para validar', 'warning');
    return;
  }

  dom.btnStartBulkCheck.disabled = true;
  dom.bulkProgressContainer.classList.remove('hidden');
  dom.bulkResultsList.innerHTML = '';

  dom.countLiveBadge.textContent = '0';
  dom.countDieBadge.textContent = '0';
  dom.countWarningBadge.textContent = '0';
  dom.countTotalBadge.textContent = '0';

  const results = await runBulkCheck(rawInput, (progress) => {
    dom.bulkProgressBar.style.width = `${progress.percentage}%`;
    dom.bulkProgressPercent.textContent = `${progress.percentage}% (${progress.current}/${progress.total})`;
    dom.countLiveBadge.textContent = progress.liveCount;
    dom.countDieBadge.textContent = progress.dieCount;
    dom.countWarningBadge.textContent = progress.warningCount;
    dom.countTotalBadge.textContent = progress.current;
  });

  latestBulkResults = results;
  dom.btnStartBulkCheck.disabled = false;

  renderBulkResultsList(results, currentBulkFilter);
  if (results.live.length > 0) sound.playSuccessChime();
  showToast(`Verificación completa: ${results.live.length} Live, ${results.die.length} Die, ${results.warning.length} Alertas`, 'info');
}

/**
 * Renders the filtered bulk checker list
 */
function renderBulkResultsList(results, filter = 'all') {
  if (!results) return;
  dom.bulkResultsList.innerHTML = '';

  let items = [];
  if (filter === 'all') {
    items = [...results.live, ...results.warning, ...results.die];
  } else if (filter === 'live') {
    items = results.live;
  } else if (filter === 'die') {
    items = results.die;
  } else if (filter === 'warning') {
    items = results.warning;
  }

  if (items.length === 0) {
    dom.bulkResultsList.innerHTML = `
      <div class="py-8 text-center text-xs text-slate-500 font-mono">
        No hay tarjetas en la categoría seleccionada (${filter}).
      </div>
    `;
    return;
  }

  items.forEach(item => {
    const cardEl = document.createElement('div');
    const isLive = item.status === 'live';
    const isWarn = item.status === 'warning';

    const statusBadgeClass = isLive 
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      : isWarn
        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

    const borderClass = isLive
      ? 'border-emerald-500/30 hover:border-emerald-500/60'
      : isWarn
        ? 'border-amber-500/30 hover:border-amber-500/60'
        : 'border-rose-500/20 hover:border-rose-500/40';

    const c = item.card;
    const formattedLine = `${c.number}${c.month ? `|${c.month}` : ''}${c.year ? `|${c.year}` : ''}${c.cvv ? `|${c.cvv}` : ''}`;

    cardEl.className = `p-2.5 rounded-xl bg-slate-950/80 border ${borderClass} flex items-center justify-between gap-3 text-xs transition-colors`;
    cardEl.innerHTML = `
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="w-2 h-2 rounded-full shrink-0 ${isLive ? 'bg-emerald-500' : isWarn ? 'bg-amber-500' : 'bg-rose-500'}"></span>
        <div class="min-w-0">
          <div class="font-mono font-semibold text-white tracking-wider truncate">${formattedLine}</div>
          <div class="text-[11px] text-slate-400 truncate">${item.reason}</div>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <span class="text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusBadgeClass}">
          ${item.statusText}
        </span>
        <button class="btn-copy-bulk-single p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" data-line="${formattedLine}" title="Copiar">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
        </button>
      </div>
    `;

    dom.bulkResultsList.appendChild(cardEl);
  });

  dom.bulkResultsList.querySelectorAll('.btn-copy-bulk-single').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const line = e.currentTarget.getAttribute('data-line');
      copyToClipboard(line, `Copiado: ${line}`);
    });
  });
}

/**
 * Opens and Runs Gateway Payment Terminal Simulation
 */
async function runPaymentTerminal() {
  const cardNumber = dom.inputCardNumber.value;
  const cardHolder = dom.inputCardHolder.value;
  const expMonth = dom.selectExpMonth.value;
  const expYear = dom.selectExpYear.value;
  const cvv = dom.inputCVV.value;

  dom.terminalModal.classList.remove('hidden');
  dom.terminalProcessingView.classList.remove('hidden');
  dom.terminal3DSView.classList.add('hidden');
  dom.terminalResultView.classList.add('hidden');
  dom.terminalHttpStatusBadge.textContent = 'Autorizando...';
  dom.terminalHttpStatusBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse';

  const res = await simulateGatewayTransaction({
    cardNumber,
    cardHolder,
    expMonth,
    expYear,
    cvv,
    amount: 2500,
    currency: 'USD'
  });

  currentGatewayResponse = res;
  dom.terminalProcessingView.classList.add('hidden');

  if (res.requires3DS) {
    dom.terminalHttpStatusBadge.textContent = '202 Requiere 3DS';
    dom.terminalHttpStatusBadge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40';
    dom.terminal3DSView.classList.remove('hidden');
    return;
  }

  showTerminalFinalResult(res);
}

/**
 * Displays Terminal Final Result View (Approved / Declined)
 */
function showTerminalFinalResult(res) {
  dom.terminal3DSView.classList.add('hidden');
  dom.terminalResultView.classList.remove('hidden');

  const isSuccess = res.status === 'succeeded';
  dom.terminalHttpStatusBadge.textContent = `${res.httpStatus} ${isSuccess ? 'OK' : 'DECLINED'}`;
  dom.terminalHttpStatusBadge.className = `text-[10px] font-mono px-2 py-0.5 rounded ${
    isSuccess ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
  }`;

  dom.terminalStatusBanner.className = `p-4 rounded-xl border flex items-start gap-3 ${
    isSuccess ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
  }`;

  dom.terminalStatusBanner.innerHTML = `
    <div class="p-2 rounded-lg ${isSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'} shrink-0">
      ${isSuccess 
        ? `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>`
        : `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
      }
    </div>
    <div>
      <h4 class="text-sm font-bold ${isSuccess ? 'text-emerald-300' : 'text-rose-300'}">${res.title}</h4>
      <p class="text-xs text-slate-300 mt-1">${res.message}</p>
    </div>
  `;

  dom.receiptChargeId.textContent = res.chargeId;
  dom.receiptAmount.textContent = '$25.00 USD';
  const cleanDigits = sanitizeNumber(dom.inputCardNumber.value);
  dom.receiptLast4.textContent = `•••• ${cleanDigits.slice(-4) || '4242'}`;
  dom.receiptAuthCode.textContent = res.authCode || 'N/A';
  dom.receiptCvcCheck.textContent = isSuccess ? 'PASS (Coincide)' : 'FAILED / UNAVAILABLE';
  dom.receiptCvcCheck.className = isSuccess ? 'text-emerald-400' : 'text-rose-400';

  dom.terminalJsonOutput.textContent = JSON.stringify(res.json, null, 2);

  if (isSuccess) {
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
  }
}

/**
 * Calculates Check Digit for Incomplete Numbers
 */
function renderCheckDigitCalculator() {
  const rawPartial = dom.inputPartialNumber.value;
  const digits = sanitizeNumber(rawPartial);

  if (!digits) {
    dom.checkDigitResultCard.innerHTML = `
      <div class="text-center py-8 text-xs text-slate-400 font-mono">
        Ingresa una secuencia de dígitos para calcular su dígito de control.
      </div>
    `;
    return;
  }

  const result = calculateRequiredCheckDigit(digits);
  const brand = detectBrand(digits);

  dom.checkDigitResultCard.innerHTML = `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
      <div>
        <span class="text-xs font-mono text-slate-400 uppercase">Dígito de Control Calculado</span>
        <div class="flex items-center gap-3 mt-1">
          <span class="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-mono text-2xl font-bold flex items-center justify-center shadow-glow-emerald">
            ${result.requiredCheckDigit}
          </span>
          <div>
            <div class="text-sm font-semibold text-white">Cifra de Verificación: ${result.requiredCheckDigit}</div>
            <div class="text-xs text-slate-400">Genera una tarjeta completa válida de ${result.fullNumber.length} dígitos.</div>
          </div>
        </div>
      </div>

      <button id="btnApplyCalculatedCard" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow-emerald transition-all flex items-center gap-2">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 11 12 14 22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <span>Aplicar a la Tarjeta</span>
      </button>
    </div>

    <div class="mt-4 pt-1 space-y-3">
      <div class="flex items-center justify-between text-xs text-slate-300">
        <span class="text-slate-400">Suma parcial de los dígitos multiplicados:</span>
        <span class="font-mono font-bold text-white">${result.partialSum}</span>
      </div>
      <div class="flex items-center justify-between text-xs text-slate-300">
        <span class="text-slate-400">Residuo de la suma (${result.partialSum} % 10):</span>
        <span class="font-mono font-bold text-electric-400">${result.remainder}</span>
      </div>
      <div class="flex items-center justify-between text-xs text-slate-300">
        <span class="text-slate-400">Fórmula de cálculo: (10 - (${result.partialSum} % 10)) % 10:</span>
        <span class="font-mono font-bold text-emerald-400">${result.requiredCheckDigit}</span>
      </div>
      <div class="flex items-center justify-between text-xs text-slate-300">
        <span class="text-slate-400">Número completo resultante (${brand.name}):</span>
        <span class="font-mono font-bold text-white bg-slate-900 px-2 py-1 rounded border border-slate-800">
          ${formatCardNumber(result.fullNumber, brand)}
        </span>
      </div>
    </div>
  `;

  document.getElementById('btnApplyCalculatedCard')?.addEventListener('click', () => {
    dom.inputCardNumber.value = formatCardNumber(result.fullNumber, brand);
    updateCardMockup();
    renderLuhnValidation();
    switchTab('validator');
    sound.playSuccessChime();
    showToast(`Tarjeta completada con dígito ${result.requiredCheckDigit} y cargada`, 'success');
  });
}

/**
 * Renders Sandbox Test Cards Catalog
 */
function renderSandboxCatalog(filterText = '') {
  dom.presetsCatalogContainer.innerHTML = '';
  const search = filterText.toLowerCase().trim();

  let renderedAny = false;

  TEST_CARD_PRESETS.forEach(group => {
    const matchingCards = group.cards.filter(c => 
      !search || 
      c.title.toLowerCase().includes(search) || 
      c.brand.toLowerCase().includes(search) ||
      c.description.toLowerCase().includes(search) ||
      c.statusText.toLowerCase().includes(search) ||
      c.number.includes(search)
    );

    if (matchingCards.length === 0) return;
    renderedAny = true;

    const groupSection = document.createElement('div');
    groupSection.className = 'space-y-3';
    
    groupSection.innerHTML = `
      <div class="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
        <span class="w-1.5 h-1.5 rounded-full bg-electric-400"></span>
        <span>${group.category}</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3" id="groupCards_${group.category.replace(/\W+/g, '')}"></div>
    `;

    dom.presetsCatalogContainer.appendChild(groupSection);
    const container = groupSection.querySelector(`[id^="groupCards_"]`);

    matchingCards.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = 'p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 group/item';
      
      const brandObj = detectBrand(card.number);
      const formattedNum = formatCardNumber(card.number, brandObj);

      cardEl.innerHTML = `
        <div>
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <span class="font-semibold text-xs text-white leading-tight">${card.title}</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${card.badgeClass}">
              ${card.statusText}
            </span>
          </div>
          <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">${card.description}</p>
          <div class="font-mono text-xs font-bold text-slate-200 bg-slate-900/90 px-2.5 py-1.5 rounded border border-slate-800 flex items-center justify-between">
            <span class="tracking-wider">${formattedNum}</span>
            <span class="text-[10px] text-slate-400 font-sans">${card.brand}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-1 border-t border-slate-800/80 text-xs">
          <button class="btn-load-preset flex-1 py-1.5 px-3 rounded-lg bg-electric-600/20 hover:bg-electric-600/30 text-electric-300 border border-electric-500/30 font-medium transition-all text-center flex items-center justify-center gap-1.5" data-id="${card.id}">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            <span>Cargar en Validador</span>
          </button>
          
          <button class="btn-copy-preset p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors" data-number="${card.number}" title="Copiar PAN">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
          </button>
        </div>
      `;

      container.appendChild(cardEl);
    });
  });

  if (!renderedAny) {
    dom.presetsCatalogContainer.innerHTML = `
      <div class="py-12 text-center text-xs text-slate-500 font-mono">
        No se encontraron tarjetas que coincidan con "${filterText}".
      </div>
    `;
  }

  dom.presetsCatalogContainer.querySelectorAll('.btn-load-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cardId = e.currentTarget.getAttribute('data-id');
      loadPresetCard(cardId);
    });
  });

  dom.presetsCatalogContainer.querySelectorAll('.btn-copy-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const number = e.currentTarget.getAttribute('data-number');
      copyToClipboard(number, `Tarjeta ${number} copiada al portapapeles`);
    });
  });
}

/**
 * Loads a Preset Card into simulator
 */
function loadPresetCard(cardId) {
  let targetCard = null;
  for (const group of TEST_CARD_PRESETS) {
    const found = group.cards.find(c => c.id === cardId);
    if (found) {
      targetCard = found;
      break;
    }
  }

  if (!targetCard) return;

  const brand = detectBrand(targetCard.number);
  dom.inputCardNumber.value = formatCardNumber(targetCard.number, brand);
  dom.inputCVV.value = targetCard.cvv || '123';
  dom.selectExpMonth.value = targetCard.expMonth || '12';

  const currentYear = new Date().getFullYear();
  const targetYear = (currentYear + (targetCard.expYearOffset || 3)).toString().slice(-2);
  
  if ([...dom.selectExpYear.options].some(opt => opt.value === targetYear)) {
    dom.selectExpYear.value = targetYear;
  }

  if (targetCard.status === 'expired') {
    dom.inputCardHolder.value = 'TARJETA VENCIDA';
  } else {
    dom.inputCardHolder.value = 'TESTER ' + targetCard.brand.toUpperCase();
  }

  updateCardMockup();
  renderLuhnValidation();
  switchTab('validator');
  sound.playCardFlip();
  showToast(`Tarjeta cargada: ${targetCard.title}`, 'info');
}

/**
 * Tab Switching Handler
 */
function switchTab(tabId) {
  const tabs = [
    { id: 'validator', btn: dom.tabBtnValidator, content: dom.tabContentValidator },
    { id: 'generator', btn: dom.tabBtnGenerator, content: dom.tabContentGenerator },
    { id: 'bulkChecker', btn: dom.tabBtnBulkChecker, content: dom.tabContentBulkChecker },
    { id: 'checkDigit', btn: dom.tabBtnCheckDigit, content: dom.tabContentCheckDigit },
    { id: 'sandbox', btn: dom.tabBtnSandbox, content: dom.tabContentSandbox }
  ];

  tabs.forEach(t => {
    if (t.id === tabId) {
      t.btn.className = 'tab-btn active py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 bg-electric-600 text-white shadow-sm whitespace-nowrap min-h-[38px]';
      t.content.classList.remove('hidden');
      // On mobile devices, center the active tab button in view smoothly
      t.btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      t.btn.className = 'tab-btn py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 text-slate-400 hover:text-white whitespace-nowrap min-h-[38px]';
      t.content.classList.add('hidden');
    }
  });

  if (tabId === 'checkDigit') {
    renderCheckDigitCalculator();
  }
}

/**
 * Flip Card Trigger
 */
function flipCard(forceState = null) {
  if (forceState !== null) {
    isFlipped = forceState;
  } else {
    isFlipped = !isFlipped;
  }

  sound.playCardFlip();

  if (isFlipped) {
    dom.cardInner.classList.add('flipped');
    dom.cardInner.style.transform = 'rotateY(180deg)';
    dom.btnFlipCard.innerHTML = `
      <svg class="w-3.5 h-3.5 text-electric-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
      </svg>
      <span>Frente</span>
    `;
  } else {
    dom.cardInner.classList.remove('flipped');
    dom.cardInner.style.transform = 'rotateY(0deg)';
    dom.btnFlipCard.innerHTML = `
      <svg class="w-3.5 h-3.5 text-electric-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
        <path d="M16 21h5v-5"/>
      </svg>
      <span>Girar</span>
    `;
  }
}

/**
 * Sound UI Toggle
 */
function setupSoundToggle() {
  const updateSoundIcons = () => {
    if (sound.isMuted) {
      dom.soundIconOn.classList.add('hidden');
      dom.soundIconOff.classList.remove('hidden');
    } else {
      dom.soundIconOn.classList.remove('hidden');
      dom.soundIconOff.classList.add('hidden');
    }
  };

  updateSoundIcons();

  dom.btnToggleSound.addEventListener('click', () => {
    const isMuted = sound.toggleMute();
    updateSoundIcons();
    if (!isMuted) sound.playSuccessChime();
    showToast(isMuted ? 'Sonido silenciado' : 'Efectos de sonido activados', 'info');
  });
}

/**
 * Event Listeners Registration
 */
function setupEventListeners() {
  // Parallax
  setupCardParallax();

  // Audio
  setupSoundToggle();

  // Input Card Number
  dom.inputCardNumber.addEventListener('input', (e) => {
    const rawVal = e.target.value;
    const digits = sanitizeNumber(rawVal);
    const brand = detectBrand(digits);
    const formatted = formatCardNumber(digits, brand);
    
    sound.playTick();
    e.target.value = formatted;
    updateCardMockup();
    renderLuhnValidation();
  });

  // Paste Button
  dom.btnPasteCardNumber.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      const digits = sanitizeNumber(text);
      if (digits) {
        const brand = detectBrand(digits);
        dom.inputCardNumber.value = formatCardNumber(digits, brand);
        updateCardMockup();
        renderLuhnValidation();
        sound.playTick();
        showToast('Número pegado desde el portapapeles', 'info');
      } else {
        showToast('El portapapeles no contiene dígitos válidos', 'warning');
      }
    } catch {
      showToast('Permiso de portapapeles requerido. Usa Ctrl+V.', 'warning');
    }
  });

  // Cardholder Name Input
  dom.inputCardHolder.addEventListener('input', () => updateCardMockup());

  // Expiry Month & Year Selects
  dom.selectExpMonth.addEventListener('change', () => updateCardMockup());
  dom.selectExpYear.addEventListener('change', () => updateCardMockup());

  // CVV Input
  dom.inputCVV.addEventListener('input', (e) => {
    e.target.value = sanitizeNumber(e.target.value);
    sound.playTick();
    updateCardMockup();
  });
  dom.inputCVV.addEventListener('focus', () => {
    if (currentBrand.id !== 'amex') flipCard(true);
  });
  dom.inputCVV.addEventListener('blur', () => flipCard(false));

  // Flip buttons
  dom.cardContainer.addEventListener('click', () => flipCard());
  dom.btnFlipCard.addEventListener('click', (e) => {
    e.stopPropagation();
    flipCard();
  });

  // Card Material Skin Selector
  document.querySelectorAll('.btn-card-skin').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.btn-card-skin').forEach(b => b.classList.replace('border-white/60', 'border-transparent'));
      e.currentTarget.classList.replace('border-transparent', 'border-white/60');
      currentSkin = e.currentTarget.getAttribute('data-skin');
      sound.playCardFlip();
      updateCardMockup();
    });
  });

  // Payment Terminal Simulator Charge
  dom.btnSimulateTerminalCharge.addEventListener('click', runPaymentTerminal);
  dom.btnCloseTerminal.addEventListener('click', () => dom.terminalModal.classList.add('hidden'));
  dom.btnCloseTerminalFooter.addEventListener('click', () => dom.terminalModal.classList.add('hidden'));

  // 3DS Challenge Authorize
  dom.btnAuthorize3DS.addEventListener('click', () => {
    sound.playSuccessChime();
    showTerminalFinalResult({
      httpStatus: 200,
      status: 'succeeded',
      declineCode: null,
      title: 'Desafío 3D Secure Aprobado con Éxito',
      message: 'El código OTP fue verificado por el emisor. Cobro liquidado mediante SCA (3DS2).',
      requires3DS: false,
      chargeId: `ch_${Date.now().toString(36)}3ds`,
      authCode: '3DS_OK_' + Math.floor(100000 + Math.random() * 900000),
      json: {
        id: `ch_${Date.now().toString(36)}3ds`,
        object: 'charge',
        amount: 2500,
        currency: 'usd',
        status: 'succeeded',
        three_d_secure: {
          authenticated: true,
          version: '2.2.0',
          electronic_commerce_indicator: '05'
        }
      }
    });
  });

  // Copy Gateway JSON
  dom.btnCopyGatewayJson.addEventListener('click', () => {
    if (currentGatewayResponse && currentGatewayResponse.json) {
      copyToClipboard(JSON.stringify(currentGatewayResponse.json, null, 2), 'JSON de pasarela copiado');
    }
  });

  // Copy Full Checkout JSON
  dom.btnCopyFullCheckout.addEventListener('click', () => {
    const digits = sanitizeNumber(dom.inputCardNumber.value);
    const checkoutData = {
      cardNumber: digits || '4242424242424242',
      cardHolder: dom.inputCardHolder.value || 'DEV TESTER',
      expMonth: dom.selectExpMonth.value,
      expYear: dom.selectExpYear.value,
      cvv: dom.inputCVV.value || '123',
      brand: currentBrand.name,
      isLuhnValid: isValidLuhn(digits)
    };
    copyToClipboard(JSON.stringify(checkoutData, null, 2), 'Datos de checkout copiados en formato JSON');
  });

  // Simulate Checkout Submit
  dom.btnSimulateSubmit.addEventListener('click', () => {
    const digits = sanitizeNumber(dom.inputCardNumber.value);
    if (!digits || digits.length < 13) {
      showToast('Ingresa una longitud de tarjeta válida antes de verificar', 'warning');
      return;
    }

    const valid = isValidLuhn(digits);
    if (valid) {
      sound.playSuccessChime();
      showToast(`✓ Tarjeta ${currentBrand.name} aprobada en validación previa (Luhn OK)`, 'success');
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
    } else {
      sound.playDeclineBuzz();
      showToast(`✗ Error: Checksum de Luhn inválido para esta tarjeta`, 'error');
    }
  });

  // Reset All Button
  dom.btnResetAll.addEventListener('click', () => {
    dom.inputCardNumber.value = '';
    dom.inputCardHolder.value = 'DEV TESTER';
    dom.inputCVV.value = '123';
    hasCelebrated = false;
    updateCardMockup();
    renderLuhnValidation();
    showToast('Campos restablecidos', 'info');
  });

  // Tab Navigation Listeners
  dom.tabBtnValidator.addEventListener('click', () => switchTab('validator'));
  dom.tabBtnGenerator.addEventListener('click', () => switchTab('generator'));
  dom.tabBtnBulkChecker.addEventListener('click', () => switchTab('bulkChecker'));
  dom.tabBtnCheckDigit.addEventListener('click', () => switchTab('checkDigit'));
  dom.tabBtnSandbox.addEventListener('click', () => switchTab('sandbox'));

  // Generator Features
  dom.genBinPattern.addEventListener('input', (e) => {
    const brand = detectBrand(e.target.value);
    dom.genBrandBadge.textContent = `Detectando: ${brand.name}`;
  });

  document.querySelectorAll('.btn-bin-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const bin = e.currentTarget.getAttribute('data-bin');
      dom.genBinPattern.value = bin;
      const brand = detectBrand(bin);
      dom.genBrandBadge.textContent = `Detectando: ${brand.name}`;
      handleGenerateCards();
    });
  });

  dom.btnGenerateCards.addEventListener('click', handleGenerateCards);

  dom.btnCopyGenerated.addEventListener('click', () => {
    const text = dom.genOutputTextarea.value.trim();
    if (!text) {
      showToast('No hay tarjetas generadas para copiar', 'warning');
      return;
    }
    copyToClipboard(text, 'Lote copiado al portapapeles');
  });

  dom.btnDownloadGenerated.addEventListener('click', () => {
    const text = dom.genOutputTextarea.value.trim();
    if (!text) {
      showToast('No hay contenido para descargar', 'warning');
      return;
    }
    const selectedFormatEl = document.querySelector('input[name="genFormat"]:checked');
    const format = selectedFormatEl ? selectedFormatEl.value : 'pipe';
    const ext = format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'txt';
    downloadFile(`cards_${Date.now()}.${ext}`, text);
  });

  dom.btnSendToChecker.addEventListener('click', () => {
    const text = dom.genOutputTextarea.value.trim();
    if (!text) {
      showToast('Primero genera tarjetas para enviarlas al checker', 'warning');
      return;
    }
    dom.bulkInputTextarea.value = text;
    dom.bulkInputCountBadge.textContent = `${text.split('\n').filter(Boolean).length} líneas`;
    switchTab('bulkChecker');
    showToast('Tarjetas enviadas al Checker Masivo', 'info');
  });

  dom.btnLoadFirstInMockup.addEventListener('click', () => {
    const text = dom.genOutputTextarea.value.trim();
    if (!text) {
      showToast('Primero genera tarjetas', 'warning');
      return;
    }
    const firstLine = text.split('\n')[0];
    const parsed = parseCardLine(firstLine);
    if (parsed) {
      const brand = detectBrand(parsed.number);
      dom.inputCardNumber.value = formatCardNumber(parsed.number, brand);
      if (parsed.month) dom.selectExpMonth.value = parsed.month;
      if (parsed.yearShort) dom.selectExpYear.value = parsed.yearShort;
      if (parsed.cvv) dom.inputCVV.value = parsed.cvv;
      updateCardMockup();
      renderLuhnValidation();
      switchTab('validator');
      sound.playCardFlip();
      showToast(`Cargada tarjeta #1 (${brand.name}) en mockup`, 'success');
    }
  });

  // Bulk Checker Features
  dom.bulkInputTextarea.addEventListener('input', (e) => {
    const count = e.target.value.split('\n').filter(l => l.trim()).length;
    dom.bulkInputCountBadge.textContent = `${count} líneas`;
  });

  dom.btnLoadSampleBulk.addEventListener('click', () => {
    dom.bulkInputTextarea.value = [
      '4242424242424242|12|2028|123',
      '4111111111111111|10|2027|456',
      '5555555555554444|11|2029|789',
      '378282246310005|04|2028|4321',
      '4000000000000069|01|2023|123', // Expired
      '4000000000000002|11|2027|123', // Valid Luhn (generic decline)
      '4242424242424249|12|2028|123', // Die (bad Luhn checksum)
      '5555555555554440|10|2027|123', // Die (bad Luhn checksum)
      '6011111111111117|07|2028|321'
    ].join('\n');
    dom.bulkInputCountBadge.textContent = '9 líneas';
    showToast('Muestra de 9 tarjetas cargada (válidas, vencidas y erróneas)', 'info');
  });

  dom.btnStartBulkCheck.addEventListener('click', handleStartBulkCheck);

  dom.btnCopyLiveOnly.addEventListener('click', () => {
    if (!latestBulkResults || latestBulkResults.live.length === 0) {
      showToast('No hay tarjetas Live para copiar', 'warning');
      return;
    }
    const liveLines = latestBulkResults.live.map(item => {
      const c = item.card;
      return `${c.number}${c.month ? `|${c.month}` : ''}${c.year ? `|${c.year}` : ''}${c.cvv ? `|${c.cvv}` : ''}`;
    }).join('\n');
    copyToClipboard(liveLines, `Copiadas ${latestBulkResults.live.length} tarjetas Live`);
  });

  dom.btnClearBulk.addEventListener('click', () => {
    dom.bulkInputTextarea.value = '';
    dom.bulkInputCountBadge.textContent = '0 líneas';
    dom.bulkResultsList.innerHTML = `
      <div class="text-center py-8 text-xs text-slate-500 font-mono">
        Presiona "Iniciar Verificación en Lote" para procesar las tarjetas.
      </div>
    `;
    dom.countLiveBadge.textContent = '0';
    dom.countDieBadge.textContent = '0';
    dom.countWarningBadge.textContent = '0';
    dom.countTotalBadge.textContent = '0';
    dom.bulkProgressContainer.classList.add('hidden');
    latestBulkResults = null;
    showToast('Checker en lote limpiado', 'info');
  });

  document.querySelectorAll('.bulk-filter-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.bulk-filter-chip').forEach(b => {
        b.className = 'bulk-filter-chip text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white';
      });
      e.currentTarget.className = 'bulk-filter-chip text-[11px] px-2 py-0.5 rounded bg-electric-600 text-white';
      currentBulkFilter = e.currentTarget.getAttribute('data-filter');
      renderBulkResultsList(latestBulkResults, currentBulkFilter);
    });
  });

  // Check Digit Generator Input
  dom.inputPartialNumber.addEventListener('input', () => renderCheckDigitCalculator());
  dom.btnQuickFill15.addEventListener('click', () => {
    dom.inputPartialNumber.value = '4242 4242 4242 424';
    renderCheckDigitCalculator();
  });
  dom.btnQuickFillAmex14.addEventListener('click', () => {
    dom.inputPartialNumber.value = '3782 822463 1000';
    renderCheckDigitCalculator();
  });

  // Sandbox Search Filter
  dom.searchPresetInput.addEventListener('input', (e) => {
    renderSandboxCatalog(e.target.value);
  });

  // Documentation Modal
  dom.btnOpenDocs.addEventListener('click', () => dom.docsModal.classList.remove('hidden'));
  dom.btnCloseDocs.addEventListener('click', () => dom.docsModal.classList.add('hidden'));
  dom.btnCloseDocsFooter.addEventListener('click', () => dom.docsModal.classList.add('hidden'));
  dom.docsModal.addEventListener('click', (e) => {
    if (e.target === dom.docsModal) dom.docsModal.classList.add('hidden');
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!dom.docsModal.classList.contains('hidden')) dom.docsModal.classList.add('hidden');
      if (!dom.terminalModal.classList.contains('hidden')) dom.terminalModal.classList.add('hidden');
    }
  });
}

/**
 * App Initialization
 */
function init() {
  dom.cardChipContainer.innerHTML = CHIP_SVG;
  dom.cardContactlessContainer.innerHTML = CONTACTLESS_SVG;

  initExpirySelectors();

  // Load default Stripe test card
  dom.inputCardNumber.value = '4242 4242 4242 4242';
  dom.inputCardHolder.value = 'KINGLOTUSP';
  dom.inputCVV.value = '123';

  updateCardMockup();
  renderLuhnValidation();
  renderSandboxCatalog();
  renderCheckDigitCalculator();

  setupEventListeners();

  handleGenerateCards();
}

document.addEventListener('DOMContentLoaded', init);
