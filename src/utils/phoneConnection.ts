// Phone connection management using polling (simple approach without WebSocket server)
import type { MRZData } from '@/types';

export interface PhoneMessage {
  type: 'document_captured' | 'face_captured' | 'error' | 'connected' | 'validation_update';
  data?: any;
  sessionId: string;
  secretToken?: string; // Include token for verification
  timestamp: number;
}

// Use localStorage as a simple message queue (works if devices are on same network)
// In production, use WebSocket or proper signaling server
const MESSAGE_STORAGE_KEY = 'verimezk_phone_messages';

export function sendMessageToDesktop(message: PhoneMessage): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = localStorage.getItem(MESSAGE_STORAGE_KEY);
    const messages: PhoneMessage[] = existing ? JSON.parse(existing) : [];
    
    // For 'connected' messages, always send (don't check duplicates) to ensure desktop detects it
    const isConnectedMessage = message.type === 'connected';
    
    // Check if message already exists (avoid duplicates) - but allow same type if older than 1 second
    // Exception: always allow 'connected' messages through
    const isDuplicate = !isConnectedMessage && messages.some(
      msg => msg.type === message.type && 
             msg.sessionId === message.sessionId && 
             Math.abs(msg.timestamp - message.timestamp) < 1000
    );
    
    if (!isDuplicate) {
      // For connected messages, remove old ones from same session to avoid clutter
      if (isConnectedMessage) {
        const filtered = messages.filter(
          msg => !(msg.type === 'connected' && msg.sessionId === message.sessionId)
        );
        filtered.push(message);
        messages.length = 0;
        messages.push(...filtered);
      } else {
        messages.push(message);
      }
      
      // Keep only last 50 messages (increased for better reliability)
      const recent = messages.slice(-50);
      localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(recent));
      
      console.log(`[phoneConnection] ✅ Message sent: ${message.type} for session ${message.sessionId.substring(0, 10)}...`, {
        origin: window.location.origin,
        timestamp: new Date(message.timestamp).toLocaleTimeString(),
        isConnectedMessage
      });
      
      // Also trigger a storage event manually for same-origin communication
      try {
        window.dispatchEvent(new StorageEvent('storage', {
          key: MESSAGE_STORAGE_KEY,
          newValue: JSON.stringify(recent),
          storageArea: localStorage,
          oldValue: existing || null,
        }));
      } catch (e) {
        // StorageEvent might fail in some browsers, ignore
      }
      
      // Also try to send via BroadcastChannel if available (works across tabs/windows)
      try {
        const channel = new BroadcastChannel('verimezk_phone_messages');
        channel.postMessage(message);
        channel.close();
      } catch (e) {
        // BroadcastChannel not supported, ignore
      }
    } else {
      // Still log but less frequently
      if (Math.random() < 0.1) { // Log 10% of duplicates
        console.log(`[phoneConnection] Duplicate message skipped: ${message.type}`);
      }
    }
  } catch (error) {
    console.error('[phoneConnection] Failed to send message:', error);
  }
}

export function getMessagesForSession(sessionId: string, secretToken?: string): PhoneMessage[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(MESSAGE_STORAGE_KEY);
    if (!stored) return [];
    
    const messages: PhoneMessage[] = JSON.parse(stored);
    // Filter by sessionId and optionally verify token
    return messages.filter(msg => {
      if (msg.sessionId !== sessionId) return false;
      // If token is provided, verify it matches
      if (secretToken && msg.secretToken && msg.secretToken !== secretToken) {
        return false; // Token mismatch - reject message
      }
      return true;
    });
  } catch {
    return [];
  }
}

export function clearMessagesForSession(sessionId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(MESSAGE_STORAGE_KEY);
    if (!stored) return;
    
    const messages: PhoneMessage[] = JSON.parse(stored);
    const filtered = messages.filter(msg => msg.sessionId !== sessionId);
    localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to clear messages:', error);
  }
}

export function sendDocumentData(sessionId: string, secretToken: string, mrzData: MRZData, imageData: string): void {
  sendMessageToDesktop({
    type: 'document_captured',
    data: { mrzData, imageData },
    sessionId,
    secretToken,
    timestamp: Date.now(),
  });
}

export function sendFaceData(sessionId: string, secretToken: string, faceImageData: string): void {
  sendMessageToDesktop({
    type: 'face_captured',
    data: { faceImageData },
    sessionId,
    secretToken,
    timestamp: Date.now(),
  });
}

export function sendValidationUpdate(sessionId: string, secretToken: string, validation: any): void {
  sendMessageToDesktop({
    type: 'validation_update',
    data: { validation },
    sessionId,
    secretToken,
    timestamp: Date.now(),
  });
}

