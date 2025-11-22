// Session management for phone-desktop pairing
export interface SessionData {
  sessionId: string;
  secretToken: string; // Secret token for security
  createdAt: number;
  expiresAt: number;
}

const SESSION_STORAGE_KEY = 'verimezk_session';
const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateSecretToken(): string {
  // Generate a strong random token
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function createSession(): SessionData {
  const now = Date.now();
  const session: SessionData = {
    sessionId: generateSessionId(),
    secretToken: generateSecretToken(),
    createdAt: now,
    expiresAt: now + SESSION_DURATION,
  };

  // Store in sessionStorage for desktop (with secret token)
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  return session;
}

export function getSession(): SessionData | null {
  if (typeof window === 'undefined') return null;

  const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!stored) return null;

  try {
    const session: SessionData = JSON.parse(stored);

    // Check if session expired
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function getSessionUrl(sessionId: string, secretToken: string, localIP?: string): Promise<string> {
  if (typeof window === 'undefined') return '';

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port || '3356';

  // If HTTPS and not localhost, use current host dynamically (for ngrok, etc.) without port
  if (protocol === 'https:' && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    const baseUrl = `${protocol}//${hostname}`;
    return `${baseUrl}/mobile?session=${sessionId}&token=${secretToken}`;
  }

  // Use local IP if provided, otherwise detect it
  // Use HTTPS if the current page is HTTPS, otherwise HTTP
  const useHttps = protocol === 'https:';
  let baseUrl: string;
  if (localIP) {
    baseUrl = `${useHttps ? 'https' : 'http'}://${localIP}:${port}`;
  } else {
    // Try to detect local IP
    const { getLocalBaseUrl } = await import('./network');
    const detectedUrl = getLocalBaseUrl();
    // Replace http with https if needed
    baseUrl = useHttps ? detectedUrl.replace('http://', 'https://') : detectedUrl;
  }

  // Include secret token in URL for security
  return `${baseUrl}/mobile?session=${sessionId}&token=${secretToken}`;
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

