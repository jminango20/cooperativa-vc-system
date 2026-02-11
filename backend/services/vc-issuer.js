// ============================================
// SERVICIO DE EMISIÓN DE VERIFIABLE CREDENTIALS
// ============================================
// Este es el NÚCLEO del sistema. Aquí creamos y firmamos los VCs.

const { createJWT } = require('did-jwt');
const { cooperativaDID, signer } = require('../config/did');
const logger = require('../utils/logger');

/**
 * Crea y firma un Verifiable Credential (VC)
 *
 * @param {object} produtorData - Datos del productor { cpf, nome }
 * @param {object} entregaData - Datos de la entrega { produto, quantidade, unidade }
 * @returns {Promise<string>} - JWT firmado (el VC)
 */
async function emitirVC(produtorData, entregaData) {
  try {
    // ============================================
    // 1. CREAR EL PAYLOAD DEL VC
    // ============================================
    // El payload es el "contenido" de la credencial.
    // Sigue el estándar W3C Verifiable Credentials 2.0

    const ahora = Math.floor(Date.now() / 1000); // Timestamp actual en segundos
    const unAñoDespues = ahora + (365 * 24 * 60 * 60); // Expira en 1 año

    const payload = {
      // ============================================
      // CAMPOS JWT ESTÁNDAR
      // ============================================
      iss: cooperativaDID,                                  // Issuer (quien emite): DID de la cooperativa
      sub: `did:key:produtor:${produtorData.cpf}`,         // Subject (para quién): DID del productor
      iat: ahora,                                           // Issued at (cuándo se emitió)
      exp: unAñoDespues,                                    // Expiration (cuándo expira)

      // ============================================
      // CAMPO VC (VERIFIABLE CREDENTIAL)
      // ============================================
      vc: {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',        // Contexto estándar W3C
          'https://semear.app/contexts/v1'                 // Contexto personalizado (opcional)
        ],
        type: [
          'VerifiableCredential',                          // Tipo genérico
          'ReciboAgricola'                                 // Tipo específico de nuestra credencial
        ],
        credentialSubject: {
          // ID del sujeto (quien recibe la credencial)
          id: `did:key:produtor:${produtorData.cpf}`,

          // Datos del productor
          produtor: {
            nome: produtorData.nome,
            cpf: produtorData.cpf
          },

          // Datos de la entrega
          entrega: {
            produto: entregaData.produto,
            quantidade: entregaData.quantidade,
            unidade: entregaData.unidade,
            data: new Date().toISOString()                 // Fecha/hora de la entrega
          },

          // Datos de la cooperativa (quien emite)
          cooperativa: {
            nome: 'Cooperativa Semear Digital',
            did: cooperativaDID
          }
        }
      }
    };

    // ============================================
    // 2. FIRMAR EL VC (CREAR JWT)
    // ============================================
    // Usamos did-jwt para crear un JWT firmado.
    // El "signer" usa la clave privada de la cooperativa.

    const vcJWT = await createJWT(
      payload,           // Datos a firmar
      {
        issuer: cooperativaDID,
        signer: signer   // Firmante con clave privada
      },
      {
        alg: 'ES256K'    // Algoritmo de firma (secp256k1, compatible con Ethereum)
      }
    );

    // ============================================
    // 3. LOG DEL ÉXITO
    // ============================================
    logger.info('✅ VC emitido exitosamente', {
      produtor: produtorData.nome,
      cpf: produtorData.cpf,
      produto: entregaData.produto,
      quantidade: entregaData.quantidade
    });

    // ============================================
    // 4. RETORNAR EL JWT FIRMADO
    // ============================================
    // Este JWT ES el Verifiable Credential.
    // Puede ser verificado por cualquiera usando el DID público.
    return vcJWT;

  } catch (error) {
    logger.error('❌ Error al emitir VC', { error: error.message });
    throw new Error('Error al crear el Verifiable Credential');
  }
}

/**
 * Extrae información legible de un VC (JWT)
 * (Útil para debugging o mostrar info al usuario)
 *
 * @param {string} vcJWT - JWT del VC
 * @returns {object} - Datos decodificados del VC
 */
function decodificarVC(vcJWT) {
  try {
    // Un JWT tiene 3 partes separadas por puntos: HEADER.PAYLOAD.SIGNATURE
    // Nos interesa el PAYLOAD (parte del medio)
    const partes = vcJWT.split('.');
    if (partes.length !== 3) {
      throw new Error('JWT inválido');
    }

    // Decodificar el payload (está en Base64URL)
    const payloadBase64 = partes[1];
    const payloadJSON = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadJSON);

    return payload;
  } catch (error) {
    logger.error('❌ Error al decodificar VC', { error: error.message });
    throw new Error('Error al decodificar el VC');
  }
}

module.exports = {
  emitirVC,
  decodificarVC
};
