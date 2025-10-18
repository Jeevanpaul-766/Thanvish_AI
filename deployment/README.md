# 🚀 Deployment Files

This directory contains all files needed to deploy the Sanātana Dharma LLM to production.

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `DEPLOYMENT_GUIDE.md` | **Complete deployment guide** (START HERE) |
| `deploy.sh` | Automated deployment script for Ubuntu/Debian |
| `docker-quick-start.sh` | Quick Docker deployment (fastest method) |
| `sanatana-dharma.service` | Systemd service file for non-Docker deployment |

## 🎯 Quick Start Options

### **Option 1: Docker (Easiest)**
```bash
# On your Contabo server
cd /opt/sanatana-dharma
chmod +x deployment/docker-quick-start.sh
./deployment/docker-quick-start.sh
```

### **Option 2: Full Automated Deployment**
```bash
# On your Contabo server
cd /opt/sanatana-dharma
chmod +x deployment/deploy.sh
sudo ./deployment/deploy.sh
```

### **Option 3: Manual Setup**
Follow the detailed steps in `DEPLOYMENT_GUIDE.md`

## 📚 Documentation

- **Full Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Docker Compose**: [../docker-compose.yml](../docker-compose.yml)
- **Nginx Config**: [../nginx/nginx.conf](../nginx/nginx.conf)

## ⚙️ Configuration Files

Before deploying, copy and configure:
```bash
cp ../server/config.env.example ../server/config.env
# Edit config.env with your settings
```

## 🔒 Security Checklist

- [ ] Change default SECRET_KEY in config.env
- [ ] Setup firewall (UFW)
- [ ] Install SSL certificate
- [ ] Configure CORS for your domain
- [ ] Setup fail2ban for SSH protection
- [ ] Enable automatic security updates

## 🧪 Testing

After deployment, test:
```bash
# Health check
curl http://your-domain.com/api/health

# Chat test
curl -X POST http://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is dharma?", "mode": "adult"}'
```

## 📞 Need Help?

1. Check logs: `docker-compose logs -f` or `journalctl -u sanatana-dharma -f`
2. Review troubleshooting section in DEPLOYMENT_GUIDE.md
3. Verify all checklist items are completed

---

**Ready to deploy? Start with `DEPLOYMENT_GUIDE.md`** 🚀

