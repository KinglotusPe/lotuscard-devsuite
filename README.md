# LotusCard 🪷 // DevSuite by Kinglotusp • El Reyno de Loto

Una suite fintech de desarrollo y auditoría de medios de pago, creada por **Kinglotusp** para la comunidad **El Reyno de Loto**. Combina la precisión del **Algoritmo de Luhn (ISO/IEC 7812-1)**, el sintetizador algorítmico **LotusGen**, el auditor por lotes **LotusAuditor**, base de datos de inteligencia **BIN/IIN**, efectos de sonido y simulación de **Terminal POS / Pasarela de Pagos (Stripe Sandbox con 3D Secure)**.

---

## 👑 Identidad Oficial & Sello de Marca

- **Nombre Oficial:** **LotusCard // DevSuite**
- **Autor / Creador:** **Kinglotusp**
- **Comunidad Oficial:** [El Reyno de Loto (Telegram)](https://t.me/addlist/wigY-9BP0cEwMDMx)
- **Demo en Vivo (24/7):** [https://lotuscard-devsuite.vercel.app](https://lotuscard-devsuite.vercel.app)
- **Tema Visual Insignia:** *Royal Purple, Obsidian & Amber Gold* con flor de loto sagrada en SVG y efectos de brillo resplandeciente.

---

## 🌟 Módulos y Funcionalidades de la Suite

### 1. 🎴 Mockup 3D Parallax con Skin «Reyno de Loto»
- **Física 3D Reactiva:** La tarjeta se inclina con el cursor del ratón o deslizando el dedo en pantallas táctiles (`perspective(1000px) rotateX/Y`) proyectando un resplandor especular dinámico que sigue las coordenadas.
- **Skins de Lujo:**
  - 🪷 **Reyno de Loto (Signature):** Púrpura imperial, pizarra y oro ámbar con relieve dorado.
  - 🖤 **Obsidian Matte:** Negro mate carbón con tipografía de alto contraste.
  - 🔷 **Royal Blue:** Zafiro bancario con reflejo metálico.
  - 🪙 **Titanium Platinum:** Platino cepillado de grado empresarial.
  - 🌿 **Emerald Gold:** Verde esmeralda con ribetes dorados.
  - 🌹 **Ruby Rose:** Rubí profundo y borgoña.
- **Reverso Bancario:** Banda magnética, panel de firma con microimpresión *"AUTHORIZED SIGNATURE"*, código CVV reactivo y pie de tarjeta *"LotusCard // El Reyno de Loto • ISO/IEC 7810"*.

### 2. 🏦 Base de Datos de Inteligencia BIN / IIN (Offline)
- Identificación en tiempo real al ingresar 6 dígitos:
  - Banco emisor (JPMorgan Chase, Bank of America, Wells Fargo, BBVA, Santander, Bancolombia, Nu, Barclays, HSBC, etc.).
  - Tipo de tarjeta (Crédito, Débito, Prepagada).
  - Nivel (Classic, Gold, Platinum, Signature, World Elite, Sapphire, Infinite).
  - País, bandera emoji y moneda de emisión (USD, EUR, MXN, COP, GBP, JPY).

### 3. 🔊 Motor de Audio Nativo (`Web Audio API`)
- Síntesis de sonido pura en el navegador (sin dependencias de archivos `.mp3`):
  - 🔄 Giro mecánico de la tarjeta.
  - ⌨️ Clic acústico al digitar en el teclado.
  - 🔔 *Fintech Chime* armónico al aprobar pagos o validar checksums.
  - 🛑 *POS Decline Buzz* al detectar tarjetas declinadas o con Luhn erróneo.
  - Botón de silencio/activación en la cabecera.

### 4. ⚡ Terminal de Pasarela de Pagos (Stripe / Adyen Sandbox Simulator)
- Botón **"⚡ Procesar Cobro en Pasarela ($25.00 USD)"**:
  - Simula la comunicación con la red adquirente y el procesador de pagos.
  - **Desafío 3D Secure 2.2 (SCA) Interactivo:** Si se ingresa una tarjeta 3DS (ej: `4000 0027 6000 3184`), se abre la pantalla de verificación OTP para autorizar el desafío.
  - **Declinaciones reales:** Simula respuestas exactas de banco por `insufficient_funds`, `expired_card`, `incorrect_cvc`, `lost_card` o `generic_decline`.
  - Recibo de autorización, ID de cargo (`ch_...`) y visualizador JSON en vivo con copia rápida.

### 5. 🔮 LotusGen // Sintetizador Algorítmico de Patrones (`x`)
- Generación de 1 a 100 tarjetas válidas por Luhn a partir de cualquier máscara BIN (ej: `453201xxxxxxxxxx`).
- Criptográficamente seguro (`window.crypto.getRandomValues`).
- Exportación multiformato: **PIPE (`PAN|MM|AA|CVV`)**, **JSON**, **CSV** y **XML**.
- Botones de acción directa: **"Enviar a LotusAuditor"** y **"Cargar #1 en Mockup"**.

### 6. 🔍 LotusAuditor // Auditor de Integridad por Lotes (Live / Die / Expired)
- Análisis simultáneo de listas de cientos de tarjetas con clasificación instantánea:
  - 🟢 **Live (Válidas):** Cumplen Luhn y se encuentran vigentes.
  - 🟡 **Alertas (Vencidas / Warning):** Pasan Luhn pero la fecha de caducidad expiró o tienen CVV fuera de formato.
  - 🔴 **Die (Inválidas):** Fallan la suma de verificación o longitud de red.
- Barra de progreso dinámica, contadores en vivo y botón para **"Copiar Solo Live"**.

### 7. 🎯 Calculador de Dígito de Control & Catálogo Sandbox
- Cálculo matemático del dígito faltante exacto para cualquier secuencia incompleta:
  $$C = (10 - (S \pmod{10})) \pmod{10}$$
- Catálogo con tarjetas oficiales de prueba de Stripe documentadas para cada escenario de testeo.

---

## 💻 Ejecución del Proyecto

```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar tests automatizados
node test/luhn.test.js
```
