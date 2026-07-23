#!/usr/bin/env bash

# ==============================================================================
# TaskBoard Automated Setup Script (Debian-Based Linux Systems Only)
# Repository: https://github.com/E-4-0-4/tl-taskBoard.git
# Supported OS: Debian, Ubuntu, Linux Mint, Pop!_OS, Elementary OS, etc.
# ==============================================================================

# Exit on unexpected critical failures where needed, but handle errors gracefully
set -e

# Output Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

REPO_URL="https://github.com/E-4-0-4/tl-taskBoard.git"
PROJECT_DIR_NAME="task-board"

print_banner() {
    echo -e "${CYAN}"
    echo "        TaskBoard - Automated Project Setup (Debian/Ubuntu)             "
    echo -e "${NC}"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Verify Debian-Based OS
verify_debian_os() {
    if [ ! -f /etc/debian_version ] && ! command -v apt-get >/dev/null 2>&1; then
        log_error "This setup script is strictly designed for Debian-based operating systems (Ubuntu, Debian, Linux Mint, etc.)."
        log_error "Aborting execution."
        exit 1
    fi
    log_success "Debian-based Linux distribution detected ($(cat /etc/os-release | grep PRETTY_NAME | cut -d'=' -f2 | tr -d '"' 2>/dev/null || echo 'Debian/Ubuntu'))."
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install APT package
apt_install() {
    local pkg=$1
    log_info "Installing '$pkg' via apt-get..."
    sudo apt-get update -qq
    sudo apt-get install -y "$pkg"
}

# Check and install system prerequisites using APT
check_and_install_prerequisites() {
    log_info "Checking system dependencies via APT..."

    # Ensure ca-certificates and curl/wget exist
    if ! command_exists curl && ! command_exists wget; then
        log_warning "curl/wget missing. Installing ca-certificates and curl..."
        sudo apt-get update -qq
        sudo apt-get install -y ca-certificates curl wget gnupg
    fi

    # Check Git
    if ! command_exists git; then
        log_warning "Git is not installed."
        apt_install "git"
    fi
    log_success "Git is installed: $(git --version)"

    # Check Node.js
    if ! command_exists node; then
        log_warning "Node.js is not installed. Installing Node.js v20 LTS via NodeSource for Debian/Ubuntu..."
        sudo apt-get update -qq
        sudo apt-get install -y ca-certificates curl gnupg
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg --overwrite
        
        NODE_MAJOR=20
        echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list >/dev/null
        
        sudo apt-get update -qq
        sudo apt-get install -y nodejs
    fi

    # Verify Node version (v18+)
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_warning "Node.js version is v$(node -v). Upgrading Node.js to v20 LTS..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    log_success "Node.js version: v$(node -v)"

    # Check npm
    if ! command_exists npm; then
        log_warning "npm is not installed. Installing npm..."
        apt_install "npm"
    fi
    log_success "npm version: v$(npm --version)"

    # Check PostgreSQL
    if ! command_exists psql; then
        log_warning "PostgreSQL CLI (psql) is not installed."
        read -p "Would you like to install PostgreSQL server and client via apt? (Y/n): " install_pg
        install_pg=${install_pg:-Y}
        if [[ "$install_pg" =~ ^[Yy]$ ]]; then
            apt_install "postgresql"
            apt_install "postgresql-contrib"
            sudo service postgresql start 2>/dev/null || sudo systemctl start postgresql 2>/dev/null || true
            log_success "PostgreSQL installed and started."
        else
            log_warning "Skipping PostgreSQL installation. Ensure your remote/local PostgreSQL server is running."
        fi
    else
        log_success "PostgreSQL CLI (psql) detected."
        # Ensure postgres service is active if installed locally
        if systemctl is-active --quiet postgresql 2>/dev/null || service postgresql status >/dev/null 2>&1; then
            log_success "PostgreSQL service is active."
        fi
    fi
}

# Handle cloning repository if necessary
handle_repository_clone() {
    # Check if inside task-board directory
    if [ -f "package.json" ] && grep -q '"name": "task-board"' package.json 2>/dev/null; then
        log_info "Already inside task-board project directory."
    elif [ -d "$PROJECT_DIR_NAME" ] && [ -f "$PROJECT_DIR_NAME/package.json" ]; then
        log_info "Found existing directory '$PROJECT_DIR_NAME'. Navigating into it..."
        cd "$PROJECT_DIR_NAME"
    else
        log_info "Cloning project repository from $REPO_URL..."
        git clone "$REPO_URL"
        
        if [ -d "$PROJECT_DIR_NAME" ]; then
            cd "$PROJECT_DIR_NAME"
        elif [ -d "tl-taskBoard/task-board" ]; then
            cd "tl-taskBoard/task-board"
        fi
    fi
}

# Setup Environment file (.env)
setup_environment() {
    log_info "Setting up environment configuration (.env)..."

    if [ ! -f ".env" ]; then
        log_info "Creating default .env file..."
        cat << 'EOF' > .env
# Database Connection String
DATABASE_URL="postgresql://postgres:password@localhost:5432/taskboard?schema=public"

# Authentication Secrets
JWT_SECRET="mysecretkey"
AUTH_SECRET="your-super-secret-key-at-least-32-chars-long"
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-chars-long"
EOF
        log_success ".env file created with default values."
        log_warning "Please verify or update DATABASE_URL in .env if your PostgreSQL user/password/host differs."
    else
        log_success ".env file already exists."
    fi
}

# Install Node modules
install_node_dependencies() {
    log_info "Installing npm packages (this may take a minute)..."
    npm install
    log_success "npm dependencies installed successfully."
}

# Setup Database & Prisma
setup_prisma_database() {
    log_info "Generating Prisma Client..."
    npx prisma generate || log_warning "Prisma client generation warning. Continuing..."

    log_info "Pushing database schema with Prisma (npx prisma db push)..."
    if npx prisma db push; then
        log_success "Database schema pushed successfully."

        log_info "Seeding database with default seed data..."
        if npx tsx prisma/seed.ts; then
            log_success "Database seeded successfully!"
        else
            log_warning "Database seed script encountered an issue. Ensure PostgreSQL is active."
        fi
    else
        log_warning "Prisma db push failed. Please verify PostgreSQL is running and DATABASE_URL in .env is correct."
        log_warning "You can manually run 'npx prisma db push' after starting your PostgreSQL server."
    fi
}

# Main Execution Flow
main() {
    print_banner
    verify_debian_os
    echo ""
    check_and_install_prerequisites
    echo ""
    handle_repository_clone
    echo ""
    setup_environment
    echo ""
    install_node_dependencies
    echo ""
    setup_prisma_database

    echo -e "${GREEN}"
    echo "=========================================================================="
    echo "       🎉 TaskBoard Setup Completed Successfully on Debian/Ubuntu!       "
    echo "=========================================================================="
    echo -e "${NC}"
    echo -e "${CYAN}Default Admin Login:${NC} admin@taskboard.com / password123"
    echo -e "${CYAN}Default Member Login:${NC} sagar@taskboard.com / password123"
    echo ""
    echo -e "To start the development server, run:"
    echo -e "  ${PURPLE}npm run dev${NC}"
    echo ""

    if [ -t 0 ]; then
        read -p "Would you like to start the dev server now? (y/N): " choice
        case "$choice" in 
            y|Y ) 
                log_info "Starting development server..."
                npm run dev
                ;;
            * )
                log_info "Done! Happy coding!"
                ;;
        esac
    fi
}

main "$@"
