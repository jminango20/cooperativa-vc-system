// ============================================
// ALMACENAMIENTO TEMPORAL EN MEMORIA
// ============================================
// Fallback cuando Supabase no está disponible

const crypto = require('crypto');
const logger = require('../utils/logger');

// Almacén en memoria (se pierde al reiniciar el servidor)
const vcStore = new Map();

// TTL: 24 horas (tiempo que el VC estará disponible)
const VC_TTL = 24 * 60 * 60 * 1000;

/**
 * Guarda un VC en memoria con TTL
 */
function guardarVCEnMemoria(vcJWT, produtorData, entregaData) {
  // Generar ID único
  const id = crypto.randomUUID();

  // Crear registro
  const registro = {
    id,
    cpf_produtor: produtorData.cpf,
    nome_produtor: produtorData.nome,
    vc_jwt: vcJWT,
    produto: entregaData.produto,
    quantidade: entregaData.quantidade,
    unidade: entregaData.unidade,
    created_at: new Date().toISOString(),
    expires_at: Date.now() + VC_TTL
  };

  // Guardar en memoria
  vcStore.set(id, registro);

  logger.info('✅ VC guardado en memoria (fallback)', { id });

  // Programar eliminación automática
  setTimeout(() => {
    vcStore.delete(id);
    logger.info('🗑️ VC expirado eliminado de memoria', { id });
  }, VC_TTL);

  return registro;
}

/**
 * Obtiene un VC por ID desde memoria
 */
function obtenerVCDesdeMemoria(id) {
  const vc = vcStore.get(id);

  if (!vc) {
    throw new Error('VC no encontrado');
  }

  // Verificar si expiró
  if (Date.now() > vc.expires_at) {
    vcStore.delete(id);
    throw new Error('VC expirado');
  }

  return vc;
}

/**
 * Obtiene estadísticas del almacén en memoria
 */
function getMemoryStats() {
  return {
    totalVCs: vcStore.size,
    vcs: Array.from(vcStore.values()).map(vc => ({
      id: vc.id,
      produtor: vc.nome_produtor,
      created_at: vc.created_at
    }))
  };
}

module.exports = {
  guardarVCEnMemoria,
  obtenerVCDesdeMemoria,
  getMemoryStats
};
