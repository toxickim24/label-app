#!/bin/bash

#######################################
# Label App - Deployment Script
# This script handles the deployment process
#######################################

set -e  # Exit on any error

echo "=========================================="
echo " Label App - Deployment Script"
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
PROJECT_DIR="/var/www/label-app"
NGINX_CONF="/etc/nginx/sites-available/label-app"
BRANCH="main"

print_info "Starting deployment process..."
echo ""

# Step 1: Check if we're in the right directory
print_step "Step 1/8: Verifying project directory..."
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory not found: $PROJECT_DIR"
    print_info "Please clone the repository first:"
    echo "  cd /var/www"
    echo "  git clone https://github.com/toxickim24/label-app.git"
    exit 1
fi

cd $PROJECT_DIR
print_success "Project directory verified: $PROJECT_DIR"
echo ""

# Step 2: Pull latest code
print_step "Step 2/8: Pulling latest code from GitHub..."
git fetch origin
git reset --hard origin/$BRANCH
print_success "Latest code pulled from GitHub ($BRANCH branch)"
echo ""

# Step 3: Install/update dependencies
print_step "Step 3/8: Installing dependencies..."
npm install
print_success "Dependencies installed"
echo ""

# Step 4: Build the web application
print_step "Step 4/8: Building production web app..."
print_info "This may take a few minutes..."
npm run build:web
print_success "Production build complete"
echo ""

# Step 5: Configure Nginx (if not already configured)
print_step "Step 5/8: Configuring Nginx..."
if [ ! -f "$NGINX_CONF" ]; then
    print_info "Creating Nginx configuration..."
    cp deployment/nginx.conf $NGINX_CONF
    ln -sf $NGINX_CONF /etc/nginx/sites-enabled/label-app
    print_success "Nginx configuration created"
else
    print_info "Nginx configuration already exists"
    print_info "Updating configuration..."
    cp deployment/nginx.conf $NGINX_CONF
    print_success "Nginx configuration updated"
fi

# Test Nginx configuration
nginx -t
print_success "Nginx configuration is valid"
echo ""

# Step 6: Restart/Start PM2
print_step "Step 6/8: Managing PM2 process..."
if pm2 list | grep -q "label-app"; then
    print_info "Restarting existing PM2 process..."
    pm2 restart label-app
    print_success "PM2 process restarted"
else
    print_info "Starting new PM2 process..."
    pm2 start npm --name "label-app" -- run serve
    pm2 save
    print_success "PM2 process started"
fi
echo ""

# Step 7: Reload Nginx
print_step "Step 7/8: Reloading Nginx..."
systemctl reload nginx
print_success "Nginx reloaded"
echo ""

# Step 8: Verify deployment
print_step "Step 8/8: Verifying deployment..."

# Check if PM2 process is running
if pm2 list | grep -q "online.*label-app"; then
    print_success "Application is running"
else
    print_error "Application is not running. Check PM2 logs:"
    echo "  pm2 logs label-app"
    exit 1
fi

# Check if Nginx is running
if systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
else
    print_error "Nginx is not running"
    exit 1
fi

echo ""

# Summary
echo "=========================================="
echo " Deployment Complete! 🎉"
echo "=========================================="
echo ""
echo "Your application is now live at:"
echo "  • http://web.labelsalesagents.com"
if [ -f "/etc/letsencrypt/live/web.labelsalesagents.com/fullchain.pem" ]; then
    echo "  • https://web.labelsalesagents.com (SSL enabled)"
fi
echo ""
echo "Useful Commands:"
echo "  • View logs:        pm2 logs label-app"
echo "  • Restart app:      pm2 restart label-app"
echo "  • Stop app:         pm2 stop label-app"
echo "  • Nginx status:     systemctl status nginx"
echo "  • Nginx logs:       tail -f /var/log/nginx/error.log"
echo ""
echo "To deploy updates in the future, just run:"
echo "  ./deployment/deploy.sh"
echo ""
echo "=========================================="
