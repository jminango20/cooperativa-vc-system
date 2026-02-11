// ============================================
// SERVICIO DE ALMACENAMIENTO DE VCs
// ============================================
// Este servicio guarda los VCs emitidos en Supabase (PostgreSQL)

const supabase = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * Guarda un VC en la base de datos
 *
 * @param {string} vcJWT - El JWT del VC
 * @param {object} produtorData - Datos del productor
 * @param {object} entregaData - Datos de la entrega
 * @returns {Promise<object>} - Registro insertado
 */
async function guardarVC(vcJWT, produtorData, entregaData) {
  try {
    // ============================================
    // PREPARAR DATOS PARA INSERTAR
    // ============================================
    const registro = {
      cpf_produtor: produtorData.cpf,
      nome_produtor: produtorData.nome,
      vc_jwt: vcJWT,
      produto: entregaData.produto,
      quantidade: entregaData.quantidade,
      unidade: entregaData.unidade
      // created_at se crea automáticamente en Supabase
    };

    // ============================================
    // INSERTAR EN SUPABASE
    // ============================================
    const { data, error } = await supabase
      .from('verifiable_credentials')
      .insert([registro])
      .select(); // Retorna el registro insertado

    // ============================================
    // MANEJO DE ERRORES
    // ============================================
    if (error) {
      logger.error('❌ Error al guardar VC en Supabase', {
        error: error.message,
        details: error.details
      });
      throw new Error('Error al guardar el VC en la base de datos');
    }

    // ============================================
    // LOG DEL ÉXITO
    // ============================================
    logger.info('✅ VC guardado en base de datos', {
      id: data[0].id,
      cpf: produtorData.cpf,
      produto: entregaData.produto
    });

    return data[0]; // Retornamos el registro insertado

  } catch (error) {
    logger.error('❌ Error al guardar VC', { error: error.message });
    throw error;
  }
}

/**
 * Obtiene todos los VCs de un productor por CPF
 *
 * @param {string} cpf - CPF del productor
 * @returns {Promise<Array>} - Lista de VCs del productor
 */
async function obtenerVCsPorCPF(cpf) {
  try {
    const { data, error } = await supabase
      .from('verifiable_credentials')
      .select('*')
      .eq('cpf_produtor', cpf)
      .order('created_at', { ascending: false }); // Más recientes primero

    if (error) {
      logger.error('❌ Error al obtener VCs de Supabase', {
        error: error.message,
        cpf
      });
      throw new Error('Error al obtener VCs de la base de datos');
    }

    logger.info('📋 VCs obtenidos', {
      cpf,
      cantidad: data.length
    });

    return data;

  } catch (error) {
    logger.error('❌ Error al obtener VCs', { error: error.message });
    throw error;
  }
}

/**
 * Obtiene un VC específico por ID
 *
 * @param {string} id - UUID del VC
 * @returns {Promise<object>} - Registro del VC
 */
async function obtenerVCPorId(id) {
  try {
    const { data, error } = await supabase
      .from('verifiable_credentials')
      .select('*')
      .eq('id', id)
      .single(); // Retorna un solo registro

    if (error) {
      logger.error('❌ Error al obtener VC por ID', {
        error: error.message,
        id
      });
      throw new Error('VC no encontrado');
    }

    return data;

  } catch (error) {
    logger.error('❌ Error al obtener VC por ID', { error: error.message });
    throw error;
  }
}

/**
 * Obtiene estadísticas generales de VCs
 *
 * @returns {Promise<object>} - Estadísticas
 */
async function obtenerEstadisticas() {
  try {
    // Total de VCs emitidos
    const { count: totalVCs, error: errorCount } = await supabase
      .from('verifiable_credentials')
      .select('*', { count: 'exact', head: true });

    if (errorCount) throw errorCount;

    // Total de productores únicos
    const { data: productores, error: errorProductores } = await supabase
      .from('verifiable_credentials')
      .select('cpf_produtor');

    if (errorProductores) throw errorProductores;

    const productoresUnicos = [...new Set(productores.map(p => p.cpf_produtor))];

    return {
      totalVCs,
      productoresUnicos: productoresUnicos.length,
      ultimaActualizacion: new Date().toISOString()
    };

  } catch (error) {
    logger.error('❌ Error al obtener estadísticas', { error: error.message });
    throw error;
  }
}

module.exports = {
  guardarVC,
  obtenerVCsPorCPF,
  obtenerVCPorId,
  obtenerEstadisticas
};
