-- Tabla de VCs emitidos
CREATE TABLE verifiable_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf_produtor VARCHAR(11) NOT NULL,
  nome_produtor VARCHAR(255) NOT NULL,
  vc_jwt TEXT NOT NULL,
  produto VARCHAR(100) NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  unidade VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_cpf (cpf_produtor),
  INDEX idx_created (created_at DESC)
);

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