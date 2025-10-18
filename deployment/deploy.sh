#!/bin/bash

# Sanātana Dharma LLM - Deployment Script for Contabo Server
# Run this script on your Contabo server

set -e  # Exit on error

echo "======================================"
echo "Sanātana Dharma LLM Deployment"
echo "======================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/sanatana-dharma"
DOMAIN="yourdomain.com"  # Change this!

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo -e "${RED}Please run as root (use sudo)${NC}"
   exit 1
fi

echo -e "${YELLOW}Step 1: System Update${NC}"
apt-get update
apt-get upgrade -y

echo -e "${YELLOW}Step 2: Installing Dependencies${NC}"
apt-get install -y \
    python3.10 \
    python3-pip \
    python3-venv \
    docker.io \
    docker-compose \
    nginx \
    certbot \
    python3-certbot-nginx \
    git \
    curl \
    ufw

echo -e "${YELLOW}Step 3: Configure Firewall${NC}"
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

echo -e "${YELLOW}Step 4: Setting up Application Directory${NC}"
mkdir -p $APP_DIR
cd $APP_DIR

# If this is a fresh install, clone the repository
if [ ! -d "$APP_DIR/server" ]; then
    echo "Please upload your project files to $APP_DIR"
    echo "You can use: scp -r . user@server:/opt/sanatana-dharma/"
    exit 0
fi

echo -e "${YELLOW}Step 5: Setting up Python Virtual Environment${NC}"
cd $APP_DIR
python3.10 -m venv venv
source venv/bin/activate
pip install --upgrade pip
cd server
pip install -r requirements.txt

echo -e "${YELLOW}Step 6: Creating Environment File${NC}"
if [ ! -f "$APP_DIR/server/config.env" ]; then
    cp $APP_DIR/server/config.env.example $APP_DIR/server/config.env
    echo -e "${YELLOW}Please edit $APP_DIR/server/config.env with your settings${NC}"
fi

echo -e "${YELLOW}Step 7: Setting up Systemd Service (Non-Docker)${NC}"
cp $APP_DIR/deployment/sanatana-dharma.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable sanatana-dharma
systemctl start sanatana-dharma

echo -e "${YELLOW}Step 8: Configuring Nginx${NC}"
cp $APP_DIR/nginx/nginx.conf /etc/nginx/sites-available/sanatana-dharma
ln -sf /etc/nginx/sites-available/sanatana-dharma /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Reload nginx
systemctl reload nginx

echo -e "${YELLOW}Step 9: Setting up SSL (Optional but Recommended)${NC}"
read -p "Do you want to setup SSL with Let's Encrypt? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    certbot --nginx -d $DOMAIN -d www.$DOMAIN
fi

echo -e "${GREEN}======================================"
echo -e "Deployment Complete!"
echo -e "======================================${NC}"
echo ""
echo -e "Your application is running at:"
echo -e "  - Frontend: http://$DOMAIN"
echo -e "  - API: http://$DOMAIN/api"
echo -e "  - Health: http://$DOMAIN/api/health"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  - Check status: systemctl status sanatana-dharma"
echo -e "  - View logs: journalctl -u sanatana-dharma -f"
echo -e "  - Restart: systemctl restart sanatana-dharma"
echo ""
echo -e "${YELLOW}Using Docker instead?${NC}"
echo -e "  Run: docker-compose up -d"
echo ""

