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
          <upload-outlined></upload-outlined>
          点击上传
        </a-button>
      </a-upload>
      <img :src="imgUrl" id="inputImg" class="priview" alt="" />
      <div class="face">
        <div id="facesContainer"></div>
      </div>
    </div>

    <div class="download">
      <div id="mergeImg"></div>
      <a-button class="down-btn" type="primary" @click="downloadImg">下载图片</a-button>
    </div>
  </div>
  <!-- <img :src="downloadUrl" alt="" /> -->
  <div class="loading" v-show="isUpload">
    <a-spin tip="人脸识别中... " />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as faceapi from "face-api.js";
import { UploadOutlined } from "@ant-design/icons-vue";
import {
  isFaceDetectionModelLoaded,
  getCurrentFaceDetectionNet,
  getFaceDetectorOptions,
} from "../utils/faceContoals";
import { message } from "ant-design-vue";

const bgImage1 = "http://129.28.191.47/face/fight.png";
// const bgImage2 = "http://129.28.191.47/face/hongbao1.png";
const bgImage2 = "http://localhost:3000/face/hongbao1.png";
const bgImage3 = "http://129.28.191.47/face/hongbao2.png";
// defineProps<{ msg: string }>()

const imgUrl = ref("");
const isUpload = ref(false);

onMounted(() => {
  // ! 初始化，加载人脸模型
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
  const inputImgEl = document.getElementById("inputImg");
  console.log(inputImgEl, "inputImgEl");
  const options = getFaceDetectorOptions();

  const detections = await faceapi.detectAllFaces(inputImgEl, options);
  const faceImages = await faceapi.extractFaces(inputImgEl, detections);
  console.log(faceImages, "faceImages");
  if (faceImages.length > 0) {
    displayExtractedFaces(faceImages);
  } else {
    message.warning("识别不到人脸");
  }
};

// * 渲染获取的人脸图片
const displayExtractedFaces = (faceImages) => {
  const facesContainer = document.getElementById("facesContainer");
  facesContainer.innerHTML = "";
  faceImages.forEach((canvas) => facesContainer.append(canvas));
  convertCanvasToImage(faceImages[0]);
};

// * canvas转img
const convertCanvasToImage = (canvas) => {
  const image = new Image();
  image.src = canvas.toDataURL("image/png");
  convertImageToCanvas(image);
};

const downloadUrl = ref("");

// * img转canvas
const convertImageToCanvas = (image) => {
  // ! 创建画布
  const canvas = document.createElement("canvas");

  // ! 创建背景图
  const bgImg = new Image();
  bgImg.src = bgImage2;
  bgImg.crossOrigin = "Anonymous";

  bgImg.onload = () => {
    const width = bgImg.width;
    const height = bgImg.height;
    // ! 按照背景图的宽高设置画布宽高
    canvas.width = width;
    canvas.height = height;
    // ! 把图片放入画布中
    canvas.getContext("2d").drawImage(bgImg, 0, 0, width, height);
    canvas.getContext("2d").drawImage(image, 180, 80, 200, 200);
    console.log(canvas);
    const merge = document.getElementById("mergeImg");
    merge.innerHTML = "";
    merge.append(canvas);
    //! 生成图片url下载
    downloadUrl.value = canvas.toDataURL("image/gif");
  };
};

const downloadImg = () => {
  const url = downloadUrl.value; // 获取图片地址
  const a = document.createElement("a"); // 创建一个a节点插入的document
  const event = new MouseEvent("click"); // 模拟鼠标click点击事件
  a.download = "happy"; // 设置a节点的download属性值
  a.href = url; // 将图片的src赋值给a节点的href
  a.dispatchEvent(event); // 触发鼠标点击事件
};
</script>

<style scoped>
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

  .download .down-btn {
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
