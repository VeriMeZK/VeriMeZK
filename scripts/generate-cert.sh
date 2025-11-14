#!/bin/bash
# Script to generate SSL certificates for local HTTPS development

set -e

CERT_DIR="./certs"
mkdir -p "$CERT_DIR"

echo "🔐 Generating SSL certificates for local HTTPS..."

# Check if mkcert is installed
if command -v mkcert &> /dev/null; then
    echo "✅ mkcert found - generating trusted certificates..."
    
    # Install local CA if not already installed
    mkcert -install 2>/dev/null || true
    
    # Get local IP addresses
    LOCAL_IP_EN0=$(ipconfig getifaddr en0 2>/dev/null || echo "")
    LOCAL_IP_EN1=$(ipconfig getifaddr en1 2>/dev/null || echo "")
    
    # Build list of IPs to include
    CERT_HOSTS="localhost 127.0.0.1 ::1 $(hostname)"
    
    if [ -n "$LOCAL_IP_EN0" ]; then
        CERT_HOSTS="$CERT_HOSTS $LOCAL_IP_EN0"
        echo "   Adding IP: $LOCAL_IP_EN0"
    fi
    
    if [ -n "$LOCAL_IP_EN1" ] && [ "$LOCAL_IP_EN1" != "$LOCAL_IP_EN0" ]; then
        CERT_HOSTS="$CERT_HOSTS $LOCAL_IP_EN1"
        echo "   Adding IP: $LOCAL_IP_EN1"
    fi
    
    # Generate certificate for localhost and local network IPs
    echo "   Generating certificate for: $CERT_HOSTS"
    mkcert -key-file "$CERT_DIR/key.pem" -cert-file "$CERT_DIR/cert.pem" $CERT_HOSTS
    
    echo "✅ Certificates generated successfully!"
    echo "📁 Certificates saved to: $CERT_DIR/"
    echo ""
    echo "To use HTTPS, run: npm run dev:https"
else
    echo "⚠️  mkcert not found. Using OpenSSL to generate self-signed certificates..."
    echo "💡 For trusted certificates (no browser warnings), install mkcert:"
    echo "   macOS: brew install mkcert"
    echo "   Linux: See https://github.com/FiloSottile/mkcert#installation"
    echo ""
    
    # Get local IP addresses for OpenSSL
    LOCAL_IP_EN0=$(ipconfig getifaddr en0 2>/dev/null || echo "")
    LOCAL_IP_EN1=$(ipconfig getifaddr en1 2>/dev/null || echo "")
    
    # Create OpenSSL config with Subject Alternative Names (SAN)
    OPENSSL_CONFIG=$(mktemp)
    cat > "$OPENSSL_CONFIG" <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C=US
ST=State
L=City
O=Organization
CN=localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
IP.2 = ::1
EOF
    
    # Add local IPs to SAN
    IP_COUNTER=3
    if [ -n "$LOCAL_IP_EN0" ]; then
        echo "IP.$IP_COUNTER = $LOCAL_IP_EN0" >> "$OPENSSL_CONFIG"
        IP_COUNTER=$((IP_COUNTER + 1))
        echo "   Adding IP: $LOCAL_IP_EN0"
    fi
    
    if [ -n "$LOCAL_IP_EN1" ] && [ "$LOCAL_IP_EN1" != "$LOCAL_IP_EN0" ]; then
        echo "IP.$IP_COUNTER = $LOCAL_IP_EN1" >> "$OPENSSL_CONFIG"
        echo "   Adding IP: $LOCAL_IP_EN1"
    fi
    
    # Generate self-signed certificate with SAN
    openssl req -x509 -newkey rsa:4096 -keyout "$CERT_DIR/key.pem" \
        -out "$CERT_DIR/cert.pem" -days 365 -nodes \
        -config "$OPENSSL_CONFIG" -extensions v3_req
    
    rm "$OPENSSL_CONFIG"
    
    echo "✅ Self-signed certificates generated!"
    echo "⚠️  Note: You'll need to accept the security warning in your browser"
fi

