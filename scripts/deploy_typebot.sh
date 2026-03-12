#!/bin/bash
# Typebot Deployment Script for NursingCare.pk
# WhatsApp chatbot builder for employee intake

set -e

echo "🚀 Deploying Typebot for NursingCare.pk HR Management"
echo "======================================================"

# Configuration
INSTALL_DIR="${TYPEBOT_INSTALL_DIR:-$HOME/typebot}"
PUBLIC_URL="${TYPEBOT_PUBLIC_URL:-http://localhost:3001}"
DB_PASSWORD="${TYPEBOT_DB_PASSWORD:-$(openssl rand -base64 12)}"
NEXTAUTH_SECRET="${TYPEBOT_NEXTAUTH_SECRET:-$(openssl rand -base64 32)}"
ENCRYPTION_SECRET="${TYPEBOT_ENCRYPTION_SECRET:-$(openssl rand -base64 32)}"

echo ""
echo "Configuration:"
echo "  Install Directory: $INSTALL_DIR"
echo "  Builder URL: $PUBLIC_URL"
echo "  Viewer URL: http://localhost:3002"
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
cat > docker-compose.yml << EOF
version: "3.8"

services:
  typebot-builder:
    image: baptistearno/typebot-builder:latest
    container_name: typebot-builder
    ports:
      - "3001:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:$DB_PASSWORD@db:5432/typebot
      - NEXTAUTH_URL=$PUBLIC_URL
      - NEXTAUTH_SECRET=$NEXTAUTH_SECRET
      - ENCRYPTION_SECRET=$ENCRYPTION_SECRET
      - SMTP_HOST=\${SMTP_HOST:-}
      - SMTP_PORT=\${SMTP_PORT:-587}
      - SMTP_USER=\${SMTP_USER:-}
      - SMTP_PASS=\${SMTP_PASS:-}
      - SMTP_FROM=\${SMTP_FROM:-noreply@nursingcare.pk}
    volumes:
      - typebot_builder_data:/app/builder-data
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy

  typebot-viewer:
    image: baptistearno/typebot-viewer:latest
    container_name: typebot-viewer
    ports:
      - "3002:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:$DB_PASSWORD@db:5432/typebot
      - NEXTAUTH_URL=$PUBLIC_URL
      - NEXTAUTH_SECRET=$NEXTAUTH_SECRET
      - ENCRYPTION_SECRET=$ENCRYPTION_SECRET
    volumes:
      - typebot_viewer_data:/app/viewer-data
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:15
    container_name: typebot-db
    environment:
      - POSTGRES_PASSWORD=$DB_PASSWORD
      - POSTGRES_DB=typebot
    volumes:
      - typebot_db_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  typebot_builder_data:
  typebot_viewer_data:
  typebot_db_data:
EOF

# Create .env file
echo "📝 Creating .env file..."
cat > .env << EOF
# Typebot Configuration for NursingCare.pk
TYPEBOT_PUBLIC_URL=$PUBLIC_URL
TYPEBOT_DB_PASSWORD=$DB_PASSWORD
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENCRYPTION_SECRET=$ENCRYPTION_SECRET

# Email Configuration (optional - for sending confirmations)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@nursingcare.pk

# WhatsApp Integration (configure after deployment)
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_ACCESS_TOKEN=
EOF

echo ""
echo "🔐 Generated secure passwords in .env file"
echo "   IMPORTANT: Save these credentials!"
echo "   Database Password: $DB_PASSWORD"
echo "   NextAuth Secret: $NEXTAUTH_SECRET"
echo ""

# Start Typebot
echo ""
echo "🚀 Starting Typebot containers..."
docker-compose up -d

# Wait for Typebot to be ready
echo ""
echo "⏳ Waiting for Typebot to start (this may take 2-3 minutes)..."
sleep 30

# Check health
MAX_RETRIES=15
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s -f http://localhost:3001 > /dev/null 2>&1; then
        echo "✅ Typebot is running!"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   Waiting... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 10
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "⚠️  Typebot may not be fully ready yet. Check logs with: docker-compose logs -f"
fi

# Print success message
echo ""
echo "======================================================"
echo "🎉 Typebot Deployment Complete!"
echo "======================================================"
echo ""
echo "📍 Access Typebot Builder: $PUBLIC_URL"
echo "📍 Access Typebot Viewer: http://localhost:3002"
echo ""
echo "Next Steps:"
echo "  1. Open $PUBLIC_URL in browser"
echo "  2. Create account (first user becomes admin)"
echo "  3. Create 'Employee Intake 2026' chatbot"
echo "  4. Follow docs/whatsapp_integration.md for form design"
echo "  5. Connect WhatsApp Business API"
echo ""
echo "Useful Commands:"
echo "  docker-compose logs -f     # View logs"
echo "  docker-compose stop        # Stop Typebot"
echo "  docker-compose start       # Start Typebot"
echo "  docker-compose restart     # Restart Typebot"
echo ""
echo "Integration Guide: docs/whatsapp_integration.md"
echo ""
