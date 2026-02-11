# 🌱 Backend de Verifiable Credentials - Cooperativa Semear Digital

Backend Node.js para emisión y gestión de Verifiable Credentials (VCs) para cooperativas agrícolas.

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta en Supabase (https://supabase.com)
- Git (opcional)

---

## 🚀 Setup Inicial

### 1. Instalar dependencias

```bash
npm install
```

#### Generar Private Key y DID

```bash
node generate-did.js
```

### 2. Configurar Supabase

Ve a tu proyecto en Supabase y crea las tablas necesarias:

```sql
-- Tabla de VCs emitidos
CREATE TABLE verifiable_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf_produtor VARCHAR(11) NOT NULL,
  nome_produtor VARCHAR(255) NOT NULL,
  vc_jwt TEXT NOT NULL,
  produto VARCHAR(100) NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  unidade VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_cpf ON verifiable_credentials(cpf_produtor);
CREATE INDEX idx_created ON verifiable_credentials(created_at DESC);

-- Tabla de cooperativas autorizadas
CREATE TABLE cooperativas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  did VARCHAR(255) UNIQUE NOT NULL,
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar cooperativa demo
INSERT INTO cooperativas (nome, did) VALUES
('Cooperativa Semear Digital', 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK');
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env` y completa con tus datos:

```bash
cp .env.example .env
```

Edita `.env`:

```env
PORT=3000

# Obtén estos datos en: https://supabase.com/dashboard/project/[tu-proyecto]/settings/api
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima-aqui

# DID de la cooperativa (puedes usar el de ejemplo o generar uno nuevo)
COOPERATIVA_DID=did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
COOPERATIVA_PRIVATE_KEY=tu-clave-privada-ed25519

NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Arrancar el servidor

**Modo desarrollo (con auto-reload):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor estará corriendo en: http://localhost:3000

---

## 📡 Endpoints de la API

### 1. Emitir un VC

**POST** `/api/emitir-vc`

```json
// Request body:
{
  "produtor": {
    "cpf": "12345678900",
    "nome": "João Silva"
  },
  "entrega": {
    "produto": "Leite cru",
    "quantidade": 50,
    "unidade": "Litros"
  }
}

// Response:
{
  "success": true,
  "vcJWT": "eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ...",
  "qrData": "eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ...",
  "message": "Verifiable Credential emitido exitosamente"
}
```

### 2. Obtener VCs de un productor

**GET** `/api/vcs/:cpf`

```bash
curl http://localhost:3000/api/vcs/12345678900
```

### 3. Información de la cooperativa

**GET** `/api/cooperativa/info`

### 4. Estadísticas

**GET** `/api/stats`

### 5. Health check

**GET** `/api/health`

---

## 🧪 Probar con cURL

```bash
# Emitir un VC
curl -X POST http://localhost:3000/api/emitir-vc \
  -H "Content-Type: application/json" \
  -d '{
    "produtor": {
      "cpf": "12345678900",
      "nome": "João Silva"
    },
    "entrega": {
      "produto": "Leite cru",
      "quantidade": 50,
      "unidade": "Litros"
    }
  }'

# Obtener VCs de un productor
curl http://localhost:3000/api/vcs/12345678900
```

---

## 🔒 Seguridad

- ✅ CORS configurado para orígenes específicos
- ✅ Rate limiting (100 req/15min por IP)
- ✅ Helmet.js para headers de seguridad
- ✅ Validación de CPF brasileño
- ✅ Sanitización de inputs
- ✅ Logs estructurados con Winston

---

## 📦 Deploy en Render.com

1. Crea una cuenta en https://render.com
2. Conecta tu repositorio GitHub
3. Crea un nuevo **Web Service**
4. Configura:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Añade las variables de entorno desde el dashboard
6. Despliega

Tu API estará disponible en: `https://tu-app.onrender.com`

---

## 📁 Estructura del Proyecto

```
backend/
├── config/
│   ├── supabase.js       # Configuración Supabase
│   └── did.js            # Configuración DID y firma
├── services/
│   ├── vc-issuer.js      # Lógica de emisión de VCs
│   └── vc-storage.js     # Almacenamiento en Supabase
├── routes/
│   └── vc.routes.js      # Endpoints HTTP
├── utils/
│   ├── validators.js     # Validación de datos
│   └── logger.js         # Sistema de logs
├── server.js             # Servidor principal
├── package.json
├── .env                  # Variables de entorno (NO subir a Git)
└── README.md
```

---

## 🐛 Troubleshooting

### Error: "Supabase URL o KEY no configuradas"
- Verifica que `.env` existe y tiene las variables correctas
- Reinicia el servidor después de editar `.env`

### Error: "CPF inválido"
- El CPF debe tener 11 dígitos válidos
- Usa solo números (sin puntos ni guiones)

### Error de CORS
- Añade tu origen a `ALLOWED_ORIGINS` en `.env`
- Formato: `http://localhost:3000,https://miapp.com`

---

## 📚 Más Información

- W3C Verifiable Credentials: https://www.w3.org/TR/vc-data-model/
- did-jwt documentation: https://github.com/decentralized-identity/did-jwt
- Supabase docs: https://supabase.com/docs

---

## 📄 Licencia

MIT License
