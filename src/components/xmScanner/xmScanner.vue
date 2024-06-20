<template>
	<div class="canvasBox">
		<div class="smask" v-if="showMask">
			<p>Initializing camera, please wait...</p>
		</div>
		<template v-if="isUse">
			<div class="box">
				<div class="line"></div>
				<div class="angle"></div>
			</div>
			<div class="mask1 mask" :style="'height:' + maskHeight + 'px;'"></div>
			<div class="mask2 mask"
				:style="'width:' + maskWidth + 'px;top:' + maskHeight + 'px;height:' + canvasHeight + 'px'"></div>
			<div class="mask3 mask" :style="'height:' + maskHeight + 'px;'"></div>
			<div class="mask4 mask"
				:style="'width:' + maskWidth + 'px;top:' + maskHeight + 'px;height:' + canvasHeight + 'px'"></div>
			<!-- <button @click="cutImage" style="position:fixed;top:0;left:0;z-index: 999999;">截取</button>
			<button @click="hideImage" style="position:fixed;top:0;left:50px;z-index: 999999;">隐藏</button>
			<div style="position: fixed;bottom: 30px;z-index: 999999;width: 50%;word-wrap: break-word;background:white;">{{
				zoom + "---" + location }}</div>
			<img :src="cImage" style="width: 50%;z-index: 999999;position:fixed;top:30px;left:0;" alt=""> -->
			<div class="tips">{{ showTips }}</div>
		</template>
		<template v-else>
			<slot name="error">
				<div class="error">
					<div class="on1">Camera permission denied, please try the following steps:</div>
					<div>· Refresh the page and try again;</div>
					<div>· Check if the camera permission for the current App or browser is disabled in the system settings;
					</div>
				</div>
			</slot>
		</template>
	</div>
</template>

<script>
//import jsQR from "jsqr";
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/library';

export default {
	name: 'xmScanner',
	props: {
		continue: {
			type: Boolean,
			default: true // false 监听一次   true 持续监听
		},
		exact: {
			type: String,
			default: 'environment' // environment 后摄像头  user 前摄像头
		},
		size: {
			type: String,
			default: 'whole' // whole 全屏  balf 半屏
		},
		pausedScan: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			windowWidth: 0,
			windowHeight: 0,
			video: null,
			canvas2d: null,
			canvas2d2: null,
			canvasWidth: 250,
			canvasHeight: 250,
			maskWidth: 0,
			maskHeight: 0,
			inter: 0,

			track: null,
			isUseTorch: false,
			trackStatus: false,

			isParse: false,
			isUse: true,
			showMask: true,
			cImage: '',
			location: "",
			zoom: 0,
			scaleFactor: 1,
			showTips: 'Scanning...'
		}
	},
	watch: {
		pausedScan(val) {
			console.log(val)
			if (val) {
				this.video.pause();
				this.showTips='Scanning successful, processing...'
			} else {
				this.video.play()
				this.showTips='Scanning...'
				this.tick()
			}
		}
	},
	mounted() {
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
		this.scaleFactor = isIOS ? 3 : 1;  // iOS 设备使用3倍放大，其他设备使用1倍

		if (origin.indexOf('https') === -1) throw 'Please use the camera component in an HTTPS environment.'

		this.showMask = true;
		this.windowWidth = document.documentElement.clientWidth || document.body.clientWidth

		this.windowHeight = document.documentElement.clientHeight || document.body.clientHeight
		this.windowHeight = this.size === 'whole' ? this.windowHeight : this.windowHeight / 2

		this.isParse = true

		this.$nextTick(() => {
			this.createMsk()
			this.openScan()
		})
	},
	destroyed() {
		this.closeCamera()
	},
	methods: {
		openScan() {
			const videoParam = {
				audio: false,
				video: {
					facingMode: {
						exact: this.exact
					},
					width: 2000 * (this.windowHeight / this.windowWidth),  // 在手机上需要将宽高颠倒。否则会出现画面旋转的问题
					height: 2000
				}
			}
			navigator.mediaDevices
				.getUserMedia(videoParam)
				.then(stream => {
					this.video = document.createElement('video')
					this.video.width = this.windowWidth
					this.video.height = this.windowHeight
					this.video.style.position = 'fixed';
					this.video.style.top = '50%';
					this.video.style.left = '50%';
					//this.video.style.border = '5px solid red';
					this.video.style.transform = `translate(-50%, -50%) scale(${this.scaleFactor})`;
					this.video.style.transformOrigin = 'center center';
					this.video.style.objectFit = 'contain';

					const canvas = document.createElement('canvas')
					canvas.id = 'canvas'
					canvas.width = this.canvasWidth
					canvas.height = this.canvasHeight
					canvas.style = 'display:none;'
					//canvas.style = 'position: fixed;top: 0;z-index: 999;left:0'
					this.canvas2d = canvas.getContext('2d')

					// 设置当前宽高 满屏
					const canvasBox = document.querySelector('.canvasBox')
					canvasBox.append(this.video)
					canvasBox.append(canvas)
					canvasBox.style = `width:${this.windowWidth}px;height:${this.windowHeight}px;`

					// 创建第二个canvas
					const canvas2 = document.createElement('canvas')
					canvas2.id = 'canvas2'
					canvas2.width = this.canvasWidth
					canvas2.height = this.canvasHeight
					canvas2.style =
						'position: absolute;top: 50%;left: 50%;z-index: 20;transform: translate(-50%, -50%);'
					this.canvas2d2 = canvas2.getContext('2d')
					canvasBox.append(canvas2)

					this.video.srcObject = stream
					this.video.setAttribute('playsinline', true)
					this.video.play();
					this.tick()

					this.track = stream.getVideoTracks()[0]
					this.showMask = false
					setTimeout(() => {
						this.isUseTorch = this.track.getCapabilities().torch || null

					}, 500)
				})
				.catch(err => {
					this.isUse = false
					this.$emit('error', err)
				})
		},

		closeCamera() {
			this.isParse = false
			if (this.video && this.video.srcObject) {
				this.video.srcObject.getTracks().forEach(track => {
					track.stop()
				})
			}
		},

		// tick() {
		// 	if (!this.isParse) return
		// 	if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
		// 		this.canvas2d.drawImage(
		// 			this.video,
		// 			this.transtion(this.maskWidth),
		// 			this.transtion(this.maskHeight),
		// 			this.transtion(300),
		// 			this.transtion(500),
		// 			0,
		// 			0,
		// 			this.transtion(this.canvasWidth),
		// 			this.transtion(this.canvasHeight)
		// 		)

		// 		const imageData = this.canvas2d.getImageData(
		// 			0,
		// 			0,
		// 			this.transtion(this.canvasWidth),
		// 			this.transtion(this.canvasHeight)
		// 		)
		// 		const code = jsQR(imageData.data, imageData.width, imageData.height, {
		// 			inversionAttempts: 'dontInvert'
		// 		})
		// 		this.canvas2d2.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
		// 		if (code) {
		// 			this.drawLine(code.location.topLeftCorner, code.location.topRightCorner)
		// 			this.drawLine(code.location.topRightCorner, code.location.bottomRightCorner)
		// 			this.drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner)
		// 			this.drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner)
		// 			if (code.data) {

		// 				this.getData({
		// 					barcode: code.data,
		// 					image: this.canvas2d.canvas.toDataURL('image/jpeg', 0.9)
		// 				})

		// 			}
		// 		}
		// 	}
		// 	requestAnimationFrame(this.tick)
		// },
		tick() {
			if (!this.isParse) return;
			if (this.pausedScan) return;
			if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
				// 确保canvas的尺寸与视频流相匹配
				this.canvas2d.canvas.width = this.canvasWidth;
				this.canvas2d.canvas.height = this.canvasHeight;

				// 计算放大后视频实际占据的总尺寸，因为视频在手机上是横屏的，所以宽高需要颠倒
				//alert(this.video.videoWidth + '---' + this.video.videoHeight + '---' + this.scaleFactor)
				const actualVideoWidth = this.video.videoHeight;
				const actualVideoHeight = this.video.videoWidth;
				//因为放大了，所以截取的尺寸相对于视频来说更小，所以这里要除以放大的倍率
				const canvasScaleWidth = this.canvasWidth * (actualVideoHeight / this.windowWidth) / this.scaleFactor;
				const canvasScaleHeight = this.canvasHeight * (actualVideoHeight / this.windowWidth) / this.scaleFactor;
				//alert(canvasScaleWidth+"---"+canvasScaleHeight+"---"+(1000/this.windowWidth)+"---"+this.canvasHeight+"---"+this.video.videoWidth+"---"+this.video.videoHeight+"---"+actualVideoWidth+"---"+actualVideoHeight)
				// 计算从视频中截取的起始位置，使其居中
				const sourceX = (actualVideoHeight - canvasScaleWidth) / 2;
				const sourceY = (actualVideoWidth - canvasScaleHeight) / 2;
				//alert(sourceX+"---"+sourceY+"---"+canvasScaleWidth+"---"+canvasScaleHeight+"---"+this.canvasWidth+"---"+this.canvasHeight)
				// 渲染视频到canvas
				this.canvas2d.drawImage(
					this.video,
					sourceX, sourceY, canvasScaleWidth, canvasScaleHeight, // 从视频的指定区域中截取
					0, 0, this.canvasWidth, this.canvasHeight // 渲染到canvas的全尺寸
				);
				//alert(sourceX+"---"+sourceY+"---"+this.video.videoWidth+"---"+this.video.videoHeight+"---"+this.canvasWidth+"---"+this.canvasHeight)
				// 从canvas获取图像数据
				// const imageData = this.canvas2d.getImageData(
				// 	0, 0, this.canvasWidth, this.canvasHeight
				// );

				// 使用 ZXing 来解码图像
				const codeReader = new BrowserMultiFormatReader(null, [BarcodeFormat.QR_CODE, BarcodeFormat.PDF_417]);
				//this.canvas2d2.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
				const capturedImage = this.canvas2d.canvas.toDataURL('image/jpeg', 0.6);
				//创建一个img对象，用于存放解码后的图像数据
				const img = new Image();
				img.src = capturedImage;

				img.onload = async () => {
					try {
						this.canvas2d2.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
						const result = await codeReader.decodeFromImage(img);
						if (result) {
							//console.log(result);
							this.drawResult(result);
						}
					} catch (error) {
						//console.log(1)
					}
				};

				// 使用jsQR识别二维码
				// const code = jsQR(imageData.data, imageData.width, imageData.height);
				// this.canvas2d2.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
				// // 如果识别到二维码，处理二维码数据
				// if (code) {
				// 	this.drawLine(
				// 		{ x: code.location.topLeftCorner.x, y: code.location.topLeftCorner.y },
				// 		{ x: code.location.topRightCorner.x, y: code.location.topRightCorner.y },
				// 		'#FF3B58'
				// 	);
				// 	this.drawLine(
				// 		{ x: code.location.topRightCorner.x, y: code.location.topRightCorner.y },
				// 		{ x: code.location.bottomRightCorner.x, y: code.location.bottomRightCorner.y },
				// 		'#FF3B58'
				// 	);
				// 	this.drawLine(
				// 		{ x: code.location.bottomRightCorner.x, y: code.location.bottomRightCorner.y },
				// 		{ x: code.location.bottomLeftCorner.x, y: code.location.bottomLeftCorner.y },
				// 		'#FF3B58'
				// 	);
				// 	this.drawLine(
				// 		{ x: code.location.bottomLeftCorner.x, y: code.location.bottomLeftCorner.y },
				// 		{ x: code.location.topLeftCorner.x, y: code.location.topLeftCorner.y },
				// 		'#FF3B58'
				// 	);
				// 	// 截取并处理当前帧
				// 	const capturedImage = this.canvas2d.canvas.toDataURL('image/jpeg', 0.6);
				// 	this.getData({
				// 		barcode: code.data,
				// 		image: capturedImage
				// 	});

				// 	if (!this.continue) {
				// 		this.closeCamera();
				// 	}
				// }
			}
			requestAnimationFrame(this.tick);
		},
		cutImage() {
			this.cImage = this.canvas2d.canvas.toDataURL('image/jpeg', 0.9);
		},
		hideImage() {
			this.cImage = ''
		},
		drawResult(result) {
			const corners = result.resultPoints;
			if (corners && corners.length > 0) {

				// if (corners.length === 4) {
				// 	// 如果是二维码，绘制四个角
				// 	this.drawLine(corners[0], corners[1], '#FF3B58');
				// 	this.drawLine(corners[1], corners[2], '#FF3B58');
				// 	this.drawLine(corners[2], corners[3], '#FF3B58');
				// 	this.drawLine(corners[3], corners[0], '#FF3B58');
				// } else {
				// 	// 如果是PDF417码，绘制所有相邻点
				// 	for (let i = 0; i < corners.length; i++) {
				// 		const startPoint = corners[i];
				// 		const endPoint = corners[(i + 1) % corners.length];
				// 		this.drawLine(startPoint, endPoint, '#FF3B58');
				// 	}
				// }

				const capturedImage = this.canvas2d.canvas.toDataURL('image/jpeg', 0.6);
				this.getData({
					barcode: result.text,
					image: capturedImage
				});

				if (!this.continue) {
					this.closeCamera();
				}
			}
		},

		drawLine(begin, end, color = '#FF3B58') {
			this.canvas2d2.beginPath();
			this.canvas2d2.moveTo(begin.x, begin.y);
			this.canvas2d2.lineTo(end.x, end.y);
			this.canvas2d2.lineWidth = 4;
			this.canvas2d2.strokeStyle = color;
			this.canvas2d2.stroke();
		},

		getData(data) {
			this.$emit('success', data)
			if (!this.continue) {
				this.closeCamera()
			}
		},

		openTrack() {
			this.trackStatus = !this.trackStatus
			this.track.applyConstraints({
				advanced: [{
					torch: this.trackStatus
				}]
			})
		},

		createMsk() {
			this.maskWidth = this.windowWidth / 2 - this.canvasWidth / 2
			this.maskHeight = this.windowHeight / 2 - this.canvasHeight / 2
		}
	}
}
</script>

<style scoped>
page {
	background-color: #333333;
	width: 100vw;
	height: 100vh;
}

.smask {
	width: 100vw;
	height: 100vh;
	background: white;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	z-index: 9999;
	position: fixed;
}

.canvasBox {
	width: 100vw;
	height: 100vh;
	position: relative;

	background-image: linear-gradient(0deg,
			transparent 24%,
			rgba(32, 255, 77, 0.1) 25%,
			rgba(32, 255, 77, 0.1) 26%,
			transparent 27%,
			transparent 74%,
			rgba(32, 255, 77, 0.1) 75%,
			rgba(32, 255, 77, 0.1) 76%,
			transparent 77%,
			transparent),
		linear-gradient(90deg,
			transparent 24%,
			rgba(32, 255, 77, 0.1) 25%,
			rgba(32, 255, 77, 0.1) 26%,
			transparent 27%,
			transparent 74%,
			rgba(32, 255, 77, 0.1) 75%,
			rgba(32, 255, 77, 0.1) 76%,
			transparent 77%,
			transparent);
	background-size: 3rem 3rem;
	background-position: -1rem -1rem;
	z-index: 10;
	background-color: #1110;
}

.box {
	width: 250px;
	height: 250px;
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	overflow: hidden;
	/* border: 0.1rem solid rgba(0, 255, 51, 0.2); */
	z-index: 11;
}

.line {
	height: calc(100% - 2px);
	width: 100%;
	background: linear-gradient(180deg, rgba(0, 255, 51, 0) 43%, #e45f40 211%);
	border-bottom: 3px solid #e45f40;
	transform: translateY(-100%);
	animation: radar-beam 2s infinite alternate;
	animation-timing-function: cubic-bezier(0.53, 0, 0.43, 0.99);
	animation-delay: 1.4s;
}

.box:after,
.box:before,
.angle:after,
.angle:before {
	content: '';
	display: block;
	position: absolute;
	width: 3vw;
	height: 3vw;
	z-index: 12;
	border: 0.2rem solid transparent;
}

.box:after,
.box:before {
	top: 0;
	border-top-color: #e45f40;
}

.angle:after,
.angle:before {
	bottom: 0;
	border-bottom-color: #e45f40;
}

.box:before,
.angle:before {
	left: 0;
	border-left-color: #e45f40;
}

.box:after,
.angle:after {
	right: 0;
	border-right-color: #e45f40;
}

@keyframes radar-beam {
	0% {
		transform: translateY(-100%);
	}

	100% {
		transform: translateY(0);
	}
}

.msg {
	text-align: center;
	padding: 20rpx 0;
}

.box2 {
	width: 300px;
	height: 200px;
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	z-index: 20;
}

.track {
	position: absolute;
	bottom: -100px;
	left: 50%;
	transform: translateX(-50%);
	z-index: 20;
	color: #fff;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.mask {
	position: absolute;
	z-index: 10;
	background-color: rgba(0, 0, 0, 0.55);
}

.mask1 {
	top: 0;
	left: 0;
	right: 0;
}

.mask2 {
	right: 0;
}

.mask3 {
	right: 0;
	left: 0;
	bottom: 0;
}

.mask4 {
	left: 0;
}

.error {
	color: #fff;
	padding: 40rpx;
	font-size: 24rpx;
	background-color: #333333;
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 550rpx;
	border-radius: 20rpx;
}

.error .on1 {
	font-size: 30rpx;
}

.tips {
	position: fixed;
	bottom: 20px;
	left: 50%;
	transform: translateX(-50%);
	color: #fff;
	font-size: 16px;
	z-index: 9999999;
	text-align: center;
	border-radius: 10px;
	padding: 10px;
	background: rgba(255, 255, 255, .3);
}
</style>