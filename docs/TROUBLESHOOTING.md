# Troubleshooting Guide

This guide helps you solve common issues you might encounter when deploying or running the Label App.

## Table of Contents

1. [Connection Issues](#connection-issues)
2. [Deployment Issues](#deployment-issues)
3. [Application Issues](#application-issues)
4. [Nginx Issues](#nginx-issues)
5. [SSL Certificate Issues](#ssl-certificate-issues)
6. [PM2 Issues](#pm2-issues)
7. [Performance Issues](#performance-issues)
8. [Useful Commands](#useful-commands)

---

## Connection Issues

### Cannot SSH to server

**Symptom**: Connection refused or timeout when trying to SSH

**Solutions**:

1. **Check if the server is running:**
   - Contact your hosting provider to verify server status

2. **Verify the IP address:**
   ```bash
   ping 31.97.211.184
   ```

3. **Check if SSH is allowed through firewall:**
   ```bash
   # On the server
   sudo ufw status
   sudo ufw allow 22/tcp
   ```

4. **Try alternative SSH port** (if configured):
   ```bash
   ssh -p 2222 root@31.97.211.184
   ```

---

## Deployment Issues

### Git Clone Fails

**Symptom**: "Permission denied" or "Repository not found"

**Solutions**:

1. **Check if Git is installed:**
   ```bash
   git --version
   # If not installed:
   sudo apt install git
   ```

2. **Verify repository access:**
   - Make sure the repository is public, or
   - Set up SSH keys for private repositories

3. **Clone using HTTPS** (if SSH fails):
   ```bash
   git clone https://github.com/toxickim24/label-app.git
   ```

### npm install Fails

**Symptom**: "EACCES" or "permission denied" errors

**Solutions**:

1. **Fix npm permissions:**
   ```bash
   sudo chown -R $USER:$(id -gn $USER) ~/.npm
   sudo chown -R $USER:$(id -gn $USER) /var/www/label-app
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Node.js version:**
   ```bash
   node --version  # Should be v20.x.x
   ```

### Build Fails

**Symptom**: "npm run build:web" fails with errors

**Solutions**:

1. **Check available disk space:**
   ```bash
   df -h
   ```

2. **Increase Node.js memory:**
   ```bash
   export NODE_OPTIONS=--max_old_space_size=4096
   npm run build:web
   ```

3. **Check build logs:**
   - Look for specific error messages
   - Google the error message for solutions

---

## Application Issues

### App Not Accessible

**Symptom**: Cannot access http://web.labelsalesagents.com

**Solutions**:

1. **Check DNS:**
   ```bash
   nslookup web.labelsalesagents.com
   # Should return: 31.97.211.184
   ```

2. **Check if Nginx is running:**
   ```bash
   sudo systemctl status nginx
   # If not running:
   sudo systemctl start nginx
   ```

3. **Check if PM2 process is running:**
   ```bash
   pm2 list
   # If not running:
   pm2 restart label-app
   ```

4. **Check firewall:**
   ```bash
   sudo ufw status
   # Make sure ports 80 and 443 are allowed
   ```

### Blank Page or White Screen

**Symptom**: Website loads but shows a blank page

**Solutions**:

1. **Check browser console** (F12):
   - Look for JavaScript errors
   - Check if files are loading (Network tab)

2. **Verify build was successful:**
   ```bash
   cd /var/www/label-app
   ls -la dist/
   # Should see index.html and assets folder
   ```

3. **Check Nginx is serving correct directory:**
   ```bash
   sudo nginx -t
   cat /etc/nginx/sites-available/label-app | grep root
   # Should show: root /var/www/label-app/dist;
   ```

4. **Rebuild the application:**
   ```bash
   cd /var/www/label-app
   npm run build:web
   pm2 restart label-app
   ```

### Firebase Connection Issues

**Symptom**: Cannot login or Firebase errors in console

**Solutions**:

1. **Check Firebase configuration:**
   ```bash
   cat /var/www/label-app/src/config/firebase.web.ts
   ```

2. **Verify internet connectivity:**
   ```bash
   ping 8.8.8.8
   ```

3. **Check if Firebase services are down:**
   - Visit: https://status.firebase.google.com

---

## Nginx Issues

### Nginx Configuration Test Fails

**Symptom**: `nginx -t` shows errors

**Solutions**:

1. **Check syntax errors in config:**
   ```bash
   sudo nginx -t
   # Read the error message carefully
   ```

2. **Verify config file exists:**
   ```bash
   ls -la /etc/nginx/sites-available/label-app
   ls -la /etc/nginx/sites-enabled/label-app
   ```

3. **Restore from backup:**
   ```bash
   sudo cp /var/www/label-app/deployment/nginx.conf /etc/nginx/sites-available/label-app
   sudo nginx -t
   ```

### Nginx Won't Start

**Symptom**: `systemctl start nginx` fails

**Solutions**:

1. **Check what's using port 80:**
   ```bash
   sudo lsof -i :80
   # Kill the process if needed
   sudo kill -9 [PID]
   ```

2. **Check Nginx error logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Restart Nginx:**
   ```bash
   sudo systemctl stop nginx
   sudo systemctl start nginx
   ```

### 502 Bad Gateway Error

**Symptom**: Website shows "502 Bad Gateway"

**Solutions**:

1. **Check if PM2 is running:**
   ```bash
   pm2 list
   pm2 restart label-app
   ```

2. **Check PM2 logs:**
   ```bash
   pm2 logs label-app
   ```

3. **Verify port configuration:**
   - The app should be running on port 8081
   - Nginx should proxy to this port

### 404 Not Found on Refresh

**Symptom**: App works on homepage but 404 on refresh

**Solutions**:

This is a routing issue. Make sure Nginx config has:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Then reload Nginx:
```bash
sudo systemctl reload nginx
```

---

## SSL Certificate Issues

### Certificate Renewal Fails

**Symptom**: Let's Encrypt renewal error

**Solutions**:

1. **Manually renew:**
   ```bash
   sudo certbot renew
   ```

2. **Check certificate expiration:**
   ```bash
   sudo certbot certificates
   ```

3. **Force renewal:**
   ```bash
   sudo certbot renew --force-renewal
   ```

### Mixed Content Warnings

**Symptom**: HTTPS page loads but with warnings

**Solutions**:

1. **Check if all resources use HTTPS:**
   - Open browser console (F12)
   - Look for mixed content warnings

2. **Force HTTPS redirect in Nginx:**
   ```nginx
   server {
       listen 80;
       server_name web.labelsalesagents.com;
       return 301 https://$server_name$request_uri;
   }
   ```

### Certificate Not Found

**Symptom**: SSL certificate errors

**Solutions**:

1. **Re-run SSL setup:**
   ```bash
   cd /var/www/label-app
   sudo ./deployment/setup-ssl.sh
   ```

2. **Check Certbot logs:**
   ```bash
   sudo cat /var/log/letsencrypt/letsencrypt.log
   ```

---

## PM2 Issues

### PM2 Process Not Starting

**Symptom**: `pm2 start` fails or process shows "errored"

**Solutions**:

1. **Check PM2 logs:**
   ```bash
   pm2 logs label-app --lines 50
   ```

2. **Delete and restart:**
   ```bash
   pm2 delete label-app
   pm2 start npm --name "label-app" -- run serve
   pm2 save
   ```

3. **Check if port 8081 is available:**
   ```bash
   sudo lsof -i :8081
   # Kill the process if needed
   sudo kill -9 [PID]
   ```

### PM2 Process Keeps Restarting

**Symptom**: Process shows high restart count

**Solutions**:

1. **Check logs for errors:**
   ```bash
   pm2 logs label-app --lines 100
   ```

2. **Check available memory:**
   ```bash
   free -h
   ```

3. **Increase PM2 restart limit:**
   ```bash
   pm2 start npm --name "label-app" -- run serve --max-restarts 10
   ```

### PM2 Not Running After Reboot

**Symptom**: App down after server restart

**Solutions**:

1. **Set up PM2 startup:**
   ```bash
   pm2 startup
   # Follow the command it outputs
   pm2 save
   ```

2. **Verify startup is configured:**
   ```bash
   systemctl status pm2-root
   ```

---

## Performance Issues

### Slow Load Times

**Solutions**:

1. **Enable Gzip compression** (should already be in Nginx config):
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. **Check server resources:**
   ```bash
   htop  # Install if needed: sudo apt install htop
   ```

3. **Enable browser caching** (check Nginx config)

### High Memory Usage

**Solutions**:

1. **Check what's using memory:**
   ```bash
   ps aux --sort=-%mem | head
   ```

2. **Restart PM2 processes:**
   ```bash
   pm2 restart all
   ```

3. **Clear old logs:**
   ```bash
   pm2 flush
   ```

---

## Useful Commands

### Check Service Status
```bash
# Nginx
sudo systemctl status nginx

# PM2
pm2 list
pm2 status

# Firewall
sudo ufw status
```

### View Logs
```bash
# Application logs
pm2 logs label-app
pm2 logs label-app --lines 100

# Nginx access logs
sudo tail -f /var/log/nginx/label-app-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -xe
```

### Restart Services
```bash
# Nginx
sudo systemctl restart nginx

# PM2
pm2 restart label-app
pm2 restart all

# Reboot server (last resort!)
sudo reboot
```

### Check Ports
```bash
# See what's using a port
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :8081

# See all listening ports
sudo netstat -tulpn | grep LISTEN
```

### Disk Space
```bash
# Check disk usage
df -h

# Find large directories
du -h --max-depth=1 /var/www

# Clear npm cache
npm cache clean --force

# Clear PM2 logs
pm2 flush
```

---

## Still Having Issues?

If you're still stuck:

1. **Check all logs:**
   ```bash
   pm2 logs label-app --lines 200
   sudo tail -n 200 /var/log/nginx/error.log
   ```

2. **Search for your error message:**
   - Google the specific error
   - Check GitHub issues
   - Check Stack Overflow

3. **Start fresh** (if all else fails):
   ```bash
   cd /var/www/label-app
   git pull origin main
   rm -rf node_modules
   npm install
   npm run build:web
   pm2 restart label-app
   sudo systemctl reload nginx
   ```

4. **Contact support:**
   - Provide error messages
   - Include relevant logs
   - Describe what you've tried

---

## Prevention

To avoid future issues:

1. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Monitor logs regularly:**
   ```bash
   pm2 monit
   ```

3. **Set up log rotation:**
   ```bash
   pm2 install pm2-logrotate
   ```

4. **Back up your configuration:**
   ```bash
   sudo cp /etc/nginx/sites-available/label-app ~/nginx-backup.conf
   ```

5. **Test before deploying:**
   - Always test changes locally first
   - Use `nginx -t` before reloading
   - Check PM2 logs after deployment

---

Good luck! 🍀
