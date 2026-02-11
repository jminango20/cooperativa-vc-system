// ============================================
// SISTEMA DE LOGS CON WINSTON
// ============================================
// Winston es una librería para registrar eventos del servidor
// (errores, éxitos, advertencias, debug info)

const winston = require('winston');

// Configuración de formato de logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    // Si hay metadata adicional, la agregamos
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    return log;
  })
);

// Crear el logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Logs en consola (siempre)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),

    // Logs en archivo de errores (solo errores)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),

    // Logs en archivo general (todos los niveles)
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Crear directorio de logs si no existe
const fs = require('fs');
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

module.exports = logger;
