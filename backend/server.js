// ============================================
// SERVIDOR PRINCIPAL - COOPERATIVA VC BACKEND
// ============================================
// Este es el archivo principal que arranca el servidor Express

require('dotenv').config(); // Cargar variables de entorno

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

// ============================================
// CREAR APLICACIÓN EXPRESS
// ============================================
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES DE SEGURIDAD
// ============================================

// Helmet: añade headers de seguridad HTTP
app.use(helmet());

// CORS: permitir peticiones desde frontends en otros dominios
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173';
const allowedOrigins = allowedOriginsEnv.split(',');
const allowAll = allowedOrigins.includes('*');

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origin (ej: Postman, curl)
    if (!origin) return callback(null, true);

    // Si está en modo desarrollo con *, permitir todo
    if (allowAll) {
      callback(null, true);
    } else if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn('⚠️ Origen bloqueado por CORS', { origin });
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate limiting: máximo 100 peticiones por IP cada 15 minutos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo de peticiones
  message: {
    success: false,
    error: 'Demasiadas peticiones desde esta IP, por favor intente más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// ============================================
// MIDDLEWARES DE PARSING
// ============================================
// Parsear JSON en el body de las peticiones
app.use(express.json());

// Parsear URL-encoded data
app.use(express.urlencoded({ extended: true }));

// ============================================
// LOGGING DE PETICIONES
// ============================================
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// ============================================
// RUTAS
// ============================================
const vcRoutes = require('./routes/vc.routes');
app.use('/api', vcRoutes);

// Ruta raíz (bienvenida)
app.get('/', (req, res) => {
  res.json({
    message: 'API de Verifiable Credentials - Cooperativa Semear Digital',
    version: '1.0.0',
    endpoints: {
      emitirVC: 'POST /api/emitir-vc',
      obtenerVCs: 'GET /api/vcs/:cpf',
      infoCooperativa: 'GET /api/cooperativa/info',
      estadisticas: 'GET /api/stats',
      health: 'GET /api/health'
    },
    documentation: 'https://github.com/semear-digital/vc-backend'
  });
});

// ============================================
// MANEJO DE ERRORES 404
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    path: req.path
  });
});

// ============================================
// MANEJO DE ERRORES GLOBAL
// ============================================
app.use((err, req, res, next) => {
  logger.error('❌ Error no manejado', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });

  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// ARRANCAR SERVIDOR
// ============================================
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🌱 COOPERATIVA VC BACKEND                           ║
║                                                        ║
║   🚀 Servidor corriendo en puerto ${PORT}               ║
║   🌍 Entorno: ${process.env.NODE_ENV || 'development'}                    ║
║   📡 API Local: http://localhost:${PORT}                ║
║   🌐 API Red: ${process.env.API_URL || `http://localhost:${PORT}`}         ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);

  logger.info('✅ Servidor listo para recibir peticiones');
});

// ============================================
// MANEJO DE SEÑALES DE TERMINACIÓN
// ============================================
// Graceful shutdown cuando se detiene el servidor
process.on('SIGTERM', () => {
  logger.info('⚠️ Señal SIGTERM recibida, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('⚠️ Señal SIGINT recibida, cerrando servidor...');
  process.exit(0);
});

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Promesa rechazada no manejada', { reason });
});

process.on('uncaughtException', (error) => {
  logger.error('❌ Excepción no capturada', { error: error.message, stack: error.stack });
  process.exit(1);
});
