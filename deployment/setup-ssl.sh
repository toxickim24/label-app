#!/bin/bash

#######################################
# Label App - SSL Setup with Let's Encrypt
# This script automates SSL certificate setup
#######################################

set -e  # Exit on any error

echo "=========================================="
echo " Label App - SSL Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

# Variables
DOMAIN="web.labelsalesagents.com"
EMAIL=""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use 'sudo' or login as root)"
    exit 1
fi

print_info "This script will set up a free SSL certificate from Let's Encrypt"
echo ""

# Step 1: Check if Nginx is running
print_step "Step 1/5: Checking Nginx status..."
if systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
else
    print_error "Nginx is not running. Please start Nginx first:"
    echo "  systemctl start nginx"
    exit 1
fi
echo ""

# Step 2: Verify DNS
print_step "Step 2/5: Verifying DNS configuration..."
print_info "Checking if $DOMAIN points to this server..."

# Get server's public IP
SERVER_IP=$(curl -s ifconfig.me)
print_info "Server IP: $SERVER_IP"

# Resolve domain
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)
print_info "Domain IP: $DOMAIN_IP"

if [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
    print_success "DNS is configured correctly"
else
    print_error "DNS mismatch! Domain does not point to this server."
    print_info "Expected: $SERVER_IP"
    print_info "Got: $DOMAIN_IP"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " continue_anyway
    if [[ ! $continue_anyway =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo ""

# Step 3: Get email address
print_step "Step 3/5: Email configuration..."
echo "Let's Encrypt requires an email address for:"
echo "  • Important notices about your certificates"
echo "  • Renewal reminders"
echo ""
read -p "Enter your email address: " EMAIL

if [ -z "$EMAIL" ]; then
    print_error "Email address is required"
    exit 1
fi

print_success "Email set to: $EMAIL"
echo ""

# Step 4: Install Certbot
print_step "Step 4/5: Installing Certbot..."
if command -v certbot &> /dev/null; then
    print_info "Certbot is already installed"
else
    apt update
    apt install -y certbot python3-certbot-nginx
    print_success "Certbot installed"
fi
echo ""

# Step 5: Obtain SSL certificate
print_step "Step 5/5: Obtaining SSL certificate..."
print_info "This may take a minute..."
echo ""

# Run Certbot
certbot --nginx \
    -d $DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --redirect

print_success "SSL certificate obtained and installed!"
echo ""

# Test automatic renewal
print_info "Testing automatic renewal..."
certbot renew --dry-run
print_success "Automatic renewal is configured"
echo ""

# Summary
echo "=========================================="
echo " SSL Setup Complete! 🔒"
echo "=========================================="
echo ""
echo "Your website is now secured with HTTPS:"
echo "  • https://web.labelsalesagents.com"
echo ""
echo "Certificate Details:"
echo "  • Domain: $DOMAIN"
echo "  • Email: $EMAIL"
echo "  • Provider: Let's Encrypt"
echo "  • Auto-renewal: Enabled"
echo ""
echo "Your certificate will automatically renew before it expires."
echo "Let's Encrypt certificates are valid for 90 days."
echo ""
echo "To manually renew (if needed):"
echo "  certbot renew"
echo ""
echo "To check certificate status:"
echo "  certbot certificates"
echo ""
echo "=========================================="
