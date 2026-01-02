#!/bin/bash
# =============================================================================
# Goalix Production Environment Setup Script
# =============================================================================
#
# This script helps create and validate the production .env file.
# Run this on the VPS after initial deployment.
#
# Usage:
#   ./scripts/setup-production-env.sh
#
# Or remotely:
#   ssh root@170.64.137.4 "cd /opt/apps/goalix && bash scripts/setup-production-env.sh"
#
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env"
ENV_EXAMPLE=".env.production.example"
APP_DIR="${APP_DIR:-/opt/apps/goalix}"

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

prompt_value() {
    local prompt="$1"
    local default="$2"
    local secret="$3"
    local value=""

    if [ -n "$default" ]; then
        echo -ne "${prompt} [${default}]: "
    else
        echo -ne "${prompt}: "
    fi

    if [ "$secret" = "true" ]; then
        read -s value
        echo ""
    else
        read value
    fi

    if [ -z "$value" ] && [ -n "$default" ]; then
        value="$default"
    fi

    echo "$value"
}

validate_not_empty() {
    local value="$1"
    local name="$2"

    if [ -z "$value" ]; then
        print_error "$name cannot be empty"
        return 1
    fi
    return 0
}

# =============================================================================
# API Key Validation Functions
# =============================================================================

validate_emailit_key() {
    local key="$1"

    # Check format: should start with em_
    if [[ ! "$key" =~ ^em_ ]]; then
        print_error "EmailIt API key should start with 'em_'"
        print_info "Get your key from: https://www.emailit.com/dashboard"
        return 1
    fi

    # Test the API key
    print_info "Testing EmailIt API key..."
    local response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST "https://api.emailit.com/v1/emails" \
        -H "Authorization: Bearer $key" \
        -H "Content-Type: application/json" \
        -d '{"test": true}' 2>/dev/null || echo "000")

    # 400 is expected for invalid request body, but means auth worked
    # 401 means invalid key
    if [ "$response" = "401" ]; then
        print_error "EmailIt API key is invalid (401 Unauthorized)"
        return 1
    elif [ "$response" = "000" ]; then
        print_warning "Could not test EmailIt key (network error). Proceeding anyway."
        return 0
    else
        print_success "EmailIt API key format is valid"
        return 0
    fi
}

validate_anthropic_key() {
    local key="$1"

    # Check format: should start with sk-ant-
    if [[ ! "$key" =~ ^sk-ant- ]]; then
        print_error "Anthropic API key should start with 'sk-ant-'"
        print_info "Get your key from: https://console.anthropic.com/settings/keys"
        return 1
    fi

    # Test the API key with a minimal request
    print_info "Testing Anthropic API key..."
    local response=$(curl -s -w "\n%{http_code}" \
        -X POST "https://api.anthropic.com/v1/messages" \
        -H "x-api-key: $key" \
        -H "anthropic-version: 2023-06-01" \
        -H "Content-Type: application/json" \
        -d '{"model":"claude-3-haiku-20240307","max_tokens":1,"messages":[{"role":"user","content":"hi"}]}' 2>/dev/null)

    local http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "401" ]; then
        print_error "Anthropic API key is invalid (401 Unauthorized)"
        return 1
    elif [ "$http_code" = "200" ]; then
        print_success "Anthropic API key is valid"
        return 0
    elif [ "$http_code" = "000" ]; then
        print_warning "Could not test Anthropic key (network error). Proceeding anyway."
        return 0
    else
        print_success "Anthropic API key format is valid (HTTP $http_code)"
        return 0
    fi
}

validate_database_url() {
    local url="$1"

    # Check it's not using localhost
    if [[ "$url" =~ localhost ]]; then
        print_error "DATABASE_URL contains 'localhost' - this won't work in Docker"
        print_info "Use 'sqm_postgres' as the hostname for the Docker network"
        return 1
    fi

    # Check format
    if [[ ! "$url" =~ ^postgresql:// ]]; then
        print_error "DATABASE_URL should start with 'postgresql://'"
        return 1
    fi

    print_success "DATABASE_URL format is valid"
    return 0
}

validate_redis_url() {
    local url="$1"

    # Check it's not using localhost
    if [[ "$url" =~ localhost ]]; then
        print_error "REDIS_URL contains 'localhost' - this won't work in Docker"
        print_info "Use 'goalix-redis' as the hostname for the Docker network"
        return 1
    fi

    # Check format
    if [[ ! "$url" =~ ^redis:// ]]; then
        print_error "REDIS_URL should start with 'redis://'"
        return 1
    fi

    print_success "REDIS_URL format is valid"
    return 0
}

validate_nextauth_secret() {
    local secret="$1"

    # Check minimum length (base64 of 32 bytes = ~44 chars)
    if [ ${#secret} -lt 32 ]; then
        print_error "NEXTAUTH_SECRET is too short (should be at least 32 characters)"
        print_info "Generate with: openssl rand -base64 32"
        return 1
    fi

    print_success "NEXTAUTH_SECRET length is valid"
    return 0
}

# =============================================================================
# Main Setup Flow
# =============================================================================

main() {
    print_header "Goalix Production Environment Setup"

    echo ""
    echo "This script will help you create a validated .env file for production."
    echo ""

    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "Please run this script from the Goalix project root directory"
        exit 1
    fi

    # Check if .env already exists
    if [ -f "$ENV_FILE" ]; then
        print_warning "An existing .env file was found."
        echo -ne "Do you want to overwrite it? [y/N]: "
        read confirm
        if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
            echo ""
            print_info "Setup cancelled. Existing .env file preserved."
            exit 0
        fi
        # Backup existing file
        cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        print_info "Backed up existing .env file"
    fi

    echo ""

    # ==========================================================================
    # Collect Values
    # ==========================================================================

    print_header "Database Configuration"
    echo "Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    echo "Use 'sqm_postgres' as the host (Docker network hostname)"
    echo ""

    DB_USER=$(prompt_value "Database user" "goalix_user")
    DB_PASS=$(prompt_value "Database password" "" "true")
    validate_not_empty "$DB_PASS" "Database password" || exit 1
    DB_HOST=$(prompt_value "Database host" "sqm_postgres")
    DB_PORT=$(prompt_value "Database port" "5432")
    DB_NAME=$(prompt_value "Database name" "goalix_db")

    DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
    validate_database_url "$DATABASE_URL" || exit 1

    # --------------------------------------------------------------------------

    print_header "Redis Configuration"
    echo "Format: redis://HOST:PORT"
    echo "Use 'goalix-redis' as the host (Docker network hostname)"
    echo ""

    REDIS_URL=$(prompt_value "Redis URL" "redis://goalix-redis:6379")
    validate_redis_url "$REDIS_URL" || exit 1

    # --------------------------------------------------------------------------

    print_header "Authentication (NextAuth)"
    echo ""

    # Generate a secret if not provided
    DEFAULT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "")
    NEXTAUTH_SECRET=$(prompt_value "NextAuth secret (press Enter to auto-generate)" "$DEFAULT_SECRET" "true")

    if [ -z "$NEXTAUTH_SECRET" ]; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        print_info "Generated new secret"
    fi
    validate_nextauth_secret "$NEXTAUTH_SECRET" || exit 1

    NEXTAUTH_URL=$(prompt_value "NextAuth URL" "https://goalzenix.com")

    # --------------------------------------------------------------------------

    print_header "Email Service (EmailIt)"
    echo "Get your API key from: https://www.emailit.com/dashboard"
    echo "Key format: em_xxxxxxxxxxxxxxxxxxxx"
    echo ""

    while true; do
        EMAILIT_API_KEY=$(prompt_value "EmailIt API key" "" "true")
        validate_not_empty "$EMAILIT_API_KEY" "EmailIt API key" || continue
        validate_emailit_key "$EMAILIT_API_KEY" && break
        echo -ne "Try again? [Y/n]: "
        read retry
        if [ "$retry" = "n" ] || [ "$retry" = "N" ]; then
            print_warning "Proceeding with unvalidated EmailIt key"
            break
        fi
    done

    # --------------------------------------------------------------------------

    print_header "AI Service (Anthropic)"
    echo "Get your API key from: https://console.anthropic.com/settings/keys"
    echo "Key format: sk-ant-api03-xxxxxxxxxxxxxxxxxxxx"
    echo ""

    while true; do
        ANTHROPIC_API_KEY=$(prompt_value "Anthropic API key" "" "true")
        validate_not_empty "$ANTHROPIC_API_KEY" "Anthropic API key" || continue
        validate_anthropic_key "$ANTHROPIC_API_KEY" && break
        echo -ne "Try again? [Y/n]: "
        read retry
        if [ "$retry" = "n" ] || [ "$retry" = "N" ]; then
            print_warning "Proceeding with unvalidated Anthropic key"
            break
        fi
    done

    # ==========================================================================
    # Write .env File
    # ==========================================================================

    print_header "Creating .env File"

    cat > "$ENV_FILE" << EOF
# =============================================================================
# Goalix Production Environment
# Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
# =============================================================================

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=${NEXTAUTH_URL}

# Database
DATABASE_URL=${DATABASE_URL}

# Redis
REDIS_URL=${REDIS_URL}

# Authentication
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=${NEXTAUTH_URL}

# Email (EmailIt)
EMAILIT_API_KEY=${EMAILIT_API_KEY}

# AI (Anthropic)
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
EOF

    # Secure the file
    chmod 600 "$ENV_FILE"

    print_success "Created $ENV_FILE"
    print_success "File permissions set to 600 (owner read/write only)"

    # ==========================================================================
    # Final Validation
    # ==========================================================================

    print_header "Final Validation"

    # Check for any remaining placeholders
    if grep -q "<REQUIRED" "$ENV_FILE"; then
        print_error "Found unreplaced placeholders in .env file"
        grep "<REQUIRED" "$ENV_FILE"
        exit 1
    fi

    # Check for localhost (shouldn't be there in production)
    if grep -E "^(DATABASE_URL|REDIS_URL)=.*localhost" "$ENV_FILE" >/dev/null; then
        print_error "Found 'localhost' in database or Redis URL"
        exit 1
    fi

    print_success "All validations passed!"

    # ==========================================================================
    # Next Steps
    # ==========================================================================

    print_header "Setup Complete!"

    echo ""
    echo "Next steps:"
    echo ""
    echo "  1. Restart the containers to apply changes:"
    echo "     ${YELLOW}docker compose down && docker compose up -d${NC}"
    echo ""
    echo "  2. Run database migrations (if needed):"
    echo "     ${YELLOW}docker run --rm --network n8n-docker-caddy_n8n_network \\"
    echo "       -v \$(pwd)/prisma:/app/prisma -w /app \\"
    echo "       -e DATABASE_URL=\"\$DATABASE_URL\" \\"
    echo "       node:22-alpine sh -c \"npm i prisma@6.19.1 && npx prisma migrate deploy\"${NC}"
    echo ""
    echo "  3. Verify the application is running:"
    echo "     ${YELLOW}curl https://goalzenix.com/api/health${NC}"
    echo ""
}

# =============================================================================
# Run
# =============================================================================

main "$@"
