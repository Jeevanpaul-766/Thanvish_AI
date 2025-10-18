# 🚀 Deployment Guide - Sanātana Dharma LLM on Contabo Server

Complete guide to deploy your AI chatbot on Contabo VPS.

---

## 📋 **Prerequisites**

### **On Your Local Machine:**
- ✅ Git installed
- ✅ SSH access to your Contabo server
- ✅ Domain name (optional but recommended)

### **Contabo Server Requirements:**
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 20GB available
- **OS**: Ubuntu 20.04/22.04 LTS
- **CPU**: 2+ cores

---

## 🎯 **Deployment Options**

### **Option 1: Docker Deployment** (Recommended)
- ✅ Easier to manage
- ✅ Isolated environment
- ✅ Easy to scale

### **Option 2: Direct Deployment**
- ✅ Better performance
- ✅ More control
- ✅ Lower resource usage

---

## 🐳 **Option 1: Docker Deployment**

### **Step 1: Prepare Your Server**

```bash
# SSH into your Contabo server
ssh root@your-server-ip

# Update system
apt-get update && apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get install docker-compose -y

# Start Docker service
systemctl start docker
systemctl enable docker
```

### **Step 2: Upload Your Project**

```bash
# On your local machine
cd "C:\Users\jeeva\OneDrive\Desktop\Others\Thanvish.Ai\Sanathana Dharma"

# Create archive (excluding venv)
tar --exclude='venv' --exclude='__pycache__' -czf sanatana-dharma.tar.gz .

# Upload to server
scp sanatana-dharma.tar.gz root@your-server-ip:/root/

# On server: Extract
cd /root
tar -xzf sanatana-dharma.tar.gz -C /opt/sanatana-dharma
cd /opt/sanatana-dharma
```

### **Step 3: Configure Environment**

```bash
# Copy and edit environment file
cd /opt/sanatana-dharma/server
cp config.env.example config.env
nano config.env  # Edit with your settings
```

### **Step 4: Deploy with Docker Compose**

```bash
cd /opt/sanatana-dharma

# Build and start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Test the API
curl http://localhost:8000/health
```

### **Step 5: Setup Nginx Reverse Proxy**

```bash
# Install Nginx
apt-get install nginx -y

# Copy configuration
cp nginx/nginx.conf /etc/nginx/sites-available/sanatana-dharma

# Enable site
ln -s /etc/nginx/sites-available/sanatana-dharma /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Update domain in config
nano /etc/nginx/sites-available/sanatana-dharma
# Change yourdomain.com to your actual domain

# Test and reload
nginx -t
systemctl reload nginx
```

### **Step 6: Setup SSL (HTTPS)**

```bash
# Install Certbot
apt-get install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

---

## 💻 **Option 2: Direct Deployment (Without Docker)**

### **Step 1: Setup Python Environment**

```bash
# SSH to server
ssh root@your-server-ip

# Install Python 3.10
apt-get update
apt-get install -y python3.10 python3-pip python3-venv git

# Create application directory
mkdir -p /opt/sanatana-dharma
cd /opt/sanatana-dharma
```

### **Step 2: Upload and Setup Project**

```bash
# Upload project files (from local machine)
scp -r . root@your-server-ip:/opt/sanatana-dharma/

# On server: Create virtual environment
cd /opt/sanatana-dharma
python3.10 -m venv venv
source venv/bin/activate

# Install dependencies
cd server
pip install -r requirements.txt
```

### **Step 3: Setup Systemd Service**

```bash
# Copy service file
cp /opt/sanatana-dharma/deployment/sanatana-dharma.service /etc/systemd/system/

# Edit if needed
nano /etc/systemd/system/sanatana-dharma.service

# Enable and start service
systemctl daemon-reload
systemctl enable sanatana-dharma
systemctl start sanatana-dharma

# Check status
systemctl status sanatana-dharma

# View logs
journalctl -u sanatana-dharma -f
```

### **Step 4: Setup Nginx (Same as Docker Option - Step 5)**

---

## 🔒 **Security Hardening**

### **1. Firewall Configuration**

```bash
# Install UFW
apt-get install ufw -y

# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Check status
ufw status
```

### **2. Fail2Ban (Protect against brute force)**

```bash
# Install Fail2Ban
apt-get install fail2ban -y

# Configure
nano /etc/fail2ban/jail.local

# Add:
[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

# Restart
systemctl restart fail2ban
```

### **3. Regular Updates**

```bash
# Setup automatic security updates
apt-get install unattended-upgrades -y
dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 📊 **Monitoring & Maintenance**

### **Check Application Status**

```bash
# For Docker deployment
docker-compose ps
docker-compose logs -f backend

# For Direct deployment
systemctl status sanatana-dharma
journalctl -u sanatana-dharma -f
```

### **Monitor Resources**

```bash
# CPU and Memory
htop

# Disk space
df -h

# Docker stats
docker stats
```

### **Update Application**

```bash
# For Docker
cd /opt/sanatana-dharma
git pull  # or upload new files
docker-compose down
docker-compose build
docker-compose up -d

# For Direct deployment
cd /opt/sanatana-dharma
git pull  # or upload new files
systemctl restart sanatana-dharma
```

---

## 🧪 **Testing Deployment**

### **1. Health Check**

```bash
curl http://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_type": "GPT-2",
  "version": "1.0.0"
}
```

### **2. Chat API Test**

```bash
curl -X POST http://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is dharma?", "mode": "adult"}'
```

### **3. Frontend Access**

Open browser: `http://your-domain.com`

---

## 🔧 **Troubleshooting**

### **Issue: Container won't start**

```bash
# Check logs
docker-compose logs backend

# Check if port is in use
netstat -tulpn | grep 8000

# Restart services
docker-compose restart
```

### **Issue: Nginx 502 Bad Gateway**

```bash
# Check backend is running
curl http://localhost:8000/health

# Check nginx logs
tail -f /var/log/nginx/error.log

# Restart nginx
systemctl restart nginx
```

### **Issue: Out of Memory**

```bash
# Check memory usage
free -m

# Add swap space
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### **Issue: Model Loading Fails**

```bash
# Check if model files exist
ls -lh /opt/sanatana-dharma/server/models/gpt2-gita-clean/

# Check permissions
chown -R appuser:appuser /opt/sanatana-dharma/server/models/

# Check logs for details
docker-compose logs backend | grep -i error
```

---

## 📱 **Domain Configuration**

### **Point Domain to Server**

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add A records:
   ```
   Type: A
   Name: @
   Value: YOUR_CONTABO_SERVER_IP
   TTL: 3600
   
   Type: A
   Name: www
   Value: YOUR_CONTABO_SERVER_IP
   TTL: 3600
   ```
3. Wait 5-30 minutes for DNS propagation

---

## 🚀 **Performance Optimization**

### **1. Enable HTTP/2**

Already configured in nginx.conf (requires SSL)

### **2. Setup Caching**

```bash
# Install Redis for caching (optional)
docker run -d -p 6379:6379 redis:alpine
```

### **3. CDN Integration**

Consider using Cloudflare for:
- DDoS protection
- Global CDN
- Free SSL
- Analytics

---

## 💾 **Backup Strategy**

### **Create Backup Script**

```bash
#!/bin/bash
# /opt/sanatana-dharma/backup.sh

BACKUP_DIR="/backup/sanatana-dharma"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /opt/sanatana-dharma

# Backup database (if you add one later)
# mysqldump -u user -p database > $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -mtime +7 -delete

echo "Backup completed: $DATE"
```

### **Schedule Backups**

```bash
# Add to crontab
crontab -e

# Add this line (backup daily at 2 AM)
0 2 * * * /opt/sanatana-dharma/backup.sh
```

---

## 📞 **Support & Resources**

- **Application Logs**: `/var/log/nginx/`, `journalctl -u sanatana-dharma`
- **Docker Logs**: `docker-compose logs`
- **Nginx Logs**: `/var/log/nginx/error.log`

---

## ✅ **Deployment Checklist**

- [ ] Server provisioned and accessible
- [ ] Domain pointed to server IP
- [ ] Docker/Python installed
- [ ] Application uploaded and configured
- [ ] Environment variables set
- [ ] Services running (backend + frontend)
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Monitoring setup
- [ ] Backups configured
- [ ] Health check passing
- [ ] Frontend accessible
- [ ] API responding correctly

---

**🎉 Congratulations! Your Sanātana Dharma LLM is now live in production!**

