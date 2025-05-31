# 🚀 Guia de Implantação - ConverteAI

Este guia fornece instruções detalhadas para fazer o deploy da aplicação ConverteAI em diferentes ambientes.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Domínio configurado (para produção)
- Certificados SSL (para HTTPS)
- Servidor com pelo menos 2GB RAM e 20GB de armazenamento

## 🐳 Deploy com Docker (Recomendado)

### 1. Preparação do Ambiente

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/converteai.git
cd converteai

# Copie os arquivos de exemplo das variáveis de ambiente
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Configuração das Variáveis de Ambiente

Edite os arquivos `.env` com suas configurações específicas:

**Backend (.env)**
```env
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://seudominio.com
MAX_FILE_SIZE=10485760
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
SESSION_SECRET=sua-chave-secreta-super-segura
```

**Frontend (.env)**
```env
REACT_APP_API_URL=https://api.seudominio.com
REACT_APP_MAX_FILE_SIZE=10485760
GENERATE_SOURCEMAP=false
```

### 3. Deploy em Produção

```bash
# Build e start dos containers
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Verificar status dos containers
docker-compose ps

# Verificar logs
docker-compose logs -f
```

## 🌐 Deploy Manual (VPS/Servidor)

### 1. Preparação do Servidor

```bash
# Atualizar sistema (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 para gerenciamento de processos
sudo npm install -g pm2

# Instalar Nginx
sudo apt install nginx -y
```

### 2. Configuração do Backend

```bash
# Navegue para o diretório do backend
cd backend

# Instale dependências
npm ci --only=production

# Configure variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Start com PM2
pm2 start src/index.js --name "converteai-backend"
pm2 save
pm2 startup
```

### 3. Configuração do Frontend

```bash
# Navegue para o diretório do frontend
cd ../frontend

# Instale dependências
npm ci

# Configure variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env

# Build da aplicação
npm run build

# Copie os arquivos para o Nginx
sudo cp -r build/* /var/www/html/
```

### 4. Configuração do Nginx

Crie o arquivo de configuração:

```bash
sudo nano /etc/nginx/sites-available/converteai
```

Adicione a configuração:

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;

    ssl_certificate /etc/ssl/certs/seudominio.com.crt;
    ssl_certificate_key /etc/ssl/private/seudominio.com.key;

    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for file uploads
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Downloads
    location /downloads {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';" always;

    # File upload limits
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        application/atom+xml
        application/geo+json
        application/javascript
        application/x-javascript
        application/json
        application/ld+json
        application/manifest+json
        application/rdf+xml
        application/rss+xml
        application/xhtml+xml
        application/xml
        font/eot
        font/otf
        font/ttf
        image/svg+xml
        text/css
        text/javascript
        text/plain
        text/xml;
}
```

Ative a configuração:

```bash
sudo ln -s /etc/nginx/sites-available/converteai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Configuração SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Verificar renovação automática
sudo certbot renew --dry-run
```

## ☁️ Deploy na AWS

### 1. EC2 Instance

```bash
# Configuração mínima recomendada:
# - t3.small (2 vCPU, 2GB RAM)
# - 20GB EBS Storage
# - Security Group: 80, 443, 22

# Configurar Security Group
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxx \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxx \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0
```

### 2. Application Load Balancer (ALB)

```yaml
# ALB Configuration
Type: AWS::ElasticLoadBalancingV2::LoadBalancer
Properties:
  Name: converteai-alb
  Scheme: internet-facing
  Type: application
  Subnets:
    - subnet-xxxxxxxx
    - subnet-yyyyyyyy
  SecurityGroups:
    - sg-xxxxxxxx

# Target Group
Type: AWS::ElasticLoadBalancingV2::TargetGroup
Properties:
  Name: converteai-targets
  Port: 80
  Protocol: HTTP
  VpcId: vpc-xxxxxxxx
  HealthCheckPath: /health
  HealthCheckIntervalSeconds: 30
  HealthyThresholdCount: 2
  UnhealthyThresholdCount: 5
```

## 🐙 Deploy no Digital Ocean

### 1. Droplet Configuration

```bash
# Criar Droplet via CLI
doctl compute droplet create converteai \
    --size s-2vcpu-2gb \
    --image ubuntu-20-04-x64 \
    --region nyc1 \
    --ssh-keys xxxxxxxx

# Configurar firewall
doctl compute firewall create converteai-fw \
    --inbound-rules "protocol:tcp,ports:22,address:0.0.0.0/0 protocol:tcp,ports:80,address:0.0.0.0/0 protocol:tcp,ports:443,address:0.0.0.0/0"
```

### 2. App Platform (PaaS)

```yaml
# .do/app.yaml
name: converteai
services:
- name: backend
  source_dir: /backend
  github:
    repo: seu-usuario/converteai
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: "8080"

- name: frontend
  source_dir: /frontend
  github:
    repo: seu-usuario/converteai
    branch: main
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
```

## 📊 Monitoramento e Logging

### 1. PM2 Monitoring

```bash
# Instalar PM2 Plus para monitoramento web
pm2 plus

# Configurar monitoramento
pm2 install pm2-server-monit

# Logs
pm2 logs converteai-backend --lines 100
```

### 2. Sistema de Logs

```bash
# Configurar logrotate
sudo nano /etc/logrotate.d/converteai

# Adicionar configuração:
/var/log/converteai/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 nodeuser nodeuser
    postrotate
        pm2 reload converteai-backend
    endscript
}
```

### 3. Health Checks

```bash
# Script de health check
#!/bin/bash
# /usr/local/bin/converteai-health.sh

BACKEND_URL="http://localhost:5000/health"
FRONTEND_URL="http://localhost/health.html"

# Check backend
if ! curl -f "$BACKEND_URL" > /dev/null 2>&1; then
    echo "Backend health check failed"
    pm2 restart converteai-backend
fi

# Check frontend
if ! curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
    echo "Frontend health check failed"
    sudo systemctl restart nginx
fi
```

### 4. Cron Jobs para Limpeza

```bash
# Adicionar ao crontab
crontab -e

# Limpeza de arquivos temporários a cada hora
0 * * * * /usr/local/bin/cleanup-uploads.sh

# Health check a cada 5 minutos
*/5 * * * * /usr/local/bin/converteai-health.sh
```

## 🔄 CI/CD com GitHub Actions

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies and build
      run: |
        cd frontend
        npm ci
        npm run build
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd /var/www/converteai
          git pull origin main
          cd backend
          npm ci --only=production
          pm2 restart converteai-backend
          cd ../frontend
          npm ci
          npm run build
          sudo cp -r build/* /var/www/html/
          sudo systemctl reload nginx
```

## 📈 Otimizações de Performance

### 1. Redis para Cache

```bash
# Instalar Redis
sudo apt install redis-server -y

# Configurar no backend
npm install redis

# Implementar cache de resultados
const redis = require('redis');
const client = redis.createClient();
```

### 2. CDN Setup

```bash
# CloudFlare setup
# 1. Adicionar domínio ao CloudFlare
# 2. Configurar DNS records
# 3. Ativar caching para assets estáticos
# 4. Configurar Page Rules para API
```

### 3. Database (Futuro)

```sql
-- PostgreSQL setup para logging e analytics
CREATE DATABASE converteai;
CREATE USER converteai WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE converteai TO converteai;

-- Tabela de conversões
CREATE TABLE conversions (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255),
    file_size INTEGER,
    conversion_time TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
```

## 🛡️ Segurança

### 1. Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 5000/tcp  # Block direct backend access
```

### 2. Fail2Ban

```bash
# Instalar Fail2Ban
sudo apt install fail2ban -y

# Configurar para Nginx
sudo nano /etc/fail2ban/jail.local

[nginx-req-limit]
enabled = true
filter = nginx-req-limit
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
findtime = 600
bantime = 7200
maxretry = 10
```

### 3. SSL Security

```bash
# Configurar SSL com nota A+ no SSL Labs
sudo nano /etc/nginx/snippets/ssl-params.conf

ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_ecdh_curve secp384r1;
ssl_session_timeout 10m;
ssl_session_cache shared:SSL:10m;
ssl_stapling on;
ssl_stapling_verify on;
```

## 📱 Troubleshooting

### Problemas Comuns

1. **Port already in use**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 PID
   ```

2. **Permission denied**
   ```bash
   sudo chown -R nodeuser:nodeuser /var/www/converteai
   sudo chmod -R 755 /var/www/converteai
   ```

3. **Out of memory**
   ```bash
   # Adicionar swap
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

4. **File upload limits**
   ```bash
   # Nginx
   client_max_body_size 10M;
   
   # Backend
   MAX_FILE_SIZE=10485760
   ```

### Logs Importantes

```bash
# Backend logs
pm2 logs converteai-backend

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
sudo journalctl -u nginx -f
sudo journalctl -u pm2-nodeuser -f
```

## 🎯 Checklist de Deploy

- [ ] Servidor configurado com Node.js 18+
- [ ] Variáveis de ambiente configuradas
- [ ] SSL certificates instalados
- [ ] Firewall configurado
- [ ] PM2 ou Docker funcionando
- [ ] Nginx configurado como proxy
- [ ] Health checks funcionando
- [ ] Logs configurados
- [ ] Backups automatizados
- [ ] Monitoramento ativo
- [ ] Domínio apontando corretamente

---

Para mais detalhes sobre configurações específicas, consulte a documentação oficial de cada serviço ou entre em contato através do [suporte](mailto:developer@mathaus.dev). "