#!/bin/bash

# Quick Docker Deployment Script
# Run this on your Contabo server for instant deployment

set -e

echo "🕉️  Sanātana Dharma LLM - Quick Docker Deploy"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${BLUE}Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${BLUE}Installing Docker Compose...${NC}"
    apt-get update
    apt-get install -y docker-compose
fi

# Start services
echo -e "${BLUE}Starting services...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${BLUE}Waiting for services to start...${NC}"
sleep 10

# Health check
echo -e "${BLUE}Testing health endpoint...${NC}"
curl -f http://localhost:8000/health || echo "Health check pending..."

echo ""
echo -e "${GREEN}=============================================="
echo -e "✅ Deployment Complete!"
echo -e "=============================================="
echo ""
echo "Access your application:"
echo "  - Frontend: http://$(hostname -I | awk '{print $1}')"
echo "  - API: http://$(hostname -I | awk '{print $1}'):8000"
echo "  - Health: http://$(hostname -I | awk '{print $1}'):8000/health"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop: docker-compose down"
echo "  - Restart: docker-compose restart"
echo ""
echo -e "${NC}"

