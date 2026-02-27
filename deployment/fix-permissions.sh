#!/bin/bash

#######################################
# Fix Permissions for Nginx 403 Error
# This script fixes common permission issues
#######################################

set -e

echo "=========================================="
echo " Fixing Nginx 403 Permissions"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root"
    exit 1
fi

PROJECT_DIR="/var/www/label-app"

print_info "Step 1: Checking if dist folder exists..."
if [ ! -d "$PROJECT_DIR/dist" ]; then
    echo "dist folder not found. Building the app..."
    cd $PROJECT_DIR
    npm run build:web
    print_success "App built successfully"
else
    print_success "dist folder exists"
fi
echo ""

print_info "Step 2: Setting correct ownership..."
chown -R www-data:www-data $PROJECT_DIR/dist
print_success "Ownership set to www-data:www-data"
echo ""

print_info "Step 3: Setting correct permissions..."
# Directories should be 755 (rwxr-xr-x)
find $PROJECT_DIR/dist -type d -exec chmod 755 {} \;
# Files should be 644 (rw-r--r--)
find $PROJECT_DIR/dist -type f -exec chmod 644 {} \;
print_success "Permissions set correctly"
echo ""

print_info "Step 4: Setting parent directory permissions..."
chmod 755 /var/www
chmod 755 $PROJECT_DIR
print_success "Parent directories accessible"
echo ""

print_info "Step 5: Checking nginx user..."
NGINX_USER=$(grep -E '^\s*user\s+' /etc/nginx/nginx.conf | awk '{print $2}' | tr -d ';')
if [ -z "$NGINX_USER" ]; then
    NGINX_USER="www-data"
fi
print_info "Nginx runs as user: $NGINX_USER"
echo ""

print_info "Step 6: Testing nginx configuration..."
nginx -t
print_success "Nginx configuration is valid"
echo ""

print_info "Step 7: Restarting nginx..."
systemctl restart nginx
print_success "Nginx restarted"
echo ""

print_info "Step 8: Checking file permissions..."
echo "Directory listing:"
ls -la $PROJECT_DIR/dist/ | head -10
echo ""

echo "=========================================="
echo " Permissions Fixed! ✅"
echo "=========================================="
echo ""
echo "Try accessing your site again:"
echo "  http://web.labelsalesagents.com"
echo ""
echo "If you still get 403, check nginx logs:"
echo "  tail -f /var/log/nginx/error.log"
echo ""
