// ============================================
// GENERADOR DE DID Y CLAVES PARA COOPERATIVA
// ============================================
// Este script genera un par de claves secp256k1 (compatible con ES256K)
// y crea un DID válido en formato did:key

const crypto = require('crypto');
const bs58 = require('bs58').default;
const secp256k1 = require('@noble/secp256k1');

console.log('\n🔐 GENERADOR DE DID Y CLAVES PARA COOPERATIVA');
console.log('━'.repeat(70));
console.log('\n⏳ Generando par de claves...\n');

// ============================================
// 1. GENERAR CLAVE PRIVADA ALEATORIA
// ============================================
// Generar 32 bytes aleatorios para la clave privada secp256k1
const privateKeyBytes = crypto.randomBytes(32);
const privateKeyHex = privateKeyBytes.toString('hex');

// ============================================
// 2. DERIVAR CLAVE PÚBLICA
// ============================================
// Obtener la clave pública correspondiente (comprimida, 33 bytes)
// Usamos @noble/secp256k1 para derivar la clave pública
const publicKeyBytes = secp256k1.getPublicKey(privateKeyBytes, true);

// ============================================
// 3. CREAR DID EN FORMATO did:key
// ============================================
// Un DID did:key tiene este formato:
// did:key:{multibase-encoded-public-key-with-codec}
//
// Para secp256k1 (ES256K):
// - Multicodec prefix: 0xe7 (231 en decimal) = secp256k1-pub
// - Codificación: base58-btc (Base58 Bitcoin)

// Añadir el prefix de multicodec para secp256k1-pub (0xe7 = 231)
const SECP256K1_MULTICODEC_PREFIX = 0xe7;

// Crear el buffer con prefix + clave pública
const multicodecPubKey = Buffer.concat([
  Buffer.from([SECP256K1_MULTICODEC_PREFIX]),
  Buffer.from(publicKeyBytes)
]);

// Codificar en base58-btc (empieza con 'z' para indicar base58btc)
const base58Encoded = bs58.encode(multicodecPubKey);
const did = 'did:key:z' + base58Encoded;

// ============================================
// 4. MOSTRAR RESULTADOS
// ============================================
console.log('✅ Claves generadas exitosamente!\n');
console.log('━'.repeat(70));
console.log('\n📋 COPIA ESTOS VALORES A TU ARCHIVO .env:\n');
console.log('━'.repeat(70));
console.log(`
COOPERATIVA_DID=${did}
COOPERATIVA_PRIVATE_KEY=${privateKeyHex}
`);
console.log('━'.repeat(70));

// ============================================
// 5. INFORMACIÓN ADICIONAL
// ============================================
console.log('\n📊 DETALLES TÉCNICOS:\n');
console.log(`   📌 Algoritmo: secp256k1 (ES256K)`);
console.log(`   📌 Clave pública (hex): ${Buffer.from(publicKeyBytes).toString('hex')}`);
console.log(`   📌 Longitud clave privada: ${privateKeyHex.length} caracteres (${privateKeyBytes.length} bytes)`);
console.log(`   📌 DID generado: ${did}`);

console.log('\n━'.repeat(70));
console.log('\n⚠️  IMPORTANTE - SEGURIDAD:\n');
console.log('   ✓ Guarda la clave privada en un lugar SEGURO');
console.log('   ✓ NUNCA la compartas ni la subas a GitHub');
console.log('   ✓ El archivo .env ya está en .gitignore');
console.log('   ✓ Si pierdes la clave, no podrás firmar VCs con este DID');
console.log('   ✓ Para producción, considera usar un KMS (Key Management System)');

console.log('\n━'.repeat(70));
console.log('\n✅ SIGUIENTE PASO:\n');
console.log('   1. Copia las variables de arriba a tu archivo .env');
console.log('   2. Guarda también el DID en Supabase (tabla cooperativas)');
console.log('   3. Ejecuta: npm run dev');
console.log('   4. Prueba el endpoint: POST http://localhost:3000/api/emitir-vc');
console.log('\n━'.repeat(70));
console.log('\n🎉 ¡Listo! Tu cooperativa ya tiene identidad digital.\n');
