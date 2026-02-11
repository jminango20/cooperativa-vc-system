---

## 🚀 **PROMPTS ACTUALIZADOS PARA CLOUD**

### **📝 PROMPT 1: Backend Cooperativa (Cloud Ready)**
```
Crea un backend Node.js para una cooperativa agrícola que emite Verifiable Credentials (VCs) para productores rurales, listo para deploy en Render.com o Railway.app.

REQUISITOS TÉCNICOS:
- Node.js + Express (JavaScript vanilla, NO TypeScript)
- did-jwt para crear y firmar VCs
- Supabase como base de datos PostgreSQL
- @supabase/supabase-js SDK
- CORS configurado para múltiples orígenes (producción + desarrollo)
- dotenv para variables de entorno

BASE DE DATOS SUPABASE:
Tabla: verifiable_credentials
- id (UUID, primary key)
- cpf_produtor (VARCHAR 11)
- nome_produtor (VARCHAR 255)
- vc_jwt (TEXT)
- produto (VARCHAR 100)
- quantidade (DECIMAL)
- unidade (VARCHAR 20)
- created_at (TIMESTAMP)

Tabla: cooperativas
- id (UUID)
- nome (VARCHAR 255)
- did (VARCHAR 255, unique)
- ativa (BOOLEAN)

ENDPOINTS:

1. POST /api/emitir-vc
   Request body:
   {
     "produtor": { "cpf": "12345678900", "nome": "João Silva" },
     "entrega": { "produto": "Leite cru", "quantidade": 50, "unidade": "Litros" }
   }
   
   Response:
   {
     "success": true,
     "vcJWT": "eyJhbGc...",
     "qrData": "eyJhbGc..." // mismo JWT para QR
   }

2. GET /api/vcs/:cpf
   Retorna todos los VCs de un productor por CPF

3. GET /api/health
   Health check para monitoreo

4. GET /api/cooperativa/info
   Retorna DID e info de la cooperativa

ESTRUCTURA VC (W3C VC 2.0):
{
  iss: "did:key:z6Mk...", // DID cooperativa
  sub: "did:key:produtor:12345678900", // DID produtor
  iat: timestamp,
  exp: timestamp + 1 year,
  vc: {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential", "ReciboAgricola"],
    "credentialSubject": {
      "id": "did:key:produtor:12345678900",
      "produtor": { "nome": "João Silva", "cpf": "12345678900" },
      "entrega": {
        "produto": "Leite cru",
        "quantidade": 50,
        "unidade": "Litros",
        "data": "2025-02-11T15:30:00Z"
      },
      "cooperativa": {
        "nome": "Cooperativa Semear Digital",
        "did": "did:key:z6Mk..."
      }
    }
  }
}

CONFIGURACIÓN:
Variables de entorno (.env):
- PORT=3000
- SUPABASE_URL=https://xxx.supabase.co
- SUPABASE_ANON_KEY=eyJhbGc...
- COOPERATIVA_DID=did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
- COOPERATIVA_PRIVATE_KEY=0x... (Ed25519)
- NODE_ENV=production
- ALLOWED_ORIGINS=https://cooperativa.semear.app,https://wallet.semear.app

CORS:
- Permitir orígenes de ALLOWED_ORIGINS
- Métodos: GET, POST, OPTIONS
- Headers: Content-Type, Authorization

ESTRUCTURA DE ARCHIVOS:
/backend
  - server.js (Express server)
  - config/
    - supabase.js (Supabase client)
    - did.js (DID y keys de cooperativa)
  - services/
    - vc-issuer.js (lógica emisión VCs)
    - vc-storage.js (guardar en Supabase)
  - routes/
    - vc.routes.js (endpoints VCs)
  - utils/
    - validators.js (validación CPF, datos)
    - crypto.js (firma Ed25519)
  - package.json
  - .env.example
  - README.md (setup + deploy instructions)
  - render.yaml (config Render.com) o railway.json

SEGURIDAD:
- Validar CPF formato brasileiro
- Rate limiting (express-rate-limit)
- Helmet.js para headers seguridad
- Input sanitization
- Logging con winston

DEPLOYMENT:
- Compatible con Render.com (free tier)
- Compatible con Railway.app
- Scripts: "start": "node server.js"
- Health check endpoint para monitoreo

LOGGING:
- Winston para logs estructurados
- Log levels: error, warn, info
- Log cuando se emite VC exitosamente

Incluye README con:
- Setup Supabase (crear tablas)
- Variables de entorno necesarias
- Instrucciones deploy Render.com
- Endpoints documentados
```