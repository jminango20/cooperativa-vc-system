## ☁️ **Arquitectura Cloud Deployment**
```
┌─────────────────────────────────────────────────┐
│ SUPABASE (Base de Datos + Auth)                │
│ - PostgreSQL gratis hasta 500MB                │
│ - REST API automática                          │
│ - Real-time subscriptions                     │
└─────────────────────────────────────────────────┘
                    ↑
                    │
┌─────────────────────────────────────────────────┐
│ BACKEND API (Render.com / Railway.app)         │
│ https://api-cooperativa.onrender.com           │
│ - Node.js + Express                            │
│ - Emite VCs                                    │
│ - Conecta con Supabase                         │
└─────────────────────────────────────────────────┘
                    ↑
          ┌─────────┴─────────┐
          │                   │
┌─────────────────┐  ┌────────────────────┐
│ ISSUER WEB      │  │ PWA PRODUTOR       │
│ (Vercel/Netlify)│  │ (Vercel/Netlify)   │
│ cooperativa.    │  │ wallet.            │
│ semear.app      │  │ semear.app         │
└─────────────────┘  └────────────────────┘
                    
┌─────────────────────────────────────────────────┐
│ VERIFICADOR WEB (GitHub Pages / Netlify)       │
│ https://verificar.semear.app                   │
│ - 100% estático (sin backend)                  │
│ - Verificación client-side                     │
└─────────────────────────────────────────────────┘