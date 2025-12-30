# Goalix Deployment Guide

This guide covers deploying Goalix to production on a DigitalOcean VPS.

## Infrastructure Overview

| Component | Details |
|-----------|---------|
| **VPS** | DigitalOcean SYD1 (4GB RAM / 2 vCPU) |
| **IP Address** | 170.64.137.4 |
| **Domain** | goal.quantumdigitalplus.com |
| **Reverse Proxy** | Caddy (automatic HTTPS) |
| **Database** | PostgreSQL (sqm_postgres container) |
| **Container Network** | n8n-docker-caddy_default |

---

## Prerequisites

### 1. GitHub Secrets

Add these secrets to your GitHub repository (`Settings > Secrets > Actions`):

| Secret | Description |
|--------|-------------|
| `VPS_SSH_KEY` | Private SSH key for VPS access |

### 2. VPS Requirements

- Docker & Docker Compose installed
- Git installed
- SSH access configured
- Port 443 open (HTTPS)

### 3. DNS Configuration

Create an A record:
```
goal.quantumdigitalplus.com → 170.64.137.4
```

---

## Initial Setup (First-Time Only)

### 1. SSH into VPS

```bash
ssh root@170.64.137.4
```

### 2. Create Application Directory

```bash
mkdir -p /opt/apps/goalix
cd /opt/apps/goalix
```

### 3. Clone Repository

```bash
git clone https://github.com/cttsu1721/goalix.git .
```

### 4. Create Environment File

```bash
cp .env.example .env
nano .env
```

Fill in production values:

```bash
# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://goal.quantumdigitalplus.com

# Database (use existing PostgreSQL container)
DATABASE_URL=postgresql://goalix_user:YOUR_DB_PASSWORD@sqm_postgres:5432/goalix_db

# Redis
REDIS_URL=redis://goalix-redis:6379

# Auth
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://goal.quantumdigitalplus.com

# Email (EmailIt for magic links)
EMAILIT_API_KEY=your_emailit_api_key

# AI (Anthropic)
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 5. Create Database

```bash
docker exec -it sqm_postgres psql -U postgres
```

```sql
CREATE USER goalix_user WITH PASSWORD 'YOUR_DB_PASSWORD';
CREATE DATABASE goalix_db OWNER goalix_user;
GRANT ALL PRIVILEGES ON DATABASE goalix_db TO goalix_user;
\q
```

### 6. Configure Caddy

Add to `/opt/n8n-docker-caddy/caddy_config/Caddyfile`:

```caddy
goal.quantumdigitalplus.com {
    reverse_proxy goalix:3000
}
```

Reload Caddy:

```bash
docker exec n8n-docker-caddy-caddy-1 caddy reload --config /config/Caddyfile
```

### 7. Start Application

```bash
docker-compose up -d --build
```

### 8. Run Migrations

```bash
docker-compose exec app npx prisma migrate deploy
```

---

## CI/CD Pipeline

### Continuous Integration (CI)

Runs on every PR and push to `main`:

1. **Lint & Type Check** - ESLint + TypeScript
2. **Build** - Next.js production build
3. **Docker Build Test** - Verify Dockerfile works

### Continuous Deployment (CD)

Runs automatically on push to `main`:

1. SSH into VPS
2. Pull latest code
3. Rebuild Docker containers
4. Run database migrations
5. Health check verification

### Manual Deployment

Trigger deployment manually from GitHub:
`Actions > Deploy > Run workflow`

---

## Deployment Commands

### View Logs

```bash
# All logs
docker-compose logs -f

# App logs only
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

### Restart Application

```bash
docker-compose restart app
```

### Full Rebuild

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Run Migrations

```bash
docker-compose exec app npx prisma migrate deploy
```

### Access Database

```bash
docker exec -it sqm_postgres psql -U goalix_user -d goalix_db
```

### Check Container Status

```bash
docker-compose ps
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL of the app |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `NEXTAUTH_SECRET` | Yes | Secret for JWT signing |
| `NEXTAUTH_URL` | Yes | Canonical URL for NextAuth |
| `EMAILIT_API_KEY` | Yes | API key for email service |
| `ANTHROPIC_API_KEY` | Yes | API key for Claude AI |

---

## Troubleshooting

### App Won't Start

1. Check logs: `docker-compose logs app`
2. Verify environment variables: `docker-compose exec app env`
3. Check database connection: `docker-compose exec app npx prisma db pull`

### Database Connection Failed

1. Verify PostgreSQL is running: `docker ps | grep postgres`
2. Check network: `docker network inspect n8n-docker-caddy_default`
3. Test connection: `docker exec -it sqm_postgres psql -U goalix_user -d goalix_db`

### HTTPS Not Working

1. Check Caddy logs: `docker logs n8n-docker-caddy-caddy-1`
2. Verify DNS: `dig goal.quantumdigitalplus.com`
3. Reload Caddy: `docker exec n8n-docker-caddy-caddy-1 caddy reload --config /config/Caddyfile`

### Migration Failed

1. Check migration status: `docker-compose exec app npx prisma migrate status`
2. View pending migrations: `ls prisma/migrations/`
3. Reset if needed (CAUTION - data loss): `docker-compose exec app npx prisma migrate reset`

### Out of Memory

1. Check memory: `docker stats`
2. Increase swap: `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile`

---

## Health Checks

### API Health Endpoint

```bash
curl https://goal.quantumdigitalplus.com/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"..."}
```

### Full System Check

```bash
# Check all containers
docker-compose ps

# Check app health
curl -s https://goal.quantumdigitalplus.com/api/health | jq

# Check database
docker exec sqm_postgres pg_isready -U goalix_user -d goalix_db

# Check disk space
df -h

# Check memory
free -m
```

---

## Rollback

If a deployment fails:

```bash
cd /opt/apps/goalix

# Find previous commit
git log --oneline -5

# Rollback to specific commit
git reset --hard <commit-hash>

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Security Checklist

- [ ] SSH key authentication only (no password)
- [ ] Firewall enabled (ufw)
- [ ] Only ports 22, 80, 443 open
- [ ] Database not exposed externally
- [ ] Environment variables secured
- [ ] HTTPS enforced via Caddy
- [ ] Regular security updates applied

---

## Monitoring (Optional)

Consider adding:

- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry
- **Log aggregation**: Loki + Grafana
- **Metrics**: Prometheus + Grafana
