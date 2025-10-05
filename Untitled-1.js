
// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
import '@tensorflow/tfjs-node';

// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
import * as canvas from 'canvas';

import * as faceapi from 'face-api.js';

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement, additionally an implementation
// of ImageData is required, in case you want to use the MTCNN
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

// face-matcher-distance.js
// Public API:
//   await loadModels('/models')
//   await setAnchorReferences([{ label: 'anchor', inputs: [img1, img2, ...] }])
//   const d = await addNameDistance('Alice', probeImg)
//   faceDistanceMap  // Map<string, number>

export const faceDistanceMap = new Map();

let modelsLoaded = false;
let matcher = null;

/** Load required nets */
export async function loadModels(modelsBaseUrl = '/models') {
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(modelsBaseUrl),
    faceapi.nets.faceLandmark68Net.loadFromUri(modelsBaseUrl),
    faceapi.nets.faceRecognitionNet.loadFromUri(modelsBaseUrl),
  ]);
  modelsLoaded = true;
}

/** Detect one face and return its 128-D descriptor */
async function computeDescriptor(input) {
  if (!modelsLoaded) throw new Error('Models not loaded. Call loadModels() first.');
  const det = await faceapi
    .detectSingleFace(input)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!det) throw new Error('No face detected in input.');
  return det.descriptor; // Float32Array(128)
}

/**
 * Build a FaceMatcher from labeled reference images.
 * Example arg: [{ label: 'anchor', inputs: [img1, img2] }]
 * You can add multiple labels if you want (e.g., different anchors).
 */
export async function setAnchorReferences(labelGroups, maxDescriptorDistance = 0.6) {
  const labeled = [];
  for (const { label, inputs } of labelGroups) {
    const descs = [];
    for (const input of inputs) {
      const d = await computeDescriptor(input);
      descs.push(d);
    }
    labeled.push(new faceapi.LabeledFaceDescriptors(label, descs));
  }
  matcher = new faceapi.FaceMatcher(labeled, maxDescriptorDistance);
  return matcher;
}

/**
 * Take (name, image), reduce the image via FaceMatcher to a Euclidean distance
 * from the closest anchor label, and store { name → distance }.
 */
export async function addNameDistance(name, image) {
  if (!matcher) throw new Error('No FaceMatcher set. Call setAnchorReferences() first.');
  const probe = await computeDescriptor(image);
  const best = matcher.findBestMatch(probe); // { label, distance }
  faceDistanceMap.set(name, best.distance);
  return best.distance;
}

// --- Example wiring (uncomment to integrate with your UI) ---
// (async () => {
//   await loadModels('/models');
//   await setAnchorReferences([{ label: 'anchor', inputs: [document.getElementById('anchorImg')] }]);
//   const name = document.getElementById('nameInput').value;
//   const probeImg = document.getElementById('probeImg');
//   const dist = await addNameDistance(name, probeImg);
//   console.log(`Stored: ${name} → ${dist}`);
// })();