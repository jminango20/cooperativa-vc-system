// ============================================
// DID GENERATOR - Generador de DIDs Rotativos
// ============================================
// Genera DIDs determinísticos desde CPF con rotación configurable

const crypto = require('crypto');

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
      // Ej: 2026-02-19-H14
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      const hora = String(fecha.getHours()).padStart(2, '0');
      return `${año}-${mes}-${dia}-H${hora}`;

    case 'days':
      // Período por DÍA (testing rápido)
      // Ej: 2026-02-19
      return fecha.toISOString().split('T')[0];

    case 'weeks':
      // Período por SEMANA (PoC)
      // Ej: 2026-W08
      const semana = getWeekNumber(fecha);
      return `${fecha.getFullYear()}-W${String(semana).padStart(2, '0')}`;

    case 'months':
      // Período por MES (testing medio plazo)
      // Ej: 2026-02
      return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

    case 'years':
    default:
      // Período por 4 AÑOS (producción)
      // Ej: 2024-2028
      const añoActual = fecha.getFullYear();
      const inicioPeriodo = Math.floor(añoActual / 4) * 4;
      return `${inicioPeriodo}-${inicioPeriodo + 4}`;
  }
}

/**
 * Genera un DID determinístico desde un CPF con rotación
 * @param {string} cpf - CPF del produtor (solo números)
 * @returns {string} - DID en formato did:key:xxx
 */
function generarDIDDesdeCPF(cpf) {
  // Limpiar CPF (solo números)
  const cpfLimpio = cpf.replace(/\D/g, '');

  if (cpfLimpio.length !== 11) {
    throw new Error('CPF inválido');
  }

  // Obtener configuración desde ENV
  const modo = process.env.DID_ROTATION_PERIOD || 'years';
  const salt = process.env.DID_SALT || 'semear-cooperativa-2026';
  const periodo = calcularPeriodoActual(modo);

  // Crear seed determinístico desde CPF + período + salt
  const seed = cpfLimpio + periodo + salt;

  // Generar hash SHA-256 del seed
  const hash = crypto.createHash('sha256').update(seed).digest();

  // Convertir a base64url
  const hashBase64 = hash.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Crear DID formato did:key:z...
  const didSuffix = hashBase64.substring(0, 44);
  const did = `did:key:z${didSuffix}`;

  console.log(`🔑 DID generado [modo: ${modo}, período: ${periodo}]:`, did);

  return did;
}

module.exports = {
  generarDIDDesdeCPF,
  calcularPeriodoActual
};
