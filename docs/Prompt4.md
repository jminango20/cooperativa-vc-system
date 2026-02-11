### **📝 PROMPT 4: Verificador Web Público (Estático)**
```
Crea una aplicación web ESTÁTICA para verificar autenticidad de Verifiable Credentials agrícolas. Deploy en GitHub Pages, Vercel o Netlify.

CASOS DE USO:
- Auditor governo verifica entregas
- Banco verifica histórico para crédito
- Indústria láctea verifica origem
- Certificadora verifica produção orgânica

DISEÑO PROFISSIONAL:
- Cores confiança:
  --azul-principal: #003D82 (Embrapa)
  --verde-acento: #00A859
  --cinza-fundo: #F8F9FA
  --branco: #FFFFFF
  --sucesso: #28A745
  --erro: #DC3545

- Logo Embrapa + Semear (header)

- Clean, minimalista, foco verificação

ESTRUTURA PÁGINAS:

1. PÁGINA INICIAL (index.html):
   
   - Hero Section:
     * Título: "Verificador de Recibos Agrícolas"
     * Subtítulo: "Sistema oficial de validação Semear Digital"
     * Logos: Embrapa + Semear
     * Descrição: "Verifique a autenticidade de recibos digitais emitidos por cooperativas autorizadas"
   
   - CTA principal:
     * Botão grande: "🔍 Verificar Recibo Agora"
     * Verde Embrapa
     * Abre scanner
   
   - Como funciona (3 passos):
     1. 📱 Escanear QR do recibo
     2. ⚙️ Sistema valida assinatura
     3. ✅ Resultado instantâneo
   
   - Estatísticas (opcional):
     * "Mais de X recibos verificados"
     * "Y cooperativas autorizadas"
   
   - Link: "Como funciona?" → página explicativa

2. VERIFICAÇÃO:
   
   - Scanner fullscreen:
     * html5-qrcode
     * Cuadro guia
     * Instrução: "Aponte para o QR do recibo"
   
   - Ao detectar QR:
     1. Parar scanner
     2. Loading: "Verificando assinatura..."
     3. Processar VC:
        - Decodificar JWT
        - Verificar firma criptográfica (did-jwt)
        - Validar estrutura W3C
        - Checar issuer em lista cooperativas
        - Verificar não expirado
     4. Mostrar resultado

3. RESULTADO VÁLIDO:
   
   - Card verde grande:
     * ✅ Icon grande
     * "Recibo Autêntico e Verificado"
   
   - Informações:
     * 👤 Produtor
       - Nome: [nome completo]
       - CPF: [XXX.XXX.XXX-XX] (parcialmente oculto)
     
     * 📦 Entrega
       - Produto: [produto]
       - Quantidade: [quantidade] [unidade]
       - Data: [DD/MM/YYYY HH:mm]
     
     * 🏢 Cooperativa Emissora
       - Nome: [nome cooperativa]
       - Status: ✅ Autorizada
     
     * 🔐 Validação
       - Assinatura: ✅ Válida
       - Verificado em: [timestamp agora]
       - ID Verificação: [random hash]
   
   - Botões:
     * "Verificar Outro Recibo"
     * "Baixar Comprovante" (PDF ou print)

4. RESULTADO INVÁLIDO:
   
   - Card vermelho:
     * ❌ Icon
     * "Recibo Inválido ou Adulterado"
   
   - Razão da falha:
     * "Assinatura criptográfica inválida"
     OU
     * "Cooperativa emissora não autorizada"
     OU
     * "Formato não conforme padrão W3C"
     OU
     * "Recibo expirado"
   
   - Alerta:
     * "⚠️ Este recibo pode ter sido falsificado"
     * "Não aceite como comprovante válido"
   
   - Botão: "Tentar Outro Recibo"

5. PÁGINA "COMO FUNCIONA" (como-funciona.html):
   
   - Introdução:
     * O que são Verifiable Credentials
     * Por que são seguros
   
   - Fluxo visual (diagrama):
```
     1. Cooperativa emite → Recibo Digital
     2. Produtor recebe → No celular
     3. Produtor mostra → QR Code
     4. Verificador escaneia → Este site
     5. Sistema valida → Assinatura criptográfica
     6. Resultado → ✅ ou ❌
```
   
   - Segurança:
     * "Assinaturas criptográficas Ed25519"
     * "Padrão W3C Verifiable Credentials"
     * "Impossível falsificar"
   
   - FAQ:
     * O que garante autenticidade?
     * Preciso de internet?
     * Meus dados são armazenados?
     * Quanto custa usar?
   
   - Link voltar homepage

LISTA COOPERATIVAS AUTORIZADAS:
Hardcoded em JavaScript:
```javascript
const COOPERATIVAS_AUTORIZADAS = [
  {
    nome: "Cooperativa Semear Digital",
    did: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    ativa: true
  }
  // Adicionar mais cooperativas aqui
];
```

VERIFICAÇÃO (client-side puro):
```javascript
async function verificarVC(vcJWT) {
  try {
    // 1. Decodificar JWT
    const decoded = jwt_decode(vcJWT);
    
    // 2. Verificar firma
    const verified = await didJWT.verifyJWT(vcJWT, {
      resolver: getResolver()
    });
    
    // 3. Validar issuer
    const issuer = verified.payload.iss;
    const coop = COOPERATIVAS_AUTORIZADAS.find(c => c.did === issuer);
    if (!coop || !coop.ativa) {
      return { valido: false, erro: "Cooperativa não autorizada" };
    }
    
    // 4. Validar expiração
    if (verified.payload.exp < Date.now() / 1000) {
      return { valido: false, erro: "Recibo expirado" };
    }
    
    // 5. Validar estrutura
    if (!verified.payload.vc?.credentialSubject) {
      return { valido: false, erro: "Formato inválido" };
    }
    
    return {
      valido: true,
      dados: verified.payload.vc.credentialSubject,
      cooperativa: coop.nome
    };
    
  } catch (error) {
    return {
      valido: false,
      erro: "Assinatura criptográfica inválida"
    };
  }
}
```

TECNOLOGIAS:
- HTML5 + CSS3 + Vanilla JavaScript
- html5-qrcode (CDN)
- did-jwt (CDN)
- jwt-decode (CDN): https://cdn.jsdelivr.net/npm/jwt-decode@3/build/jwt-decode.min.js
- SIN backend (100% estático)
- SIN base de datos

SEGURIDAD:
- HTTPS obrigatório
- Content Security Policy
- No almacenar datos verificados
- No cookies, no tracking
- Privacy-first

ESTRUCTURA:
/verificador-web
  - index.html (página principal)
  - como-funciona.html
  - css/
    - style.css
    - verificador.css
  - js/
    - app.js (main)
    - verificador.js (lógica verificación)
    - cooperativas.js (lista DIDs)
  - assets/
    - logo-embrapa.svg
    - logo-semear.svg
    - diagrama-fluxo.svg
  - README.md

RESPONSIVE:
- Mobile-first
- Funciona bem em celular (verificadores usam celular)

SEO:
- Meta tags
- Open Graph
- Schema.org markup

ANALYTICS (opcional):
- Google Analytics ou Plausible (privacy-friendly)
- Trackear: verificações válidas vs inválidas

DEPLOYMENT:
- GitHub Pages
- Netlify
- Vercel
- Custom domain: verificar.semear.app

NO REQUIERE:
- Backend
- Base de datos
- Autenticación
- Build process

Incluye:
- README deployment
- Documentación técnica
- Guia uso para verificadores