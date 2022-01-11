// * 对于人脸检测，本项目实现了一个基于 MobileNetV1 的 SSD（Single Shot Multibox Detector）。神经网络将计算图像中每个人脸的位置，并将返回边界框以及每个人脸的概率。该人脸检测器的目标是在检测人脸边界框时获得高精度，而不是低推理时间。量化模型的大小约为 5.4 MB ( ssd_mobilenetv1_model )。

import * as faceapi from 'face-api.js';
const SSD_MOBILENETV1 = 'ssd_mobilenetv1'   // SSD 移动网络检测模型
const TINY_FACE_DETECTOR = 'tiny_face_detector' // 微型人脸检测器模型

let selectedFaceDetector = SSD_MOBILENETV1

export const getCurrentFaceDetectionNet = () => {
  console.log(faceapi);
  if (selectedFaceDetector === SSD_MOBILENETV1) {
    return faceapi.nets.ssdMobilenetv1
  }
  if (selectedFaceDetector === TINY_FACE_DETECTOR) {
    return faceapi.nets.tinyFaceDetector
  }
}

export const isFaceDetectionModelLoaded = () => {
  console.log(getCurrentFaceDetectionNet());
  return !!getCurrentFaceDetectionNet().params
}

// ssd_mobilenetv1 options
const minConfidence = 0.5

// tiny_face_detector options
const inputSize = 512
const scoreThreshold = 0.5

export const getFaceDetectorOptions = () => {
  return selectedFaceDetector === SSD_MOBILENETV1
    ? new faceapi.SsdMobilenetv1Options({ minConfidence })
    : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
}