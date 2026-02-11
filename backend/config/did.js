// ============================================
// CONFIGURACIÓN DID (Decentralized Identifier)
// ============================================
// Este archivo maneja la identidad digital de la cooperativa.
// Un DID es como un "DNI digital" único que puede firmar credenciales.

const { ES256KSigner } = require('did-jwt');

require('dotenv').config();

// ============================================
// ¿QUÉ ES UN DID?
// ============================================
// Ejemplo: did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
//
// - "did" → Protocolo (Decentralized Identifier)
// - "key" → Método (basado en clave pública)
// - "z6Mk..." → Clave pública codificada en Base58
//
// Con el DID + clave privada, la cooperativa puede:
// ✅ Firmar credenciales (como firmar un documento)
// ✅ Cualquiera puede verificar la firma con el DID público

// Validamos que existan las variables necesarias
if (!process.env.COOPERATIVA_DID || !process.env.COOPERATIVA_PRIVATE_KEY) {
  console.error('❌ ERROR: Faltan variables COOPERATIVA_DID o COOPERATIVA_PRIVATE_KEY en .env');
  process.exit(1);
}

// Datos de la cooperativa
const cooperativaDID = process.env.COOPERATIVA_DID;
const cooperativaPrivateKey = process.env.COOPERATIVA_PRIVATE_KEY;

// ============================================
// CREAR FIRMANTE (SIGNER)
// ============================================
// Un "signer" es un objeto que puede firmar datos con la clave privada.
// Usamos ES256K (algoritmo de firma elíptica, el mismo que usa Bitcoin/Ethereum)

// Convertimos la clave privada de string a Buffer (formato binario)
const privateKeyBuffer = Buffer.from(cooperativaPrivateKey, 'hex');

// Creamos el firmante
const signer = ES256KSigner(privateKeyBuffer);

// ============================================
// EXPORTAR
// ============================================
module.exports = {
  cooperativaDID,      // DID público de la cooperativa
  signer,              // Objeto para firmar JWTs
  cooperativaPrivateKey // (solo para casos especiales)
};

console.log('✅ DID de cooperativa cargado:', cooperativaDID);
