#!/bin/bash

#######################################
# Label App - Ubuntu 24.04 Server Setup
# This script automates the server setup process
#######################################

set -e  # Exit on any error

echo "=========================================="
echo " Label App - Server Setup for Ubuntu 24.04"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use 'sudo' or login as root)"
    exit 1
fi

print_info "Starting server setup..."
echo ""

# Step 1: Update system packages
print_info "Step 1/7: Updating system packages..."
apt update -y && apt upgrade -y
print_success "System packages updated"
echo ""

# Step 2: Install essential tools
print_info "Step 2/7: Installing essential tools..."
apt install -y curl git build-essential software-properties-common
print_success "Essential tools installed"
echo ""

# Step 3: Install Node.js 20
print_info "Step 3/7: Installing Node.js 20..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_info "Node.js is already installed: $NODE_VERSION"

    # Check if version is 20.x
    if [[ ! $NODE_VERSION =~ ^v20\. ]]; then
        print_info "Updating to Node.js 20..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
    fi
else
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js $NODE_VERSION installed"
print_success "npm $NPM_VERSION installed"
echo ""

# Step 4: Install PM2
print_info "Step 4/7: Installing PM2 (Process Manager)..."
npm install -g pm2
pm2 update
print_success "PM2 installed"
echo ""

# Step 5: Install and configure Nginx
print_info "Step 5/7: Installing Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx
print_success "Nginx installed and started"
echo ""

# Step 6: Configure firewall
print_info "Step 6/7: Configuring firewall..."
apt install -y ufw

# Allow SSH first (important!)
ufw allow 22/tcp
print_success "SSH port allowed (22)"

# Allow HTTP
ufw allow 80/tcp
print_success "HTTP port allowed (80)"

# Allow HTTPS
ufw allow 443/tcp
print_success "HTTPS port allowed (443)"

# Enable firewall (only if not already enabled)
ufw --force enable
print_success "Firewall configured and enabled"
echo ""

# Step 7: Create project directory and set permissions
print_info "Step 7/7: Setting up project directory..."
if [ ! -d "/var/www" ]; then
    mkdir -p /var/www
fi

cd /var/www

# Check if label-app directory already exists
if [ -d "/var/www/label-app" ]; then
    print_info "Project directory already exists: /var/www/label-app"
else
    print_info "Project directory will be created at: /var/www/label-app"
fi

print_success "Project directory ready"
echo ""

# Summary
echo "=========================================="
echo " Server Setup Complete! 🎉"
echo "=========================================="
echo ""
echo "Installed Components:"
echo "  ✓ Node.js $NODE_VERSION"
echo "  ✓ npm $NPM_VERSION"
echo "  ✓ PM2 (Process Manager)"
echo "  ✓ Nginx (Web Server)"
echo "  ✓ UFW Firewall"
echo ""
echo "Next Steps:"
echo "1. If you haven't cloned the repository yet:"
echo "   cd /var/www"
echo "   git clone https://github.com/toxickim24/label-app.git"
echo ""
echo "2. Navigate to the project:"
echo "   cd /var/www/label-app"
echo ""
echo "3. Run the deployment script:"
echo "   chmod +x deployment/deploy.sh"
echo "   ./deployment/deploy.sh"
echo ""
echo "=========================================="
