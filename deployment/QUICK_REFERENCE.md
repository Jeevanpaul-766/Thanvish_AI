# ⚡ Quick Reference Card - Production Deployment

## 🚀 **Deploy in 3 Commands**

```bash
# 1. Upload to server
scp -r . root@your-server:/opt/sanatana-dharma/

# 2. On server: Configure
cd /opt/sanatana-dharma
cp server/config.env.example server/config.env
nano server/config.env

# 3. Deploy with Docker
docker-compose up -d
```

---

## 📋 **Essential Commands**

### **Docker**
```bash
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose restart            # Restart
docker-compose logs -f            # View logs
docker-compose ps                 # Check status
docker-compose build              # Rebuild containers
```

### **Systemd (Non-Docker)**
```bash
sudo systemctl start sanatana-dharma    # Start
sudo systemctl stop sanatana-dharma     # Stop
sudo systemctl restart sanatana-dharma  # Restart
sudo systemctl status sanatana-dharma   # Status
journalctl -u sanatana-dharma -f        # Logs
```

### **Nginx**
```bash
sudo nginx -t                     # Test config
sudo systemctl reload nginx       # Reload
sudo systemctl restart nginx      # Restart
tail -f /var/log/nginx/error.log  # Error logs
tail -f /var/log/nginx/access.log # Access logs
```

---

## 🔍 **Health Checks**

```bash
# Backend health
curl http://localhost:8000/health

# Frontend
curl http://localhost:80

# Full API test
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "mode": "adult"}'
```

---

## 📊 **Monitoring**

```bash
# Resource usage
htop                              # CPU/RAM
df -h                             # Disk space
docker stats                      # Container stats
free -m                           # Memory

# Logs
docker-compose logs -f backend    # Backend logs
docker-compose logs -f frontend   # Frontend logs
journalctl -u sanatana-dharma -f  # System logs
```

---

## 🔒 **Security**

```bash
# Firewall
sudo ufw status                   # Check status
sudo ufw enable                   # Enable
sudo ufw allow 80/tcp             # Allow HTTP
sudo ufw allow 443/tcp            # Allow HTTPS

# SSL Certificate (Let's Encrypt)
sudo certbot --nginx -d yourdomain.com
sudo certbot renew --dry-run      # Test renewal
```

---

## 🔧 **Troubleshooting**

```bash
# Check if port is in use
sudo lsof -i :8000

# Kill process on port
sudo kill -9 $(lsof -t -i :8000)

# Restart everything
docker-compose down && docker-compose up -d

# Check DNS
nslookup yourdomain.com

# Test internal connection
curl http://backend:8000/health   # From nginx container
```

---

## 📁 **Important Files**

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Main orchestration |
| `server/Dockerfile` | Backend container |
| `nginx/nginx.conf` | Web server config |
| `server/config.env` | Environment variables |
| `deployment/DEPLOYMENT_GUIDE.md` | Full guide |

---

## 🌐 **URLs After Deployment**

- **Frontend**: `http://your-domain.com`
- **API**: `http://your-domain.com/api`
- **Health**: `http://your-domain.com/api/health`
- **Chat**: `POST http://your-domain.com/api/chat`

---

## 📞 **Quick Fixes**

### **503 Service Unavailable**
```bash
docker-compose restart backend
```

### **502 Bad Gateway**
```bash
# Check backend is running
curl http://localhost:8000/health
# Restart nginx
sudo systemctl restart nginx
```

### **Out of Memory**
```bash
# Add 4GB swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### **Model Not Loading**
```bash
# Check model files
ls -lh server/models/gpt2-gita-clean/
# Check permissions
sudo chown -R 1000:1000 server/models/
```

---

## 🔄 **Update Application**

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Or with script
./deployment/docker-quick-start.sh
```

---

## 💾 **Backup**

```bash
# Backup everything
tar -czf backup-$(date +%Y%m%d).tar.gz /opt/sanatana-dharma

# Backup just models
tar -czf models-backup.tar.gz server/models/

# Restore
tar -xzf backup-20241018.tar.gz -C /opt/
```

---

**For detailed instructions, see: `deployment/DEPLOYMENT_GUIDE.md`**

