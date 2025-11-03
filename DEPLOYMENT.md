# Beartshare Admin Panel - Deployment Guide

Bu dosya, Beartshare Admin Panel uygulamasını Docker kullanarak nasıl deploy edeceğinizi açıklamaktadır.

## Gereksinimler

- Docker 20.10 veya üzeri
- Erişilebilir MySQL/MariaDB veritabanı
- Gerekli API anahtarları (Email, SMS, Cloudflare)

## Deployment Adımları

### 1. Environment Variables Ayarlama

`.env.example` dosyasını `.env` olarak kopyalayın ve değerleri doldurun:

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin ve aşağıdaki değerleri kendi bilgilerinizle doldurun:

```env
# Veritabanı
DB_HOST_REMOTE=your-database-host
DB_PORT_REMOTE=3306
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password
DB_DATABASE=beartshare

# Session (güvenli bir secret oluşturun)
SESSION_SECRET=$(openssl rand -base64 32)

# Email (Brevo SMTP)
MAIL_USERNAME=your-brevo-username
MAIL_PASSWORD=your-brevo-password

# SMS (NetGSM)
SMS_USERNAME=your-netgsm-username
SMS_PASSWORD=your-netgsm-password

# Cloudflare Images
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_IMAGES_TOKEN=your-images-token
CLOUDFLARE_EMAIL=your-email
CLOUDFLARE_API_KEY=your-api-key
```

### 2. Docker Image Build Etme

```bash
docker build -t beartshare-admin:latest .
```

Build süreci:
- Node.js bağımlılıkları yüklenir
- Frontend (Vite) build edilir
- Backend (Express) bundle edilir
- Production image hazırlanır

### 3. Container Çalıştırma

**Basit Çalıştırma:**

```bash
docker run -d \
  --name beartshare-admin \
  -p 5000:5000 \
  --env-file .env \
  beartshare-admin:latest
```

**Detaylı Çalıştırma (önerilen):**

```bash
docker run -d \
  --name beartshare-admin \
  -p 5000:5000 \
  --env-file .env \
  --restart unless-stopped \
  --memory="512m" \
  --cpus="1.0" \
  beartshare-admin:latest
```

### 4. Container'ı Kontrol Etme

**Logları görüntüleme:**
```bash
docker logs -f beartshare-admin
```

**Container durumunu kontrol:**
```bash
docker ps
```

**Health check:**
```bash
docker inspect --format='{{.State.Health.Status}}' beartshare-admin
```

### 5. Uygulamaya Erişim

Tarayıcınızda şu adresi açın:
```
http://localhost:5000
```

Veya sunucu IP'si ile:
```
http://your-server-ip:5000
```

## Production Ortamında Öneriler

### 1. Reverse Proxy Kullanımı

Nginx veya Traefik gibi bir reverse proxy kullanmanız önerilir:

**Nginx Örnek Konfigürasyonu:**

```nginx
server {
    listen 80;
    server_name admin.beartshare.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. SSL/TLS Sertifikası

Let's Encrypt ile ücretsiz SSL sertifikası alın:

```bash
certbot --nginx -d admin.beartshare.com
```

### 3. Resource Limits

Production ortamında kaynak limitlerini ayarlayın:

```bash
docker run -d \
  --name beartshare-admin \
  -p 5000:5000 \
  --env-file .env \
  --restart unless-stopped \
  --memory="1g" \
  --memory-swap="1g" \
  --cpus="2.0" \
  beartshare-admin:latest
```

### 4. Logging

Logları persistent hale getirin:

```bash
docker run -d \
  --name beartshare-admin \
  -p 5000:5000 \
  --env-file .env \
  --restart unless-stopped \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  beartshare-admin:latest
```

## Container Yönetimi

**Container'ı durdurmak:**
```bash
docker stop beartshare-admin
```

**Container'ı başlatmak:**
```bash
docker start beartshare-admin
```

**Container'ı yeniden başlatmak:**
```bash
docker restart beartshare-admin
```

**Container'ı silmek:**
```bash
docker stop beartshare-admin
docker rm beartshare-admin
```

**Image'ı silmek:**
```bash
docker rmi beartshare-admin:latest
```

## Güncelleme Yapmak

Yeni bir versiyon deploy etmek için:

```bash
# 1. Yeni image'ı build edin
docker build -t beartshare-admin:latest .

# 2. Eski container'ı durdurun ve silin
docker stop beartshare-admin
docker rm beartshare-admin

# 3. Yeni container'ı başlatın
docker run -d \
  --name beartshare-admin \
  -p 5000:5000 \
  --env-file .env \
  --restart unless-stopped \
  beartshare-admin:latest
```

## Sorun Giderme

### Container başlamıyor

```bash
# Logları kontrol edin
docker logs beartshare-admin

# Environment variables'ları kontrol edin
docker exec beartshare-admin env
```

### Veritabanına bağlanamıyor

- DB_HOST_REMOTE değerinin doğru olduğundan emin olun
- Veritabanı sunucusunun Docker container'dan erişilebilir olduğunu kontrol edin
- Firewall kurallarını kontrol edin

### Port çakışması

```bash
# Port 5000 kullanımda ise başka bir port kullanın
docker run -d \
  --name beartshare-admin \
  -p 8080:5000 \
  --env-file .env \
  beartshare-admin:latest
```

## Güvenlik Notları

1. ✅ `.env` dosyasını asla git'e commit etmeyin
2. ✅ Production'da güçlü SESSION_SECRET kullanın
3. ✅ HTTPS kullanın (reverse proxy ile)
4. ✅ Firewall kurallarını düzenleyin (sadece 80/443 portları açık)
5. ✅ Database credentials'larını güvenli saklayın
6. ✅ Düzenli yedekleme yapın

## Destek

Sorunlarınız için:
- Container loglarını kontrol edin: `docker logs beartshare-admin`
- Health check durumunu kontrol edin
- Environment variables'ları doğrulayın
