// Advanced image preprocessing using OpenCV.js
// OpenCV will be loaded dynamically

export interface PreprocessedImage {
  mrzRegion: ImageData;
  photoRegion: ImageData;
  enhanced: ImageData;
}

let cvReady = false;

// Initialize OpenCV
export async function initOpenCV(): Promise<void> {
  if (cvReady) return;
  
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).cv) {
      cvReady = true;
      resolve();
      return;
    }
    
    // Load OpenCV.js dynamically
    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.x/opencv.js';
    script.onload = () => {
      cvReady = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load OpenCV.js'));
    document.head.appendChild(script);
  });
}

// Preprocess passport image with OpenCV
export async function preprocessPassportImage(imageData: ImageData): Promise<PreprocessedImage> {
  await initOpenCV();
  
  const cv = (window as any).cv;
  if (!cv) {
    throw new Error('OpenCV not loaded');
  }
  
  console.log('[preprocessPassportImage] Starting OpenCV preprocessing...');
  
  // Convert ImageData to canvas first (OpenCV needs canvas or img element, not ImageData directly)
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  ctx.putImageData(imageData, 0, 0);
  
  // OpenCV needs the canvas to be in the DOM (temporarily) or use cv.imread with canvas element
  // Add canvas to DOM temporarily (hidden) for OpenCV compatibility
  canvas.style.display = 'none';
  canvas.id = 'opencv-temp-canvas-' + Date.now();
  document.body.appendChild(canvas);
  
  try {
    // Convert canvas to OpenCV Mat using canvas element directly
    const src = cv.imread(canvas);
  
    // Convert to grayscale
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  
    // Apply Gaussian blur to reduce noise
    const blurred = new cv.Mat();
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
  
    // Apply adaptive thresholding for better contrast
    const thresholded = new cv.Mat();
    cv.adaptiveThreshold(
      blurred,
      thresholded,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY,
      11,
      2
    );
  
    // Extract MRZ region (bottom 30% of image)
    const mrzHeight = Math.floor(imageData.height * 0.3);
    const mrzY = imageData.height - mrzHeight;
    const mrzROI = new cv.Rect(0, mrzY, imageData.width, mrzHeight);
    const mrzRegion = thresholded.roi(mrzROI);
  
    // Extract photo region (top 40% of image)
    const photoHeight = Math.floor(imageData.height * 0.4);
    const photoROI = new cv.Rect(0, 0, imageData.width, photoHeight);
    const photoRegion = gray.roi(photoROI);
  
    // Convert back to ImageData
    const mrzCanvas = document.createElement('canvas');
    mrzCanvas.width = mrzRegion.cols;
    mrzCanvas.height = mrzRegion.rows;
    cv.imshow(mrzCanvas, mrzRegion);
    const mrzImageData = mrzCanvas.getContext('2d')!.getImageData(0, 0, mrzCanvas.width, mrzCanvas.height);
  
    const photoCanvas = document.createElement('canvas');
    photoCanvas.width = photoRegion.cols;
    photoCanvas.height = photoRegion.rows;
    cv.imshow(photoCanvas, photoRegion);
    const photoImageData = photoCanvas.getContext('2d')!.getImageData(0, 0, photoCanvas.width, photoCanvas.height);
  
    const enhancedCanvas = document.createElement('canvas');
    enhancedCanvas.width = thresholded.cols;
    enhancedCanvas.height = thresholded.rows;
    cv.imshow(enhancedCanvas, thresholded);
    const enhancedImageData = enhancedCanvas.getContext('2d')!.getImageData(0, 0, enhancedCanvas.width, enhancedCanvas.height);
  
    // Cleanup OpenCV Mat objects
    src.delete();
    gray.delete();
    blurred.delete();
    thresholded.delete();
    mrzRegion.delete();
    photoRegion.delete();
  
    // Remove canvas from DOM after processing
    try {
      const canvasElement = document.getElementById(canvas.id);
      if (canvasElement) {
        document.body.removeChild(canvasElement);
      }
    } catch (e) {
      // Ignore if already removed
    }
  
    console.log('[preprocessPassportImage] Preprocessing completed');
  
    return {
      mrzRegion: mrzImageData,
      photoRegion: photoImageData,
      enhanced: enhancedImageData,
    };
  } catch (error) {
    // Remove canvas from DOM on error
    try {
      const canvasElement = document.getElementById(canvas.id);
      if (canvasElement) {
        document.body.removeChild(canvasElement);
      }
    } catch (e) {
      // Ignore if already removed
    }
    
    console.error('[preprocessPassportImage] OpenCV preprocessing failed:', error);
    throw error;
  }
}

// Detect document edges and correct perspective
export async function detectDocumentEdges(imageData: ImageData): Promise<{ detected: boolean; corners?: any[] }> {
  await initOpenCV();
  
  const cv = (window as any).cv;
  if (!cv) {
    return { detected: false };
  }
  
  const src = cv.imread(imageData);
  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  
  // Apply Canny edge detection
  const edges = new cv.Mat();
  cv.Canny(gray, edges, 50, 150);
  
  // Find contours
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
  
  // Find largest rectangular contour (likely the document)
  let maxArea = 0;
  let maxContour: cv.Mat | null = null;
  
  for (let i = 0; i < contours.size(); i++) {
    const contour = contours.get(i);
    const area = cv.contourArea(contour);
    if (area > maxArea && area > imageData.width * imageData.height * 0.3) {
      maxArea = area;
      maxContour = contour;
    }
  }
  
  if (maxContour) {
    // Approximate contour to polygon
    const epsilon = 0.02 * cv.arcLength(maxContour, true);
    const approx = new cv.Mat();
    cv.approxPolyDP(maxContour, approx, epsilon, true);
    
    if (approx.rows === 4) {
      // Found rectangular document
      const corners: any[] = [];
      for (let i = 0; i < 4; i++) {
        corners.push({ x: approx.data32S[i * 2], y: approx.data32S[i * 2 + 1] });
      }
      
      src.delete();
      gray.delete();
      edges.delete();
      contours.delete();
      hierarchy.delete();
      maxContour.delete();
      approx.delete();
      
      return { detected: true, corners };
    }
    
    approx.delete();
  }
  
  src.delete();
  gray.delete();
  edges.delete();
  contours.delete();
  hierarchy.delete();
  
  return { detected: false };
}

