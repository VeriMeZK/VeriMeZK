// Network utilities for detecting local IP address
export async function getLocalIPAddress(): Promise<string> {
  return new Promise((resolve) => {
    // First, check if we're already on a local IP (not localhost)
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== '') {
      // Check if it's a local network IP
      if (hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.16.') ||
        hostname.startsWith('172.17.') ||
        hostname.startsWith('172.18.') ||
        hostname.startsWith('172.19.') ||
        hostname.startsWith('172.20.') ||
        hostname.startsWith('172.21.') ||
        hostname.startsWith('172.22.') ||
        hostname.startsWith('172.23.') ||
        hostname.startsWith('172.24.') ||
        hostname.startsWith('172.25.') ||
        hostname.startsWith('172.26.') ||
        hostname.startsWith('172.27.') ||
        hostname.startsWith('172.28.') ||
        hostname.startsWith('172.29.') ||
        hostname.startsWith('172.30.') ||
        hostname.startsWith('172.31.') ||
        hostname.startsWith('169.254.')) {
        resolve(hostname);
        return;
      }
    }

    // Try to get IP from WebRTC
    const RTCPeerConnection = window.RTCPeerConnection ||
      (window as any).webkitRTCPeerConnection ||
      (window as any).mozRTCPeerConnection;

    if (!RTCPeerConnection) {
      // Default fallback to user's specified IP
      resolve('169.254.153.138');
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.createDataChannel('');

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidate = event.candidate.candidate;
        const match = candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
        if (match) {
          const ip = match[0];
          // Filter out localhost and public IPs, keep only local network IPs
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
            pc.close();
            resolve(ip);
            return;
          }
        }
      }
    };

    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .catch(() => {
        // Fallback on error
        const hostname = window.location.hostname;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
          resolve(hostname);
        } else {
          resolve('169.254.153.138');
        }
        pc.close();
      });

    // Timeout after 3 seconds
    setTimeout(() => {
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        resolve(hostname);
      } else {
        resolve('169.254.153.138');
      }
      pc.close();
    }, 3000);
  });
}

export function getLocalBaseUrl(ip?: string): string {
  const port = window.location.port || '3356';
  if (ip) {
    return `http://${ip}:${port}`;
  }
  // Try to get from current location
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:${port}`;
  }
  // Default fallback
  return `http://169.254.153.138:${port}`;
}

