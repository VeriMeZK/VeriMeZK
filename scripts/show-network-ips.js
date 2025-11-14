#!/usr/bin/env node
// Script to display all network IPs before Vite starts
import { networkInterfaces } from 'os';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const certPath = resolve(__dirname, '../certs/cert.pem');
const keyPath = resolve(__dirname, '../certs/key.pem');
const isHttps = existsSync(certPath) && existsSync(keyPath);
const protocol = isHttps ? 'https' : 'http';

const nets = networkInterfaces();
const ips = [];

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
    // But include link-local even if marked as internal
    if (net.family === 'IPv4') {
      const ip = net.address;
      // Skip only 127.0.0.1, but include other IPs even if internal (for link-local)
      if (ip === '127.0.0.1') continue;
      
      // Include ALL local network IPs (including link-local)
      if (ip.startsWith('192.168.') || 
          ip.startsWith('10.') || 
          ip.startsWith('172.16.') || 
          ip.startsWith('172.17.') ||
          ip.startsWith('172.18.') ||
          ip.startsWith('172.19.') ||
          ip.startsWith('172.20.') ||
          ip.startsWith('172.21.') ||
          ip.startsWith('172.22.') ||
          ip.startsWith('172.23.') ||
          ip.startsWith('172.24.') ||
          ip.startsWith('172.25.') ||
          ip.startsWith('172.26.') ||
          ip.startsWith('172.27.') ||
          ip.startsWith('172.28.') ||
          ip.startsWith('172.29.') ||
          ip.startsWith('172.30.') ||
          ip.startsWith('172.31.') ||
          ip.startsWith('169.254.')) {
        ips.push({ ip, interface: name });
      }
    }
  }
}

// Remove duplicates
const uniqueIPs = [...new Map(ips.map(item => [item.ip, item])).values()];

if (uniqueIPs.length > 0) {
  console.log('\n🌐 Available Network IPs:');
  uniqueIPs.forEach(({ ip, interface: iface }) => {
    const ipType = ip.startsWith('169.254.') ? 'Link-local' : 'Network';
    console.log(`   ➜  ${ipType} (${iface}): ${protocol}://${ip}:3356/`);
  });
  console.log('');
}

