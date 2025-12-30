#!/bin/bash
# =============================================================================
# Goalix Environment Validation Script
# =============================================================================
#
# Validates an existing .env file without modifying it.
# Useful for troubleshooting or CI/CD checks.
#
# Usage:
#   ./scripts/validate-env.sh [path-to-env-file]
#
# Examples:
#   ./scripts/validate-env.sh                    # Validates .env in current dir
#   ./scripts/validate-env.sh .env.local         # Validates specific file
#   ssh root@170.64.137.4 "cd /opt/apps/goalix && bash scripts/validate-env.sh"
#
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ENV_FILE="${1:-.env}"
ERRORS=0
WARNINGS=0

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; ERRORS=$((ERRORS + 1)); }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; WARNINGS=$((WARNINGS + 1)); }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }

get_env_value() {
    local key="$1"
    grep "^${key}=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- | head -1
}

mask_value() {
    local value="$1"
    local visible="${2:-4}"
    if [ ${#value} -le $((visible * 2)) ]; then
        echo "****"
    else
        echo "${value:0:$visible}...${value: -$visible}"
    fi
}

# =============================================================================
# Validation Functions
# =============================================================================

check_required_vars() {
    print_header "Required Variables"

    local required_vars=(
        "NODE_ENV"
        "NEXT_PUBLIC_APP_URL"
        "DATABASE_URL"
        "REDIS_URL"
        "NEXTAUTH_SECRET"
        "NEXTAUTH_URL"
        "EMAILIT_API_KEY"
        "ANTHROPIC_API_KEY"
    )

    for var in "${required_vars[@]}"; do
        local value=$(get_env_value "$var")
        if [ -z "$value" ]; then
            print_error "$var is missing"
        elif [[ "$value" =~ \<REQUIRED ]]; then
            print_error "$var contains placeholder value"
        else
            print_success "$var is set"
        fi
    done
}

check_database_url() {
    print_header "Database Configuration"

    local db_url=$(get_env_value "DATABASE_URL")

    if [ -z "$db_url" ]; then
        print_error "DATABASE_URL is not set"
        return
    fi

    # Check format
    if [[ ! "$db_url" =~ ^postgresql:// ]]; then
        print_error "DATABASE_URL should start with 'postgresql://'"
    else
        print_success "DATABASE_URL format is valid"
    fi

    # Check for localhost
    if [[ "$db_url" =~ localhost ]]; then
        print_error "DATABASE_URL contains 'localhost' - won't work in Docker"
    else
        print_success "DATABASE_URL doesn't contain 'localhost'"
    fi

    # Check for sqm_postgres (expected Docker host)
    if [[ "$db_url" =~ sqm_postgres ]]; then
        print_success "DATABASE_URL uses Docker network host 'sqm_postgres'"
    else
        print_warning "DATABASE_URL doesn't use 'sqm_postgres' - verify host is correct"
    fi

    # Mask and display
    print_info "Value: $(mask_value "$db_url" 20)"
}

check_redis_url() {
    print_header "Redis Configuration"

    local redis_url=$(get_env_value "REDIS_URL")

    if [ -z "$redis_url" ]; then
        print_error "REDIS_URL is not set"
        return
    fi

    # Check format
    if [[ ! "$redis_url" =~ ^redis:// ]]; then
        print_error "REDIS_URL should start with 'redis://'"
    else
        print_success "REDIS_URL format is valid"
    fi

    # Check for localhost
    if [[ "$redis_url" =~ localhost ]]; then
        print_error "REDIS_URL contains 'localhost' - won't work in Docker"
    else
        print_success "REDIS_URL doesn't contain 'localhost'"
    fi

    print_info "Value: $redis_url"
}

check_nextauth() {
    print_header "NextAuth Configuration"

    local secret=$(get_env_value "NEXTAUTH_SECRET")
    local url=$(get_env_value "NEXTAUTH_URL")

    # Check secret length
    if [ -z "$secret" ]; then
        print_error "NEXTAUTH_SECRET is not set"
    elif [ ${#secret} -lt 32 ]; then
        print_error "NEXTAUTH_SECRET is too short (${#secret} chars, need 32+)"
    else
        print_success "NEXTAUTH_SECRET length is valid (${#secret} chars)"
    fi

    # Check URL
    if [ -z "$url" ]; then
        print_error "NEXTAUTH_URL is not set"
    elif [[ ! "$url" =~ ^https:// ]]; then
        print_warning "NEXTAUTH_URL should use HTTPS in production"
    else
        print_success "NEXTAUTH_URL uses HTTPS"
    fi

    print_info "URL: $url"
}

check_emailit() {
    print_header "EmailIt Configuration"

    local key=$(get_env_value "EMAILIT_API_KEY")

    if [ -z "$key" ]; then
        print_error "EMAILIT_API_KEY is not set"
        return
    fi

    # Check format
    if [[ "$key" =~ ^em_ ]]; then
        print_success "EMAILIT_API_KEY has correct prefix 'em_'"
    elif [[ "$key" =~ ^emailit_ ]]; then
        print_error "EMAILIT_API_KEY has wrong prefix 'emailit_' (should be 'em_')"
        print_info "This is likely an old or incorrect key format"
    else
        print_warning "EMAILIT_API_KEY has unexpected format"
    fi

    print_info "Value: $(mask_value "$key" 6)"

    # Optional: Test the key if --test flag is passed
    if [[ "$*" =~ --test ]]; then
        print_info "Testing EmailIt API key..."
        local response=$(curl -s -o /dev/null -w "%{http_code}" \
            -X POST "https://api.emailit.com/v1/emails" \
            -H "Authorization: Bearer $key" \
            -H "Content-Type: application/json" \
            -d '{}' 2>/dev/null || echo "000")

        if [ "$response" = "401" ]; then
            print_error "EmailIt key is invalid (401 Unauthorized)"
        elif [ "$response" = "000" ]; then
            print_warning "Could not test EmailIt key (network error)"
        else
            print_success "EmailIt key appears valid (HTTP $response)"
        fi
    fi
}

check_anthropic() {
    print_header "Anthropic Configuration"

    local key=$(get_env_value "ANTHROPIC_API_KEY")

    if [ -z "$key" ]; then
        print_error "ANTHROPIC_API_KEY is not set"
        return
    fi

    # Check format
    if [[ "$key" =~ ^sk-ant-api03- ]]; then
        print_success "ANTHROPIC_API_KEY has correct prefix 'sk-ant-api03-'"
    elif [[ "$key" =~ ^sk-ant- ]]; then
        print_success "ANTHROPIC_API_KEY has valid prefix 'sk-ant-'"
    else
        print_error "ANTHROPIC_API_KEY has wrong format (should start with 'sk-ant-')"
    fi

    print_info "Value: $(mask_value "$key" 10)"

    # Optional: Test the key if --test flag is passed
    if [[ "$*" =~ --test ]]; then
        print_info "Testing Anthropic API key..."
        local response=$(curl -s -w "\n%{http_code}" \
            -X POST "https://api.anthropic.com/v1/messages" \
            -H "x-api-key: $key" \
            -H "anthropic-version: 2023-06-01" \
            -H "Content-Type: application/json" \
            -d '{"model":"claude-3-haiku-20240307","max_tokens":1,"messages":[{"role":"user","content":"hi"}]}' 2>/dev/null)

        local http_code=$(echo "$response" | tail -n1)

        if [ "$http_code" = "401" ]; then
            print_error "Anthropic key is invalid (401 Unauthorized)"
        elif [ "$http_code" = "000" ]; then
            print_warning "Could not test Anthropic key (network error)"
        elif [ "$http_code" = "200" ]; then
            print_success "Anthropic key is valid (HTTP 200)"
        else
            print_warning "Anthropic key test returned HTTP $http_code"
        fi
    fi
}

check_node_env() {
    print_header "Application Configuration"

    local node_env=$(get_env_value "NODE_ENV")
    local app_url=$(get_env_value "NEXT_PUBLIC_APP_URL")

    if [ "$node_env" = "production" ]; then
        print_success "NODE_ENV is 'production'"
    elif [ "$node_env" = "development" ]; then
        print_warning "NODE_ENV is 'development' - should be 'production' for prod"
    else
        print_warning "NODE_ENV is '$node_env' - expected 'production'"
    fi

    if [[ "$app_url" =~ ^https:// ]]; then
        print_success "NEXT_PUBLIC_APP_URL uses HTTPS"
    elif [[ "$app_url" =~ localhost ]]; then
        print_warning "NEXT_PUBLIC_APP_URL contains 'localhost'"
    else
        print_warning "NEXT_PUBLIC_APP_URL should use HTTPS"
    fi

    print_info "App URL: $app_url"
}

check_file_permissions() {
    print_header "File Permissions"

    if [ ! -f "$ENV_FILE" ]; then
        print_error "File not found: $ENV_FILE"
        return
    fi

    local perms=$(stat -c "%a" "$ENV_FILE" 2>/dev/null || stat -f "%Lp" "$ENV_FILE" 2>/dev/null)

    if [ "$perms" = "600" ]; then
        print_success "File permissions are 600 (secure)"
    elif [ "$perms" = "644" ] || [ "$perms" = "664" ]; then
        print_warning "File permissions are $perms - consider using 600 for security"
    else
        print_info "File permissions: $perms"
    fi

    # Check owner (on Linux)
    if command -v stat &>/dev/null; then
        local owner=$(stat -c "%U" "$ENV_FILE" 2>/dev/null || echo "unknown")
        print_info "File owner: $owner"
    fi
}

# =============================================================================
# Main
# =============================================================================

main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         Goalix Environment Validation                      ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Check if file exists
    if [ ! -f "$ENV_FILE" ]; then
        print_error "Environment file not found: $ENV_FILE"
        echo ""
        echo "Usage: $0 [path-to-env-file]"
        exit 1
    fi

    print_info "Validating: $ENV_FILE"

    # Run all checks
    check_file_permissions
    check_required_vars
    check_node_env
    check_database_url
    check_redis_url
    check_nextauth
    check_emailit "$@"
    check_anthropic "$@"

    # Summary
    print_header "Summary"

    if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
        print_success "All checks passed!"
        echo ""
        exit 0
    elif [ $ERRORS -eq 0 ]; then
        print_warning "$WARNINGS warning(s) found"
        echo ""
        exit 0
    else
        print_error "$ERRORS error(s) and $WARNINGS warning(s) found"
        echo ""
        exit 1
    fi
}

main "$@"
