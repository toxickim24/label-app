# Label App - Deployment Guide for Ubuntu 24.04 LTS

This guide will walk you through deploying the Label App web application to an Ubuntu 24.04 LTS server. No prior Ubuntu experience required!

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Information](#server-information)
3. [Quick Start (Automated)](#quick-start-automated)
4. [Manual Deployment (Step by Step)](#manual-deployment-step-by-step)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have:

- [x] Ubuntu 24.04 LTS server access (root@31.97.211.184)
- [x] Domain name pointing to your server (web.labelsalesagents.com → 31.97.211.184)
- [x] GitHub repository access (https://github.com/toxickim24/label-app.git)
- [x] SSH client (PuTTY for Windows, Terminal for Mac/Linux)

---

## Server Information

- **Server IP**: 31.97.211.184
- **SSH Access**: `ssh root@31.97.211.184`
- **Domain**: web.labelsalesagents.com
- **Project Directory**: `/var/www/label-app`
- **Existing Website**: /var/www/agent-crm (DO NOT TOUCH - Live site at app.labelsalesagents.com)
- **Web Port**: 80 (HTTP) and 443 (HTTPS)

---

## Quick Start (Automated)

We've created automated scripts to make deployment easy. Just follow these steps:

### Step 1: Connect to Your Server

Open your terminal (or PuTTY on Windows) and connect to the server:

```bash
ssh root@31.97.211.184
```

When asked for a password, enter your server password.

### Step 2: Download and Run the Setup Script

Once connected to the server, run these commands one by one:

```bash
# Download the repository
cd /var/www
git clone https://github.com/toxickim24/label-app.git

# Navigate to the project directory
cd label-app

# Make the setup script executable
chmod +x deployment/setup-server.sh

# Run the automated setup
./deployment/setup-server.sh
```

**What this script does:**
- Installs Node.js 20 (required for the app)
- Installs npm dependencies
- Installs and configures Nginx (web server)
- Sets up PM2 (keeps your app running)
- Configures firewall settings

This will take about 5-10 minutes. Grab a coffee!

### Step 3: Deploy the Application

After the setup completes, run the deployment script:

```bash
# Make the deployment script executable
chmod +x deployment/deploy.sh

# Run the deployment
./deployment/deploy.sh
```

**What this script does:**
- Pulls latest code from GitHub
- Installs/updates dependencies
- Builds the production web app
- Starts the application with PM2
- Reloads Nginx configuration

### Step 4: Set Up SSL Certificate (HTTPS)

To enable HTTPS for your website:

```bash
# Make the SSL script executable
chmod +x deployment/setup-ssl.sh

# Run the SSL setup
./deployment/setup-ssl.sh
```

**What this script does:**
- Installs Certbot (free SSL certificate tool)
- Obtains SSL certificate from Let's Encrypt
- Configures automatic renewal
- Updates Nginx to use HTTPS

You're done! Your app should now be live at:
- **HTTP**: http://web.labelsalesagents.com
- **HTTPS**: https://web.labelsalesagents.com

---

## Manual Deployment (Step by Step)

If you prefer to understand each step or the automated scripts don't work, follow this manual guide.

### Step 1: Connect to Your Server

```bash
ssh root@31.97.211.184
```

### Step 2: Update System Packages

First, let's make sure your server has the latest updates:

```bash
# Update package list
apt update

# Upgrade installed packages
apt upgrade -y
```

### Step 3: Install Node.js 20

The app requires Node.js 20. Let's install it:

```bash
# Install curl if not already installed
apt install -y curl

# Download Node.js 20 setup script
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js
apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x or higher
```

### Step 4: Install Git (if not already installed)

```bash
apt install -y git
```

### Step 5: Clone the Repository

```bash
# Navigate to /var/www directory
cd /var/www

# Clone the repository
git clone https://github.com/toxickim24/label-app.git

# Navigate into the project
cd label-app
```

### Step 6: Install Project Dependencies

```bash
# Install all npm packages (this may take a few minutes)
npm install
```

### Step 7: Build the Web Application

```bash
# Build the production web app
npm run build:web
```

This creates an optimized production build in the `dist` folder.

### Step 8: Install PM2 (Process Manager)

PM2 keeps your app running even after you close the terminal:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start npm --name "label-app" -- run serve

# Save PM2 configuration
pm2 save

# Set PM2 to start on server reboot
pm2 startup
# Follow the command it outputs (copy and run it)
```

### Step 9: Install and Configure Nginx

Nginx will serve your application to the internet:

```bash
# Install Nginx
apt install -y nginx

# Create Nginx configuration file
nano /etc/nginx/sites-available/label-app
```

Paste this configuration (see `deployment/nginx.conf` for the full config):

```nginx
server {
    listen 80;
    server_name web.labelsalesagents.com;

    root /var/www/label-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
```

Save the file (Ctrl+X, then Y, then Enter).

Enable the site:

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/label-app /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

### Step 10: Configure Firewall

```bash
# Allow HTTP traffic
ufw allow 80/tcp

# Allow HTTPS traffic
ufw allow 443/tcp

# Allow SSH (important!)
ufw allow 22/tcp

# Enable firewall
ufw enable
```

### Step 11: Set Up SSL Certificate (HTTPS)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
certbot --nginx -d web.labelsalesagents.com

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)

# Test automatic renewal
certbot renew --dry-run
```

---

## Post-Deployment

### Verify Everything is Working

1. **Check if the app is running:**
   ```bash
   pm2 status
   ```
   You should see "label-app" with status "online"

2. **Check Nginx status:**
   ```bash
   systemctl status nginx
   ```
   Should show "active (running)"

3. **Visit your website:**
   - Open a browser and go to https://web.labelsalesagents.com
   - You should see the Label App login screen

### Useful Commands

```bash
# View application logs
pm2 logs label-app

# Restart the application
pm2 restart label-app

# Stop the application
pm2 stop label-app

# Reload Nginx
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# View Nginx error logs
tail -f /var/log/nginx/error.log
```

---

## Updating the Application

When you make changes to the code and want to deploy updates:

```bash
# Navigate to project directory
cd /var/www/label-app

# Run the deployment script
./deployment/deploy.sh
```

Or manually:

```bash
# Pull latest code
git pull origin main

# Install any new dependencies
npm install

# Rebuild the application
npm run build:web

# Restart PM2
pm2 restart label-app

# Reload Nginx
systemctl reload nginx
```

---

## Security Best Practices

1. **Keep your system updated:**
   ```bash
   apt update && apt upgrade -y
   ```

2. **Set up automatic security updates:**
   ```bash
   apt install -y unattended-upgrades
   dpkg-reconfigure --priority=low unattended-upgrades
   ```

3. **Monitor your application:**
   ```bash
   pm2 monit
   ```

4. **Set up log rotation** (prevent logs from filling up disk):
   ```bash
   pm2 install pm2-logrotate
   ```

---

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

---

## Need Help?

- Check the logs: `pm2 logs label-app`
- Check Nginx logs: `tail -f /var/log/nginx/error.log`
- Verify DNS: `nslookup web.labelsalesagents.com`
- Test Nginx config: `nginx -t`

---

## Summary

You've successfully deployed the Label App! Here's what you accomplished:

- ✅ Set up Ubuntu 24.04 LTS server
- ✅ Installed Node.js 20 and dependencies
- ✅ Built and deployed the web application
- ✅ Configured Nginx web server
- ✅ Set up SSL certificate for HTTPS
- ✅ Configured firewall for security
- ✅ Set up PM2 for process management

Your app is now live at **https://web.labelsalesagents.com** 🎉
