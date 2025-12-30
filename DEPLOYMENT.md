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

**Option A: Interactive Setup (Recommended)**

Use the setup script which validates API keys and prevents common errors:

```bash
bash scripts/setup-production-env.sh
```

This script will:
- Prompt for each configuration value
- Validate API key formats (EmailIt should start with `em_`, Anthropic with `sk-ant-`)
- Test API keys against live endpoints
- Prevent localhost URLs in production
- Generate secure NEXTAUTH_SECRET automatically
- Set proper file permissions (600)

**Option B: Manual Setup**

```bash
cp .env.production.example .env
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

# Email (EmailIt) - Key format: em_xxxxxxxxxxxx
EMAILIT_API_KEY=em_your_emailit_api_key

# AI (Anthropic) - Key format: sk-ant-api03-xxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-api03-your_anthropic_api_key
```

**Important API Key Formats:**
- EmailIt: Must start with `em_` (not `emailit_`)
- Anthropic: Must start with `sk-ant-` (usually `sk-ant-api03-`)

**Validate your environment after setup:**

```bash
bash scripts/validate-env.sh
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

### API Keys Not Working

If you see errors like "Invalid API Key" or 401 Unauthorized:

```bash
# Validate your environment file
bash scripts/validate-env.sh --test

# Check specific key formats
grep EMAILIT_API_KEY .env  # Should start with em_
grep ANTHROPIC_API_KEY .env  # Should start with sk-ant-
```

**Common API Key Issues:**

| Service | Wrong Format | Correct Format |
|---------|--------------|----------------|
| EmailIt | `emailit_xxx...` | `em_xxx...` |
| Anthropic | `api03-xxx...` | `sk-ant-api03-xxx...` |

After fixing the .env file, restart the containers:

```bash
docker compose down
docker compose up -d
```

**Note:** `docker compose restart` does NOT reload environment variables. You must use `down` + `up`.

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

## Rollback & Recovery Procedures

### Quick Rollback (< 5 minutes)

Use this when a deployment fails and you need to restore service quickly:

```bash
ssh root@170.64.137.4
cd /opt/apps/goalix

# 1. Find the last working commit
git log --oneline -10

# 2. Rollback to specific commit (replace <hash> with commit hash)
git reset --hard <commit-hash>

# 3. Rebuild and restart (required to pick up code changes)
docker compose down
docker compose build --no-cache
docker compose up -d

# 4. Verify app is healthy
sleep 15
curl -s https://goal.quantumdigitalplus.com/api/health | jq
```

### Rollback Scenarios

#### Scenario 1: App Won't Start (Container Crashes)

```bash
# Check what went wrong
docker compose logs app --tail=100

# Common fixes:
# A) Missing env var - check .env exists and has all required vars
cat .env | grep -E "^(DATABASE|REDIS|NEXTAUTH)"

# B) Database connection failed - verify container is accessible
docker exec sqm_postgres pg_isready -U goalix_user -d goalix_db

# C) Build issue - rollback to last working commit
git log --oneline -5
git reset --hard <last-working-hash>
docker compose build --no-cache
docker compose up -d
```

#### Scenario 2: App Starts but Returns Errors (500s)

```bash
# Check runtime errors in logs
docker compose logs app --tail=200 | grep -i error

# Check if it's a database schema mismatch
docker compose exec app npx prisma migrate status

# If migrations are out of sync:
# Option A: Apply pending migrations
docker compose exec app npx prisma migrate deploy

# Option B: Rollback code and keep old schema
git reset --hard <commit-before-schema-change>
docker compose build --no-cache
docker compose up -d
```

#### Scenario 3: Environment Configuration Issue

```bash
# Validate current environment
grep -E "localhost|127\.0\.0\.1" .env  # Should return nothing in production

# Check for missing required vars
for VAR in DATABASE_URL REDIS_URL NEXTAUTH_SECRET NEXTAUTH_URL; do
  grep -q "^${VAR}=" .env || echo "MISSING: $VAR"
done

# If .env is corrupted, restore from template
cp .env.production.template .env
nano .env  # Fill in production values
docker compose down
docker compose up -d
```

#### Scenario 4: Database Migration Gone Wrong

**CAUTION: These operations can cause data loss**

```bash
# Check current migration status
docker compose exec app npx prisma migrate status

# If you need to rollback a migration:
# 1. First, backup the database
docker exec sqm_postgres pg_dump -U goalix_user goalix_db > /tmp/goalix_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Manually revert the database changes (requires knowing what the migration did)
# 3. Mark migration as rolled back in _prisma_migrations table
docker exec sqm_postgres psql -U goalix_user -d goalix_db \
  -c "DELETE FROM _prisma_migrations WHERE migration_name = 'YYYYMMDDHHMMSS_migration_name';"

# 4. Rollback code to before the migration
git reset --hard <commit-before-migration>
docker compose build --no-cache
docker compose up -d
```

### Recovery Checklist

After any rollback, verify these:

- [ ] `curl https://goal.quantumdigitalplus.com/api/health` returns `{"status":"ok"}`
- [ ] Landing page loads: `curl -I https://goal.quantumdigitalplus.com`
- [ ] Can log in with magic link
- [ ] Database connection works
- [ ] Redis connection works

### Emergency Contacts

If all else fails:
1. Check Docker status: `docker compose ps`
2. Check system resources: `free -m && df -h`
3. Check container logs: `docker compose logs --tail=500`
4. Restart everything: `docker compose down && docker compose up -d`

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
