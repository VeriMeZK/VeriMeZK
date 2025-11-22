// Face detection and extraction using face-api.js
import * as faceapi from 'face-api.js';

let modelsLoaded = false;

// Load face-api.js models
export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;
  
  console.log('[loadFaceModels] Loading face-api.js models...');
  
  try {
    // Try loading from CDN first (more reliable)
    const CDN_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(CDN_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(CDN_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(CDN_URL),
    ]);
    
    modelsLoaded = true;
    console.log('[loadFaceModels] Models loaded from CDN successfully');
  } catch (error) {
    console.warn('[loadFaceModels] CDN failed, trying local models...', error);
    
    // Fallback: try loading from local /models directory
    try {
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      modelsLoaded = true;
      console.log('[loadFaceModels] Models loaded from local directory');
    } catch (localError) {
      console.error('[loadFaceModels] Failed to load models from both CDN and local:', localError);
      // Don't throw - allow graceful degradation
      modelsLoaded = false;
    }
  }
}

// Detect face in passport photo region
export async function detectPassportPhoto(imageData: ImageData): Promise<{
  detected: boolean;
  confidence: number;
  faceBox?: { x: number; y: number; width: number; height: number };
}> {
  try {
    await loadFaceModels();
    
    console.log('[detectPassportPhoto] Detecting face...');
    
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { detected: false, confidence: 0 };
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Detect face with tiny face detector (faster)
    const detection = await faceapi
      .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (detection) {
      const box = detection.detection.box;
      console.log('[detectPassportPhoto] Face detected:', box);
      
      return {
        detected: true,
        confidence: detection.detection.score,
        faceBox: {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
        },
      };
    }
    
    return { detected: false, confidence: 0 };
  } catch (error) {
    console.error('[detectPassportPhoto] Error:', error);
    return { detected: false, confidence: 0 };
  }
}

// Extract face descriptor for matching
export async function extractFaceDescriptor(imageData: ImageData): Promise<Float32Array | null> {
  try {
    await loadFaceModels();
    
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.putImageData(imageData, 0, 0);
    
    const detection = await faceapi
      .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (detection && detection.descriptor) {
      return detection.descriptor;
    }
    
    return null;
  } catch (error) {
    console.error('[extractFaceDescriptor] Error:', error);
    return null;
  }
}

// Compare two face descriptors
export function compareFaces(descriptor1: Float32Array, descriptor2: Float32Array): number {
  // Calculate Euclidean distance
  let distance = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    distance += Math.pow(descriptor1[i] - descriptor2[i], 2);
  }
  distance = Math.sqrt(distance);
  
  // Convert distance to similarity score (0-1, higher is more similar)
  // Typical threshold: < 0.6 = same person
  const similarity = 1 / (1 + distance);
  
  return similarity;
}

