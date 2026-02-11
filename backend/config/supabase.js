// ============================================
// CONFIGURACIÓN DE SUPABASE
// ============================================
// Este archivo crea la conexión con la base de datos Supabase.
// Supabase es PostgreSQL en la nube con API REST automática.

const { createClient } = require('@supabase/supabase-js');

// Cargamos las variables de entorno desde .env
require('dotenv').config();

// Validamos que existan las variables necesarias
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ ERROR: Faltan variables SUPABASE_URL o SUPABASE_ANON_KEY en .env');
  process.exit(1); // Detenemos el servidor si no hay configuración
}

// Creamos el cliente de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Exportamos para usarlo en otros archivos
module.exports = supabase;

// LOG para confirmar que se cargó correctamente
console.log('✅ Supabase configurado correctamente');
