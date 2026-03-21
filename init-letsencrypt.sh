#!/bin/bash
# Obtain Let's Encrypt TLS certificates for your domain.
# Usage: ./init-letsencrypt.sh yourdomain.mooo.com your@email.com

set -e

DOMAIN=${1:?Usage: ./init-letsencrypt.sh <domain> <email>}
EMAIL=${2:?Usage: ./init-letsencrypt.sh <domain> <email>}

echo "→ Requesting certificate for $DOMAIN..."

# Ensure nginx is running (serves ACME challenge)
docker compose up -d nginx

# Request certificate
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

echo "→ Certificate obtained. Now:"
echo "  1. Edit nginx/nginx.conf — uncomment the HTTPS server block"
echo "  2. Replace 'yourdomain.mooo.com' with '$DOMAIN'"
echo "  3. Uncomment the HTTP→HTTPS redirect block"
echo "  4. Run: docker compose restart nginx"
echo ""
echo "→ Auto-renewal is handled by the certbot container."
