require('@tensorflow/tfjs-node');
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;
const faceapi = require('@vladmandic/face-api');
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
faceapi.nets.ssdMobilenetv1.loadFromDisk('models');

// detect if an image contain face by its url
async function isContainFace(url) {
  const img = await canvas.loadImage(url);
  const detections = await faceapi.detectAllFaces(img);
  return detections.length > 0 ? true : false;
}

module.exports = isContainFace;
