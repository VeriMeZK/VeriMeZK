// Face matching utility using face-api.js
import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;
  
  console.log('[loadFaceModels] Loading face-api.js models...');
  
  try {
    // Try loading from CDN first
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
      throw new Error('Failed to load face recognition models');
    }
  }
}

export interface FaceDescriptor {
  descriptor: Float32Array;
  detection: faceapi.FaceDetection;
}

/**
 * Extract face descriptor from an image
 */
export async function extractFaceDescriptor(imageSrc: string): Promise<FaceDescriptor | null> {
  await loadFaceModels();

  if (!modelsLoaded) {
    throw new Error('Face models not loaded');
  }

  const img = await faceapi.fetchImage(imageSrc);
  
  const detection = await faceapi
    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    return null;
  }

  return {
    descriptor: detection.descriptor,
    detection: detection.detection,
  };
}

/**
 * Compare two face descriptors and return similarity score (0-1)
 * Higher score = more similar
 */
export function compareFaces(
  descriptor1: Float32Array,
  descriptor2: Float32Array
): number {
  // Calculate Euclidean distance between descriptors
  let distance = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    distance += diff * diff;
  }
  distance = Math.sqrt(distance);

  // Convert distance to similarity score (0-1)
  // face-api.js uses threshold of 0.6 for recognition
  // We'll normalize: distance 0 = score 1, distance 1 = score ~0.3
  const similarity = Math.max(0, 1 - distance / 0.6);
  
  return Math.min(1, similarity);
}

/**
 * Match passport photo with user face photo
 * Returns similarity score (0-1) where 1 is identical
 */
export async function matchFaces(
  passportImageSrc: string,
  faceImageSrc: string
): Promise<{ score: number; matched: boolean }> {
  try {
    const passportFace = await extractFaceDescriptor(passportImageSrc);
    if (!passportFace) {
      throw new Error('No face detected in passport photo');
    }

    const userFace = await extractFaceDescriptor(faceImageSrc);
    if (!userFace) {
      throw new Error('No face detected in user photo');
    }

    const score = compareFaces(passportFace.descriptor, userFace.descriptor);
    const matched = score >= 0.7; // 70% threshold

    console.log('[matchFaces] Face match score:', score, 'Matched:', matched);

    return { score, matched };
  } catch (error) {
    console.error('[matchFaces] Error matching faces:', error);
    throw error;
  }
}

