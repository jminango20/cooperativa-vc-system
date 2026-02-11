// ============================================
// RUTAS DE LA API - VERIFIABLE CREDENTIALS
// ============================================
// Este archivo define los endpoints HTTP de la API

const express = require('express');
const router = express.Router();

// Importar servicios
const { emitirVC } = require('../services/vc-issuer');
const { guardarVC, obtenerVCsPorCPF, obtenerEstadisticas } = require('../services/vc-storage');
const { validarProdutor, validarEntrega, sanitizarCPF } = require('../utils/validators');
const logger = require('../utils/logger');
const { cooperativaDID } = require('../config/did');

// ============================================
// POST /api/emitir-vc
// ============================================
// Endpoint principal: emite y guarda un VC
router.post('/emitir-vc', async (req, res) => {
  try {
    const { produtor, entrega } = req.body;

    // ============================================
    // 1. VALIDAR DATOS DE ENTRADA
    // ============================================
    const validacionProdutor = validarProdutor(produtor);
    if (!validacionProdutor.valido) {
      return res.status(400).json({
        success: false,
        error: validacionProdutor.error
      });
    }

    const validacionEntrega = validarEntrega(entrega);
    if (!validacionEntrega.valido) {
      return res.status(400).json({
        success: false,
        error: validacionEntrega.error
      });
    }

    // ============================================
    // 2. SANITIZAR CPF
    // ============================================
    const cpfLimpio = sanitizarCPF(produtor.cpf);
    const produtorData = {
      cpf: cpfLimpio,
      nome: produtor.nome.trim()
    };

    const entregaData = {
      produto: entrega.produto.trim(),
      quantidade: parseFloat(entrega.quantidade),
      unidade: entrega.unidade.trim()
    };

    // ============================================
    // 3. EMITIR VC (CREAR Y FIRMAR)
    // ============================================
    const vcJWT = await emitirVC(produtorData, entregaData);

    // ============================================
    // 4. GUARDAR EN BASE DE DATOS
    // ============================================
    await guardarVC(vcJWT, produtorData, entregaData);

    // ============================================
    // 5. RESPONDER CON ÉXITO
    // ============================================
    logger.info('✅ VC emitido y guardado correctamente', {
      produtor: produtorData.nome,
      cpf: cpfLimpio
    });

    return res.status(201).json({
      success: true,
      vcJWT,           // El JWT completo (Verifiable Credential)
      qrData: vcJWT,   // Mismo JWT para generar QR
      message: 'Verifiable Credential emitido exitosamente'
    });

  } catch (error) {
    logger.error('❌ Error en /api/emitir-vc', { error: error.message });

    return res.status(500).json({
      success: false,
      error: 'Error al emitir el Verifiable Credential',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// GET /api/vcs/:cpf
// ============================================
// Obtiene todos los VCs de un productor
router.get('/vcs/:cpf', async (req, res) => {
  try {
    const cpf = sanitizarCPF(req.params.cpf);

    // Validar CPF
    if (!validarProdutor({ cpf, nome: 'dummy' }).valido) {
      return res.status(400).json({
        success: false,
        error: 'CPF inválido'
      });
    }

    // Obtener VCs de la base de datos
    const vcs = await obtenerVCsPorCPF(cpf);

    return res.json({
      success: true,
      cpf,
      totalVCs: vcs.length,
      vcs
    });

  } catch (error) {
    logger.error('❌ Error en /api/vcs/:cpf', { error: error.message });

    return res.status(500).json({
      success: false,
      error: 'Error al obtener VCs',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// GET /api/health
// ============================================
// Health check (para monitoreo de Render/Railway)
router.get('/health', (req, res) => {
  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// ============================================
// GET /api/cooperativa/info
// ============================================
// Información de la cooperativa
router.get('/cooperativa/info', (req, res) => {
  return res.json({
    success: true,
    cooperativa: {
      nome: 'Cooperativa Semear Digital',
      did: cooperativaDID
    }
  });
});

// ============================================
// GET /api/stats
// ============================================
// Estadísticas generales
router.get('/stats', async (req, res) => {
  try {
    const stats = await obtenerEstadisticas();

    return res.json({
      success: true,
      stats
    });

  } catch (error) {
    logger.error('❌ Error en /api/stats', { error: error.message });

    return res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

module.exports = router;
