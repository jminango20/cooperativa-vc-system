// ============================================
// DID GENERATOR - Generador de DIDs
// ============================================
// Genera DIDs determinísticos desde CPF

/**
 * Genera un DID determinístico desde un CPF
 * @param {string} cpf - CPF del produtor (solo números)
 * @returns {string} - DID en formato did:key:xxx
 */
async function generarDIDDesdeCPF(cpf) {
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
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // Convertir a base58 (simulado con base64url para simplificar)
  const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Crear DID formato did:key:z...
  // Usamos los primeros 32 caracteres del hash
  const didSuffix = hashBase64.substring(0, 44);
  const did = `did:key:z${didSuffix}`;

  return did;
}

/**
 * Obtener o generar DID del productor
 * Guarda en localStorage para persistencia
 * @param {string} cpf - CPF del produtor
 * @returns {string} - DID del produtor
 */
async function obtenerMiDID(cpf) {
  // Generar DID desde CPF (siempre determinístico)
  const did = await generarDIDDesdeCPF(cpf);

  // Guardar en localStorage para referencia
  localStorage.setItem('mi_did', did);
  localStorage.setItem('mi_cpf', cpf.replace(/\D/g, ''));

  console.log('✅ DID del produtor:', did);
  return did;
}

/**
 * Verificar si tengo DID configurado
 * @returns {object} - { tiene: boolean, did: string|null, cpf: string|null }
 */
function verificarMiDID() {
  const did = localStorage.getItem('mi_did');
  const cpf = localStorage.getItem('mi_cpf');

  return {
    tiene: !!(did && cpf),
    did,
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

console.log('✅ DID Generator loaded');
