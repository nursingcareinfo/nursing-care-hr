#!/bin/bash
# Baserow Deployment Script for NursingCare.pk
# Quick setup for employee database

set -e

echo "🚀 Deploying Baserow for NursingCare.pk HR Management"
echo "======================================================"

# Configuration
BASEROW_VERSION="latest"
INSTALL_DIR="${BASEROW_INSTALL_DIR:-$HOME/baserow}"
PUBLIC_URL="${BASEROW_PUBLIC_URL:-http://localhost}"
ADMIN_EMAIL="${BASEROW_ADMIN_EMAIL:-admin@nursingcare.pk}"

echo ""
echo "Configuration:"
echo "  Install Directory: $INSTALL_DIR"
echo "  Public URL: $PUBLIC_URL"
echo "  Admin Email: $ADMIN_EMAIL"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Docker found: $(docker --version)"

# Create installation directory
echo ""
echo "📁 Creating installation directory..."
mkdir -p $INSTALL_DIR
cd $INSTALL_DIR

# Create docker-compose.yml
echo "📝 Creating docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
version: "3.8"

services:
  baserow:
    image: baserow/baserow:latest
    container_name: baserow
    environment:
      BASEROW_PUBLIC_URL: ${BASEROW_PUBLIC_URL:-http://localhost}
      BASEROW_ADMIN_EMAIL: ${BASEROW_ADMIN_EMAIL:-admin@nursingcare.pk}
      BASEROW_ADMIN_PASSWORD: ${BASEROW_ADMIN_PASSWORD:-ChangeMe123!}
      BASEROW_JWT_SECRET: ${BASEROW_JWT_SECRET:-your-secret-key-change-this}
      BASEROW_EMAIL_SMTP_HOST: ${BASEROW_EMAIL_SMTP_HOST:-}
      BASEROW_EMAIL_SMTP_PORT: ${BASEROW_EMAIL_SMTP_PORT:-587}
      BASEROW_EMAIL_SMTP_USER: ${BASEROW_EMAIL_SMTP_USER:-}
      BASEROW_EMAIL_SMTP_PASSWORD: ${BASEROW_EMAIL_SMTP_PASSWORD:-}
      BASEROW_EMAIL_SMTP_FROM: ${BASEROW_EMAIL_SMTP_FROM:-noreply@nursingcare.pk}
    volumes:
      - baserow_data:/baserow/data
    ports:
      - "80:80"
      - "443:443"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health/"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  baserow_data:
    driver: local
EOF

# Create .env file
echo "📝 Creating .env file..."
cat > .env << EOF
# Baserow Configuration for NursingCare.pk
BASEROW_PUBLIC_URL=$PUBLIC_URL
BASEROW_ADMIN_EMAIL=$ADMIN_EMAIL
BASEROW_ADMIN_PASSWORD=$(openssl rand -base64 12)1A!
BASEROW_JWT_SECRET=$(openssl rand -base64 32)

# Email Configuration (optional - for notifications)
BASEROW_EMAIL_SMTP_HOST=
BASEROW_EMAIL_SMTP_PORT=587
BASEROW_EMAIL_SMTP_USER=
BASEROW_EMAIL_SMTP_PASSWORD=
BASEROW_EMAIL_SMTP_FROM=noreply@nursingcare.pk
EOF

echo ""
echo "🔐 Generated secure passwords in .env file"
echo "   IMPORTANT: Save these credentials!"
grep "BASEROW_ADMIN" .env

# Start Baserow
echo ""
echo "🚀 Starting Baserow container..."
docker-compose up -d

# Wait for Baserow to be ready
echo ""
echo "⏳ Waiting for Baserow to start (this may take 2-3 minutes)..."
sleep 30

# Check health
MAX_RETRIES=20
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s -f http://localhost/health/ > /dev/null 2>&1; then
        echo "✅ Baserow is running!"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   Waiting... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 10
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "⚠️  Baserow may not be fully ready yet. Check logs with: docker-compose logs -f"
fi

# Print success message
echo ""
echo "======================================================"
echo "🎉 Baserow Deployment Complete!"
echo "======================================================"
echo ""
echo "📍 Access Baserow: $PUBLIC_URL"
echo "👤 Admin Email: $ADMIN_EMAIL"
echo "🔑 Admin Password: Check .env file (BASEROW_ADMIN_PASSWORD)"
echo ""
echo "Next Steps:"
echo "  1. Login to Baserow at $PUBLIC_URL"
echo "  2. Create 'Employees' database"
echo "  3. Import data from Supabase (see migration script)"
echo "  4. Build intake form for new hires"
echo ""
echo "Useful Commands:"
echo "  docker-compose logs -f     # View logs"
echo "  docker-compose stop        # Stop Baserow"
echo "  docker-compose start       # Start Baserow"
echo "  docker-compose restart     # Restart Baserow"
echo ""
echo "Backup Command:"
echo "  docker-compose exec baserow backup"
echo ""
