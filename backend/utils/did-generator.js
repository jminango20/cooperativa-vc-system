// ============================================
// DID GENERATOR - Generador de DIDs
// ============================================
// Genera DIDs determinísticos desde CPF

const crypto = require('crypto');

/**
 * Genera un DID determinístico desde un CPF
 * @param {string} cpf - CPF del produtor (solo números)
 * @returns {string} - DID en formato did:key:xxx
 */
function generarDIDDesdeCPF(cpf) {
  // Limpiar CPF (solo números)
  const cpfLimpio = cpf.replace(/\D/g, '');

  if (cpfLimpio.length !== 11) {
    throw new Error('CPF inválido');
  }

  // Crear seed determinístico desde CPF
  // Usamos un salt para hacer el DID único al proyecto
  const salt = 'semear-cooperativa-2026';
  const seed = cpfLimpio + salt;

  // Generar hash SHA-256 del seed
  const hash = crypto.createHash('sha256').update(seed).digest();

  // Convertir a base64url
  const hashBase64 = hash.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Crear DID formato did:key:z...
  // Usamos los primeros 44 caracteres del hash
  const didSuffix = hashBase64.substring(0, 44);
  const did = `did:key:z${didSuffix}`;

  return did;
}

module.exports = {
  generarDIDDesdeCPF
};
