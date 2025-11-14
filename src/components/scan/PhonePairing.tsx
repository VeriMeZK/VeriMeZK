import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Card } from '@/components/shared/Card';
import { createSession, getSessionUrl, getSession, clearSession } from '@/utils/session';
import { getMessagesForSession, clearMessagesForSession, type PhoneMessage } from '@/utils/phoneConnection';
import { getLocalIPAddress } from '@/utils/network';
import type { MRZData } from '@/types';

interface PhonePairingProps {
  onDocumentCaptured: (mrzData: MRZData, imageData: string) => void;
  onFaceCaptured: (faceImageData: string) => void;
  onCancel: () => void;
}

export function PhonePairing({ onDocumentCaptured, onFaceCaptured, onCancel }: PhonePairingProps) {
  const [localIP, setLocalIP] = useState<string | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [currentStep, setCurrentStep] = useState<'pairing' | 'document' | 'face'>('pairing');
  const [isUsingCurrentHost, setIsUsingCurrentHost] = useState(false);
  const [mobileValidation, setMobileValidation] = useState<any>(null);

  useEffect(() => {
    // Create or get existing session
    const session = getSession() || createSession();

    // Check if we should use current host (HTTPS and not localhost) or detect local IP
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const protocol = typeof window !== 'undefined' ? window.location.protocol : '';
    const isHttpsAndNotLocalhost = protocol === 'https:' && hostname !== 'localhost' && hostname !== '127.0.0.1';

    if (isHttpsAndNotLocalhost) {
      // Use current host dynamically (for ngrok, etc.)
      setLocalIP(hostname);
      setIsUsingCurrentHost(true);
      getSessionUrl(session.sessionId, session.secretToken).then(url => {
        setSessionUrl(url);
      });
    } else {
      // Detect local IP address and generate session URL
      setIsUsingCurrentHost(false);
      getLocalIPAddress().then((ip: string) => {
        setLocalIP(ip);
        // Generate session URL with detected local IP and token
        getSessionUrl(session.sessionId, session.secretToken, ip).then(url => {
          setSessionUrl(url);
        });
      });
    }

      // Listen for storage events (for same-origin communication)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'verimezk_phone_messages' && e.newValue) {
          try {
            const messages: any[] = JSON.parse(e.newValue);
            const sessionMessages = messages.filter(
              msg => msg.sessionId === session.sessionId
            );
            
            console.log('[PhonePairing] 📬 Storage event received:', {
              totalMessages: messages.length,
              sessionMessages: sessionMessages.length
            });
            
            for (const message of sessionMessages) {
              if (message.secretToken && message.secretToken !== session.secretToken) {
                console.warn('[PhonePairing] Token mismatch in storage event');
                continue;
              }
              
              if (message.type === 'connected') {
                console.log('[PhonePairing] ✅ Phone connected via storage event!');
                setConnected(true);
                setCurrentStep('document');
                // Process other message types too
              } else if (message.type === 'validation_update' && message.data) {
                setMobileValidation(message.data.validation);
              } else if (message.type === 'document_captured' && message.data) {
                setMobileValidation(null);
                onDocumentCaptured(message.data.mrzData, message.data.imageData);
                setCurrentStep('face');
              } else if (message.type === 'face_captured' && message.data) {
                setMobileValidation(null);
                onFaceCaptured(message.data.faceImageData);
                clearSession();
              }
            }
          } catch (err) {
            console.error('[PhonePairing] Error parsing storage event:', err);
          }
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
    
      // Also listen for BroadcastChannel messages (works across tabs/windows)
      let broadcastChannel: BroadcastChannel | null = null;
      try {
        broadcastChannel = new BroadcastChannel('verimezk_phone_messages');
        broadcastChannel.onmessage = (event) => {
          const message = event.data as PhoneMessage;
          if (message.sessionId === session.sessionId) {
            if (message.secretToken && message.secretToken !== session.secretToken) {
              console.warn('[PhonePairing] Token mismatch in broadcast channel');
              return;
            }
            
            if (message.type === 'connected') {
              console.log('[PhonePairing] ✅ Phone connected via broadcast channel!');
              setConnected(true);
              setCurrentStep('document');
            } else if (message.type === 'validation_update' && message.data) {
              setMobileValidation(message.data.validation);
            } else if (message.type === 'document_captured' && message.data) {
              setMobileValidation(null);
              onDocumentCaptured(message.data.mrzData, message.data.imageData);
              setCurrentStep('face');
            } else if (message.type === 'face_captured' && message.data) {
              setMobileValidation(null);
              onFaceCaptured(message.data.faceImageData);
              clearSession();
            }
          }
        };
      } catch (e) {
        console.log('[PhonePairing] BroadcastChannel not supported, using storage only');
      }
    
    // Poll for messages from phone - more aggressive polling when waiting for connection
    let pollCount = 0;
    const POLL_INTERVAL_CONNECTING = 200; // Fast polling when waiting for connection (200ms)
    const POLL_INTERVAL_CONNECTED = 300; // Normal polling when connected (300ms)
    
    const pollMessages = () => {
      pollCount++;
      if (!session.sessionId || !session.secretToken) {
        if (pollCount % 25 === 0) {
          console.log('[PhonePairing] ⏳ Waiting for session...');
        }
        return;
      }

      // Log polling status periodically
      if (pollCount % 25 === 0) {
        console.log(`[PhonePairing] 🔍 Polling for messages... (attempt ${pollCount})`, {
          sessionId: session.sessionId.substring(0, 10) + '...',
          origin: window.location.origin,
          connected
        });
      }

      const messages = getMessagesForSession(session.sessionId, session.secretToken);
      
      // Debug logging - show all messages received
      if (messages.length > 0) {
        console.log(`[PhonePairing] 📨 Received ${messages.length} message(s):`, messages.map(m => ({
          type: m.type,
          sessionId: m.sessionId.substring(0, 10) + '...',
          hasToken: !!m.secretToken,
          tokenMatch: m.secretToken === session.secretToken,
          timestamp: new Date(m.timestamp).toLocaleTimeString()
        })));
      }
      
      for (const message of messages) {
        // Verify token matches
        if (message.secretToken && message.secretToken !== session.secretToken) {
          console.warn('[PhonePairing] ⚠️ Token mismatch, skipping message:', {
            expected: session.secretToken.substring(0, 10) + '...',
            received: message.secretToken?.substring(0, 10) + '...',
            messageType: message.type
          });
          continue; // Skip messages with invalid token
        }

        if (message.type === 'connected') {
          console.log('[PhonePairing] ✅ Phone connected via polling! Session:', session.sessionId.substring(0, 10) + '...');
          setConnected(true);
          setCurrentStep('document');
          // Don't clear immediately - keep it for a bit to ensure it's processed
          setTimeout(() => {
            clearMessagesForSession(session.sessionId);
          }, 2000);
        } else if (message.type === 'validation_update' && message.data) {
          // Update real-time validation status from mobile
          setMobileValidation(message.data.validation);
        } else if (message.type === 'document_captured' && message.data) {
          console.log('[PhonePairing] 📄 Document captured from phone');
          setMobileValidation(null); // Clear validation display
          onDocumentCaptured(message.data.mrzData, message.data.imageData);
          setCurrentStep('face');
          clearMessagesForSession(session.sessionId);
        } else if (message.type === 'face_captured' && message.data) {
          console.log('[PhonePairing] 👤 Face captured from phone');
          setMobileValidation(null); // Clear validation display
          onFaceCaptured(message.data.faceImageData);
          clearMessagesForSession(session.sessionId);
          clearSession();
        } else if (message.type === 'error') {
          console.error('[PhonePairing] ❌ Phone error:', message.data);
        }
      }
      
      // Also check localStorage directly for debugging every 40 polls
      if (pollCount % 40 === 0 && !connected) {
        try {
          const allMessages = localStorage.getItem('verimezk_phone_messages');
          if (allMessages) {
            const parsed = JSON.parse(allMessages);
            console.log(`[PhonePairing] 📊 All messages in localStorage: ${parsed.length}`);
            const sessionMessages = parsed.filter((m: any) => m.sessionId === session.sessionId);
            console.log(`[PhonePairing] 📊 Messages for current session: ${sessionMessages.length}`);
            if (sessionMessages.length > 0) {
              console.log('[PhonePairing] 📊 Session messages:', sessionMessages.map((m: any) => ({
                type: m.type,
                timestamp: new Date(m.timestamp).toLocaleTimeString(),
                hasToken: !!m.secretToken
              })));
            } else {
              console.warn('[PhonePairing] ⚠️ No messages found for current session.');
              console.warn('[PhonePairing] 🔴 IMPORTANT: localStorage is NOT shared between different origins!');
              console.warn('[PhonePairing] 💡 Solution: Desktop MUST use the same URL/IP as mobile.');
              console.warn('[PhonePairing] 💡 If mobile uses https://10.232.142.234:3356, desktop must also use https://10.232.142.234:3356 (NOT localhost)');
              console.warn('[PhonePairing] 💡 Current desktop origin:', window.location.origin);
            }
          } else {
            console.log('[PhonePairing] 📊 No messages in localStorage yet');
          }
        } catch (e) {
          console.error('[PhonePairing] Error checking localStorage:', e);
        }
      }
    };
    
    // Initial immediate check
    pollMessages();
    
    // Set up polling with dynamic interval - use ref to track current connection status
    let currentConnected = connected;
    const interval = setInterval(() => {
      // Update current connection status from closure
      currentConnected = connected;
      pollMessages();
    }, currentConnected ? POLL_INTERVAL_CONNECTED : POLL_INTERVAL_CONNECTING);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, [onDocumentCaptured, onFaceCaptured, connected]);

  return (
    <Card>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
            Connect Your Phone
          </h2>
          <p className="text-black/70 dark:text-white/70">
            Use your phone's camera for better document and face capture
          </p>
        </div>

          {!connected ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="glass-light rounded-xl p-6 border border-black/10 dark:border-white/10">
                  {sessionUrl && (
                    <QRCodeSVG
                      value={sessionUrl}
                      size={256}
                      level="H"
                      includeMargin={true}
                      className="w-full h-auto"
                    />
                  )}
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-black dark:text-white">
                    Scan this QR code with your phone
                  </p>
                  {isUsingCurrentHost ? (
                    <p className="text-xs text-black/60 dark:text-white/60">
                      Using secure connection: {localIP}
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-black/60 dark:text-white/60">
                        Make sure both devices are on the same network
                      </p>
                      {localIP && (
                        <p className="text-xs text-black/50 dark:text-white/50 font-mono">
                          Network: {localIP}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    <span>Waiting for phone connection...</span>
                  </div>
                  {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && localIP && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 rounded-lg border-2 border-yellow-500/50 shadow-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <path d="M12 9v4M12 17h.01" />
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-yellow-900 dark:text-yellow-100 font-bold mb-2">
                            ⚠️ Connection Required: Use Network IP
                          </p>
                          <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-2">
                            For mobile to connect, you must access this page from the network IP address:
                          </p>
                          <div className="bg-yellow-200 dark:bg-yellow-800 px-3 py-2 rounded-lg mb-2">
                            <code className="font-mono text-sm text-yellow-900 dark:text-yellow-100 break-all">
                              {window.location.protocol}//{localIP}:{window.location.port || '3356'}
                            </code>
                          </div>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            <strong>Why?</strong> localStorage is not shared between different origins (localhost vs network IP).
                            Both devices must use the same URL/IP to communicate.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-black dark:text-white">
                Phone Connected!
              </p>
              <p className="text-sm text-black/70 dark:text-white/70">
                {currentStep === 'document' && 'Position your passport on your phone'}
                {currentStep === 'face' && 'Capture your face on your phone'}
              </p>
            </div>

            {/* Real-time Detection Status from Mobile */}
            {currentStep === 'document' && mobileValidation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-strong rounded-lg p-4 border border-black/10 dark:border-white/10"
              >
                <h3 className="text-sm font-bold text-black dark:text-white mb-3 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" />
                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
                    <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3" />
                    <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3" />
                  </svg>
                  Real-time Detection Status
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(mobileValidation.elements || {}).map(([key, element]: [string, any]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').trim();
                    const isRequired = ['mrz', 'passportNumber', 'documentType', 'country', 'photo'].includes(key);
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-start gap-3 p-2 rounded-lg border-2 transition-all ${
                          element.detected
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500/50'
                            : isRequired
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-500/50'
                            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500/50'
                        }`}
                      >
                        <motion.div
                          className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            element.detected 
                              ? 'bg-green-500' 
                              : isRequired 
                              ? 'bg-red-500' 
                              : 'bg-yellow-500'
                          }`}
                          animate={element.detected ? { scale: [1, 1.1, 1] } : { scale: [1, 0.95, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                        >
                          {element.detected && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-black dark:text-white capitalize">
                              {label}
                            </span>
                            {isRequired && (
                              <span className="text-xs text-red-600 dark:text-red-400 font-bold">*</span>
                            )}
                          </div>
                          {element.detected && element.value && (
                            <div className="text-xs font-mono text-black/80 dark:text-white/80 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded break-all">
                              {element.value}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            {element.detected ? (
                              <>
                                <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                                  ✓ Detected
                                </span>
                                <span className="text-xs text-black/60 dark:text-white/60">
                                  {Math.round((element.confidence || 0) * 100)}%
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-red-600 dark:text-red-400 italic">
                                {isRequired ? 'Detecting...' : 'Optional'}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Progress indicator */}
                <motion.div
                  className="mt-3 p-3 rounded-lg glass-light border border-black/10 dark:border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-black dark:text-white">Detection Progress</span>
                    <span className="text-xs font-bold text-black dark:text-white">
                      {Object.values(mobileValidation.elements || {}).filter((e: any) => e.detected).length} / {Object.keys(mobileValidation.elements || {}).length}
                    </span>
                  </div>
                  <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-600"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(Object.values(mobileValidation.elements || {}).filter((e: any) => e.detected).length / Math.max(Object.keys(mobileValidation.elements || {}).length, 1)) * 100}%`
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  {mobileValidation.isValid && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-semibold"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>All required elements detected!</span>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg glass-light border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 text-black dark:text-white transition-all text-sm font-medium"
          >
            Use Computer Camera
          </button>
        </div>
      </div>
    </Card>
  );
}

