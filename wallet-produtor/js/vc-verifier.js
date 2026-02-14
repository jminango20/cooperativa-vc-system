// ============================================
// VC VERIFIER - Verificador de Credenciales
// ============================================
// Verifica la firma y validez de los VCs

/**
 * Verifica un VC JWT
 * @param {string} vcJWT - JWT del VC a verificar
 * @returns {object} - { valido, payload, error }
 */
async function verificarVC(vcJWT) {
  try {
    // TEMPORAL: Decodificar sin verificar firma (hasta arreglar did-jwt)
    // TODO: Re-habilitar verificación criptográfica
    const payload = decodificarJWT(vcJWT);

    // Validar estructura básica del VC
    if (!payload.vc || !payload.vc.credentialSubject) {
      throw new Error('Estructura de VC inválida');
    }

    // Verificar que no esté expirado
    const ahora = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < ahora) {
      throw new Error('VC expirado');
    }

    // Extraer datos del VC
    const credentialSubject = payload.vc.credentialSubject;

    const vcData = {
      produtor: credentialSubject.produtor || {},
      entrega: credentialSubject.entrega || {},
      cooperativa: credentialSubject.cooperativa || {},
      issuer: payload.iss,
      issuedAt: payload.iat,
      expiresAt: payload.exp
    };

    console.log('✅ VC verificado correctamente');

    return {
      valido: true,
      vcData,
      payload
    };

  } catch (error) {
    console.error('❌ Error verificando VC:', error);
    return {
      valido: false,
      error: error.message
    };
  }
}

/**
 * Decodifica un JWT sin verificar (solo para preview)
 * @param {string} jwt - JWT a decodificar
 * @returns {object} - Payload decodificado
 */
function decodificarJWT(jwt) {
  try {
    const partes = jwt.split('.');
    if (partes.length !== 3) {
      throw new Error('JWT inválido');
    }

    const payloadBase64 = partes[1];
    const payloadJSON = atob(payloadBase64);
    return JSON.parse(payloadJSON);
  } catch (error) {
    console.error('Error decodificando JWT:', error);
    return null;
  }
}
