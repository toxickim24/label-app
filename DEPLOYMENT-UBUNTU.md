# Ubuntu 24.04 Deployment - Quick Reference

This is a quick reference for deploying the Label App to Ubuntu 24.04 LTS.

**For complete documentation, see [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**

## Quick Deploy (3 Commands)

```bash
# 1. Setup server (one-time only)
cd /var/www/label-app
chmod +x deployment/setup-server.sh
./deployment/setup-server.sh

# 2. Deploy application
chmod +x deployment/deploy.sh
./deployment/deploy.sh

# 3. Setup SSL/HTTPS
chmod +x deployment/setup-ssl.sh
./deployment/setup-ssl.sh
```

## Server Details

- **IP**: 31.97.211.184
- **Domain**: web.labelsalesagents.com
- **SSH**: `ssh root@31.97.211.184`
- **Project**: /var/www/label-app

## Deployment Files

| File | Purpose |
|------|---------|
| `deployment/setup-server.sh` | Install Node.js, PM2, Nginx, firewall |
| `deployment/deploy.sh` | Build and deploy the app |
| `deployment/setup-ssl.sh` | Setup HTTPS certificate |
| `deployment/nginx.conf` | Nginx web server configuration |
| `docs/DEPLOYMENT.md` | Complete deployment guide |
| `docs/TROUBLESHOOTING.md` | Common issues and solutions |

## After Deployment

Your app will be live at:
- HTTP: http://web.labelsalesagents.com
- HTTPS: https://web.labelsalesagents.com

## Useful Commands

```bash
# Check app status
pm2 status
pm2 logs label-app

# Check web server
systemctl status nginx
tail -f /var/log/nginx/error.log

# Restart services
pm2 restart label-app
systemctl reload nginx

# Deploy updates
cd /var/www/label-app
./deployment/deploy.sh
```

## Need Help?

- See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for full instructions
- See [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) for common issues
- Check logs: `pm2 logs label-app`

---

**Total deployment time: ~15 minutes**
