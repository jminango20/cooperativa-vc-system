// ============================================
// DID GENERATOR - Generador de DIDs Rotativos
// ============================================
// Genera DIDs determinísticos desde CPF con rotación configurable
// Requiere: config.js (WALLET_CONFIG)

/**
 * Helper: Calcular número de semana ISO
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Calcula período actual según configuración
 * @param {string} modo - 'hours', 'days', 'weeks', 'months', 'years'
 * @param {Date} fecha - Fecha para calcular período (default: now)
 * @returns {string} - Período actual
 */
function calcularPeriodoActual(modo = 'years', fecha = new Date()) {
  switch(modo) {
    case 'hours':
      // Período por HORA (demo)
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      const hora = String(fecha.getHours()).padStart(2, '0');
      return `${año}-${mes}-${dia}-H${hora}`;

    case 'days':
      // Período por DÍA (testing)
      return fecha.toISOString().split('T')[0];

    case 'weeks':
      // Período por SEMANA (PoC)
      const semana = getWeekNumber(fecha);
      return `${fecha.getFullYear()}-W${String(semana).padStart(2, '0')}`;

    case 'months':
      // Período por MES (testing medio plazo)
      return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

    case 'years':
    default:
      // Período por 4 AÑOS (producción)
      const añoActual = fecha.getFullYear();
      const inicioPeriodo = Math.floor(añoActual / 4) * 4;
      return `${inicioPeriodo}-${inicioPeriodo + 4}`;
  }
}

/**
 * Genera un DID determinístico desde un CPF con rotación
 * @param {string} cpf - CPF del produtor (solo números)
 * @param {string} modoOverride - Override del modo de rotación (opcional)
 * @returns {string} - DID en formato did:key:xxx
 */
async function generarDIDDesdeCPF(cpf, modoOverride = null) {
  // Limpiar CPF (solo números)
  const cpfLimpio = cpf.replace(/\D/g, '');

  if (cpfLimpio.length !== 11) {
    throw new Error('CPF inválido');
  }

  // Obtener configuración
  const modo = modoOverride || WALLET_CONFIG.rotationPeriod;
  const salt = WALLET_CONFIG.salt;
  const periodo = calcularPeriodoActual(modo);

  // Crear seed determinístico desde CPF + período + salt
  const seed = cpfLimpio + periodo + salt;

  // Generar hash SHA-256 del seed
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // Convertir a base64url
  const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Crear DID formato did:key:z...
  const didSuffix = hashBase64.substring(0, 44);
  const did = `did:key:z${didSuffix}`;

  console.log(`[DID] Generado [modo: ${modo}, período: ${periodo}]:`, did);

  return did;
}

/**
 * Obtener o generar DID del productor
 * @param {string} cpf - CPF del produtor
 * @returns {string} - DID del produtor
 */
async function obtenerMiDID(cpf) {
  // Generar DID desde CPF (determinístico con período actual)
  const did = await generarDIDDesdeCPF(cpf);

  // Guardar en localStorage
  localStorage.setItem('mi_cpf', cpf.replace(/\D/g, ''));

  // Inicializar modo de rotación si no existe
  if (!localStorage.getItem('did_rotation_mode')) {
    localStorage.setItem('did_rotation_mode', 'hours');
  }

  console.log('[DID] DID del produtor:', did);
  return did;
}

/**
 * Verificar si tengo DID configurado
 * @returns {object} - { tiene: boolean, did: string|null, cpf: string|null }
 */
function verificarMiDID() {
  const cpf = localStorage.getItem('mi_cpf');

  return {
    tiene: !!cpf,
    did: null, // Se genera dinámicamente según período
    cpf
  };
}

/**
 * Configurar mi identidad (primera vez)
 * @param {string} cpf - CPF del produtor
 */
async function configurarMiIdentidad(cpf) {
  const did = await obtenerMiDID(cpf);
  return { did, cpf: cpf.replace(/\D/g, '') };
}

/**
 * Generar DIDs históricos para verificación multi-período
 * @param {string} cpf - CPF del produtor
 * @returns {Promise<string[]>} - Array de DIDs (actual + históricos)
 */
async function generarDIDsHistoricos(cpf) {
  const cpfLimpio = cpf.replace(/\D/g, '');
  const modo = WALLET_CONFIG.rotationPeriod;
  const numPeriodos = WALLET_CONFIG.periodosHistoricos;

  const dids = [];
  const ahora = new Date();

  for (let i = 0; i < numPeriodos; i++) {
    let fechaHistorica = new Date(ahora);

    // Calcular fecha histórica según modo
    switch(modo) {
      case 'hours':
        fechaHistorica.setHours(ahora.getHours() - i);
        break;
      case 'days':
        fechaHistorica.setDate(ahora.getDate() - i);
        break;
      case 'weeks':
        fechaHistorica.setDate(ahora.getDate() - (i * 7));
        break;
      case 'months':
        fechaHistorica.setMonth(ahora.getMonth() - i);
        break;
      case 'years':
        // Período de 4 años, retroceder 4 años por cada iteración
        fechaHistorica.setFullYear(ahora.getFullYear() - (i * 4));
        break;
    }

    // Generar DID para ese período histórico
    const periodo = calcularPeriodoActual(modo, fechaHistorica);
    const seed = cpfLimpio + periodo + WALLET_CONFIG.salt;

    // Hash SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(seed);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // Convertir a base64url
    const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const didSuffix = hashBase64.substring(0, 44);
    const did = `did:key:z${didSuffix}`;

    dids.push(did);
  }

  console.log(`[DID] ${dids.length} DIDs históricos generados [modo: ${modo}]`);
  return dids;
}

console.log('[OK] DID Generator loaded (rotativo)');
