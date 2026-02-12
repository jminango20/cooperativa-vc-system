// ============================================
// VALIDADORES
// ============================================
// Funciones para validar datos de entrada

/**
 * Valida un CPF brasileño
 * @param {string} cpf - CPF a validar (puede tener puntos y guiones)
 * @returns {boolean} - true si es válido
 */
function validarCPF(cpf) {
  // Remover caracteres no numéricos
  cpf = cpf.replace(/[^\d]/g, '');

  // Validar longitud
  if (cpf.length !== 11) {
    return false;
  }

  // Validar que no sea una secuencia repetida (ej: 11111111111)
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  // Validar dígitos verificadores (algoritmo oficial CPF)
  let suma = 0;
  let resto;

  // Primer dígito verificador
  for (let i = 1; i <= 9; i++) {
    suma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  resto = (suma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  // Segundo dígito verificador
  suma = 0;
  for (let i = 1; i <= 10; i++) {
    suma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  resto = (suma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

/**
 * Formatea un CPF con máscara 000.000.000-00
 * @param {string} cpf - CPF sin formato
 * @returns {string} - CPF formatado
 */
function formatarCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length <= 3) return cpf;
  if (cpf.length <= 6) return cpf.slice(0, 3) + '.' + cpf.slice(3);
  if (cpf.length <= 9) return cpf.slice(0, 3) + '.' + cpf.slice(3, 6) + '.' + cpf.slice(6);

  return cpf.slice(0, 3) + '.' + cpf.slice(3, 6) + '.' + cpf.slice(6, 9) + '-' + cpf.slice(9, 11);
}

/**
 * Valida que un campo no esté vacío
 * @param {string} valor - Valor a validar
 * @returns {boolean}
 */
function validarCampoRequerido(valor) {
  return valor && valor.trim().length > 0;
}

/**
 * Valida que una cantidad sea un número positivo
 * @param {number} cantidad - Cantidad a validar
 * @returns {boolean}
 */
function validarCantidad(cantidad) {
  return !isNaN(cantidad) && parseFloat(cantidad) > 0;
}

console.log('✅ Validators loaded');
