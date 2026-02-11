// ============================================
// VALIDADORES
// ============================================
// Funciones para validar datos de entrada (CPF, campos requeridos, etc.)

/**
 * Valida el formato de un CPF brasileño
 * @param {string} cpf - CPF a validar (solo números)
 * @returns {boolean} - true si es válido, false si no
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

  // Validar dígitos verificadores
  // (Algoritmo completo del CPF - módulo 11)
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
 * Valida los datos del produtor
 * @param {object} produtor - Objeto con cpf y nome
 * @returns {object} - { valido: boolean, error: string }
 */
function validarProdutor(produtor) {
  if (!produtor) {
    return { valido: false, error: 'Datos del produtor son requeridos' };
  }

  if (!produtor.cpf || !produtor.nome) {
    return { valido: false, error: 'CPF y nombre del produtor son requeridos' };
  }

  if (!validarCPF(produtor.cpf)) {
    return { valido: false, error: 'CPF inválido' };
  }

  if (produtor.nome.trim().length < 3) {
    return { valido: false, error: 'Nombre del produtor debe tener al menos 3 caracteres' };
  }

  return { valido: true };
}

/**
 * Valida los datos de la entrega
 * @param {object} entrega - Objeto con produto, quantidade, unidade
 * @returns {object} - { valido: boolean, error: string }
 */
function validarEntrega(entrega) {
  if (!entrega) {
    return { valido: false, error: 'Datos de la entrega son requeridos' };
  }

  if (!entrega.produto || !entrega.quantidade || !entrega.unidade) {
    return { valido: false, error: 'Producto, cantidad y unidad son requeridos' };
  }

  if (typeof entrega.quantidade !== 'number' || entrega.quantidade <= 0) {
    return { valido: false, error: 'Cantidad debe ser un número mayor a 0' };
  }

  if (entrega.produto.trim().length < 2) {
    return { valido: false, error: 'Nombre del producto debe tener al menos 2 caracteres' };
  }

  return { valido: true };
}

/**
 * Sanitizar CPF (remover caracteres especiales)
 * @param {string} cpf - CPF con o sin formato
 * @returns {string} - CPF solo con números
 */
function sanitizarCPF(cpf) {
  return cpf.replace(/[^\d]/g, '');
}

module.exports = {
  validarCPF,
  validarProdutor,
  validarEntrega,
  sanitizarCPF
};
