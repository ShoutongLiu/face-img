<template>
  <div class="container">
    <div class="upload">
      <a-upload
        name="file"
        action="#"
        :showUploadList="false"
        :before-upload="() => false"
        @change="handleChange"
      >
        <a-button>
          <upload-outlined></upload-outlined>点击上传
        </a-button>
      </a-upload>
      <img :src="imgUrl" id="inputImg" class="priview" alt />
      <div class="face">
        <div id="facesContainer"></div>
      </div>
    </div>

    <div class="download">
      <div class="btn-group">
        <a-button class="down-btn" type="primary" @click="downloadImg">下载图片</a-button>
        <a-button class="down-btn" type="primary" @click="imgChange">换个样式</a-button>
      </div>
      <img :src="mergeUrl" class="mergeImg" alt :width="mergeWidth" :height="mergeHeight" />
    </div>
  </div>
  <!-- <img :src="downloadUrl" alt="" /> -->
  <div class="loading" v-show="isUpload">
    <a-spin tip="人脸识别中... " />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as faceapi from 'face-api.js';
import { UploadOutlined } from '@ant-design/icons-vue';
import {
  isFaceDetectionModelLoaded,
  getCurrentFaceDetectionNet,
  getFaceDetectorOptions,
} from '../utils/faceContoals';
import { message } from 'ant-design-vue';
import { imgs, location } from '../utils/imgsData'

// defineProps<{ msg: string }>()

const imgUrl = ref('');
const mergeUrl = ref('');
const isUpload = ref(false);

onMounted(() => {
  // ! 初始化，加载人脸识别模型
  if (!isFaceDetectionModelLoaded()) {
    getCurrentFaceDetectionNet().load();
  }
});

// * 上传图片
const handleChange = async (file) => {
  console.log(file);
  const imgFile = file.file;
  isUpload.value = true;
  const img = await faceapi.bufferToImage(imgFile);
  imgUrl.value = img.src;
  isUpload.value = false;
  updateResults();
};

// * 获取人脸头像
const updateResults = async () => {
  const isFace = isFaceDetectionModelLoaded();
  console.log(isFace);
  if (!isFace) {
    return;
  }
  const inputImgEl = document.getElementById('inputImg');
  const options = getFaceDetectorOptions();
  const detections = await faceapi.detectAllFaces(inputImgEl, options);
  // * 得到人脸数据（数组）
  const faceImages = await faceapi.extractFaces(inputImgEl, detections);

  if (faceImages.length > 0) {
    displayExtractedFaces(faceImages);
  } else {
    message.warning('识别不到人脸');
    facesContainer.innerHTML = '';
    mergeUrl.value = '';
  }
};

// * 渲染获取的人脸图片
const displayExtractedFaces = (faceImages) => {
  const facesContainer = document.getElementById('facesContainer');
  facesContainer.innerHTML = '';
  faceImages.forEach((canvas) => facesContainer.append(canvas));
  convertCanvasToImage(faceImages[0]);
};

const canvasImg = ref('');
// * canvas转img
const convertCanvasToImage = (canvas) => {
  const image = new Image();
  const url = canvas.toDataURL('image/png');
  image.src = url;
  canvasImg.value = image;
  convertImageToCanvas(imgs.bgImage6, image, location.bgImage6);
};

const downloadUrl = ref('');
const mergeWidth = ref(0);
const mergeHeight = ref(0);

// * img转canvas
const convertImageToCanvas = (bg, image, lac) => {
  // * 创建画布
  const canvas = document.createElement('canvas');

  // * 创建背景图
  const bgImg = new Image();
  bgImg.src = bg;
  bgImg.crossOrigin = 'Anonymous';

  bgImg.onload = () => {
    const width = bgImg.width;
    const height = bgImg.height;
    // * 按照背景图的宽高设置画布宽高
    canvas.width = width;
    canvas.height = height;
    // ! 把图片放入画布中, 先放背景图，再放人脸，防止覆盖
    canvas.getContext('2d').drawImage(bgImg, 0, 0, width, height);
    canvas.getContext('2d').drawImage(image, lac.left, lac.top, lac.width, lac.height);
    console.log(canvas);
    const url = canvas.toDataURL('image/png');
    mergeWidth.value = width;
    mergeHeight.value = height;
    mergeUrl.value = url;
    //* 生成图片url下载
    downloadUrl.value = url;
  };
};

const downloadImg = () => {
  console.log(downloadUrl.value);
  if (!downloadUrl.value) {
    message.warning('没有图片可以下载！');
    return;
  }
  const url = downloadUrl.value; //* 获取图片地址
  const a = document.createElement('a'); //* 创建一个a节点插入的document
  const event = new MouseEvent('click'); //* 模拟鼠标click点击事件
  a.download = 'happy-newyear'; //* 设置a节点的download属性值
  a.href = url; //* 将图片的src赋值给a节点的href
  a.dispatchEvent(event); //* 触发鼠标点击事件
};

const count = ref(1);
const imgChange = () => {
  if (!downloadUrl.value) {
    message.warning('请先上传图片');
    return;
  }
  count.value += 1;
  if (count.value > 8) {
    count.value = 1
  }
  console.log(count.value);
  const imgName = `bgImage${count.value}`;
  convertImageToCanvas(imgs[imgName], canvasImg.value, location[imgName])
};
</script>

<style scoped>
/* 移动端样式 */
@media screen and (max-width: 1024px) {
  .container {
    display: flex;
    flex-direction: column;
  }
  .upload {
    display: flex;
    flex-direction: column;
  }

  .upload .priview {
    margin-top: 20px;
    width: 100%;
  }

  .face {
    margin-top: 20px;
  }

  .download {
    display: flex;
    flex-direction: column;
  }

  .download .down-btn {
    height: 40px;
    margin-top: 20px;
  }

  .btn-group {
    display: flex;
    flex-direction: column;
  }

  .mergeImg {
    width: 100%;
  }

  #facesContainer {
    width: 200px;
  }
  .loading {
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    background: rgba(0, 0, 0, 0.3);
    top: 0;
    left: 0;
  }
}

/* pc端样式 */

@media screen and (min-width: 1024px) {
  .container {
    display: flex;
  }
  .upload {
    display: flex;
    flex-direction: column;
    margin-right: 60px;
  }

  .upload .priview {
    margin-top: 20px;
    width: 400px;
  }

  .face {
    margin-top: 20px;
  }

  .download {
    display: flex;
  }

  .btn-group {
    display: flex;
    flex-direction: column;
  }

  .download .down-btn {
    width: 120px;
    height: 32px;
    margin-left: 30px;
  }

  .download .down-btn:last-child {
    margin-top: 20px;
  }

  .mergeImg {
    margin-left: 30px;
  }

  #facesContainer {
    width: 200px;
  }
  .loading {
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    background: rgba(0, 0, 0, 0.3);
    top: 0;
    left: 0;
  }
}
</style>
