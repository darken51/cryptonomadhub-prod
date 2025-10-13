# 🚀 Production Deployment Guide

## ⚠️ CRITICAL SECURITY CHECKLIST

Before deploying to production, complete ALL items below:

### 1. Environment Variables (CRITICAL)

```bash
# Generate NEW secret key (NEVER use dev key in production!)
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"

# Generate strong PostgreSQL password
python3 -c "import secrets; print('POSTGRES_PASSWORD=' + secrets.token_urlsafe(32))"
```

**Required variables for production:**
- `SECRET_KEY` - NEW generated key (not from .env)
- `DATABASE_URL` - With strong password
- `PADDLE_VENDOR_ID` - Real Paddle credentials
- `PADDLE_AUTH_CODE` - From Paddle dashboard
- `PADDLE_PUBLIC_KEY` - From Paddle dashboard
- `PADDLE_WEBHOOK_SECRET` - From Paddle dashboard
- `SENTRY_DSN` - For error tracking
- `SMTP_*` - For email verification
- `FRONTEND_URL` - Your production domain (https://your-domain.com)
- `ENVIRONMENT=production`

### 2. Docker Compose Production

**DO NOT use docker-compose.yml as-is in production!**

Create `docker-compose.prod.yml`:

```yaml
version: '3.9'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: always
    env_file: .env.production
    ports:
      - "8000:8000"  # Behind reverse proxy only
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    # DO NOT expose port 5432 externally!

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/var/lib/redis/data
    # DO NOT expose port 6379 externally!

  backup:
    image: postgres:16-alpine
    restart: always
    environment:
      PGPASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - ./backups:/backups
      - backup_script:/backup.sh
    command: >
      sh -c 'while true; do
        PGPASSWORD=$${POSTGRES_PASSWORD} pg_dump -h postgres -U nomad nomadcrypto > /backups/backup_$$(date +%Y%m%d_%H%M%S).sql;
        find /backups -name "*.sql" -mtime +7 -delete;
        sleep 86400;
      done'

volumes:
  postgres_data:
  redis_data:
```

### 3. Nginx Reverse Proxy (Required)

**Never expose FastAPI directly to internet!**

```nginx
# /etc/nginx/sites-available/cryptonomadhub

server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.your-domain.com;
    return 301 https://$host$request_uri;
}
```

### 4. SSL/TLS Certificate

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d api.your-domain.com -d app.your-domain.com
```

### 5. Firewall Configuration

```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (redirect)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Block direct access to Docker ports
sudo ufw deny 5432/tcp   # PostgreSQL
sudo ufw deny 6379/tcp   # Redis
sudo ufw deny 8000/tcp   # FastAPI (Nginx only)
```

### 6. Monitoring Setup

**Sentry:**
1. Create account at https://sentry.io
2. Get DSN from project settings
3. Add to `.env.production`:
   ```
   SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz
   ENVIRONMENT=production
   ```

**Uptime monitoring:**
- UptimeRobot (free): https://uptimerobot.com
- Monitor: https://api.your-domain.com/health

### 7. Backup Strategy

**Automated backups:**
- Daily PostgreSQL dumps (done by backup service)
- Upload to S3/Backblaze:

```bash
# Install AWS CLI
pip install awscli

# Upload backup
aws s3 cp /backups/backup_YYYYMMDD.sql s3://your-bucket/backups/
```

**Test restore procedure monthly:**
```bash
psql -U nomad -d nomadcrypto < backup_YYYYMMDD.sql
```

### 8. Secrets Management

**DO NOT:**
- ❌ Commit .env to git
- ❌ Use same SECRET_KEY as dev
- ❌ Use default passwords

**DO:**
- ✅ Use AWS Secrets Manager / Vault
- ✅ Rotate secrets quarterly
- ✅ Different credentials per environment

### 9. Pre-Launch Checklist

- [ ] New SECRET_KEY generated
- [ ] Strong PostgreSQL password
- [ ] Real Paddle credentials configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Sentry configured
- [ ] Nginx reverse proxy setup
- [ ] Backups tested
- [ ] Health check responds
- [ ] Rate limiting active
- [ ] CORS configured for production domain
- [ ] Email SMTP working
- [ ] Terms & Privacy pages live
- [ ] Test complete user flow (register → verify → simulate)

### 10. Deployment Commands

```bash
# 1. Create production env file
cp .env.example .env.production
# Edit .env.production with real values

# 2. Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Check health
curl https://api.your-domain.com/health

# 4. Monitor logs
docker-compose -f docker-compose.prod.yml logs -f backend

# 5. Check database migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

### 11. Post-Launch Monitoring

**First 24 hours:**
- Check Sentry for errors every 2 hours
- Monitor server resources (CPU, RAM, disk)
- Test all critical flows manually
- Monitor Paddle webhook deliveries

**First week:**
- Daily Sentry check
- Review backup success
- Check database size growth
- Monitor API response times

### 12. Incident Response Plan

**If site down:**
1. Check health endpoint
2. Check Docker containers: `docker-compose ps`
3. Check logs: `docker-compose logs backend`
4. Check database: `docker-compose exec postgres psql -U nomad -d nomadcrypto -c "SELECT 1"`
5. Restart if needed: `docker-compose restart`

**If database corrupted:**
1. Stop services
2. Restore from latest backup
3. Test database integrity
4. Restart services

### 13. Scaling Considerations

**0-1k users:**
- Single VPS (4 CPU, 8GB RAM)
- Cost: ~$40-80/month

**1k-10k users:**
- Separate DB server
- Load balancer
- Multiple backend instances
- Cost: ~$200-500/month

**10k+ users:**
- Kubernetes cluster
- Managed PostgreSQL (RDS)
- CDN (CloudFront)
- Cost: $1k-5k/month

---

## 🆘 Support

For deployment issues:
- Email: devops@your-domain.com
- Slack: #production-support

**Emergency contacts:**
- On-call engineer: +XXX-XXX-XXXX
- Hosting provider support

---

**Last updated:** 2025-10-12
**Maintained by:** DevOps Team
