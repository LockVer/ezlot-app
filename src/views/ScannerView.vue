<template>
    <div class="scanner">
        <scanner @success='qrcodeSucess' @error="qrcodeError" :paused-scan="verifying"></scanner>
        <transition name="slide-up-down">
            <div class="result" v-if="showResult">
                <div class="row1">
                    <span>Result</span>
                    <span class="iconfont icon-close" @click="closeResult"></span>
                </div>
                <div class="row2">
                    <span v-if="amount > 0">This Crazy Friday Lottery win</span>
                    <span v-if="amount <= 0">This Crazy Friday Lottery</span>
                </div>
                <div class="row2 b">
                    <span v-if="amount > 0">USD {{ amount }}</span>
                    <span style="color: #757575;" v-if="amount <= 0">Did not win</span>
                </div>
                <div class="row3" v-if="false">
                    <span>Contact agent for redeeming.</span>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>

import scanner from '../components/xmScanner/xmScanner.vue';
import VerifyService from '../services/verifyService';
import { checkIfUserIsAuthenticated } from '../utils/auth'
export default {
    name: 'ScannerView',
    data() {
        return {
            verifyed: false,
            verifying: false,
            showResult: false,
            amount: 0,
            serviceClass: new VerifyService()
        };
    },
    components: {
        scanner
    },
    mounted() {
        if (!checkIfUserIsAuthenticated()) {
            this.$router.push('/login');
        }
    },
    methods: {
        qrcodeSucess(data) {
            if (this.verifyed) {
                return;
            }
            this.verifying = true;
            console.log('qrcodeSucess', data);
            if(confirm(`Do you want to redeem ${data.barcode}？`)){
                this.postData(data.barcode);
            }else{
                this.verifying = false;
            }
        },
        qrcodeError(err) {
            console.log('qrcodeError', err);
        },
        postData(barcode) {
            console.log('postData', barcode);
            this.serviceClass.verifyData({
                barcode: barcode
            }).then((res) => {
                if (res) {
                    this.amount = res.data;
                    this.showResult = true;
                    this.verifying = false;
                }
            }).catch((err) => {
                this.verifying = false;
                this.$toast.error(err);
            });
            console.log('postData', barcode);
        },
        closeResult() {
            this.showResult = false; // 隐藏结果
        },
    }
}
</script>
<style scoped lang="scss">
html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    overflow: hidden;
}

.scanner {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

.toast {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 10px;
    border-radius: 5px;
    z-index: 999;
}

.result {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 200px;
    display: flex;
    flex-direction: column;
    padding: 16px;
    background-color: #999999;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    z-index: 999;
    font-family: Arial, Helvetica, sans-serif;

    .row1 {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        font-size: 20px;

        span {
            font-weight: bold;

        }

        .iconfont {
            font-size: 30px;
            color: #cacac7;
            font-weight: normal;
        }
    }

    .row2 {
        font-size: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-top: 1em;

        &.b {
            font-weight: bold;
            font-size: 34px;
            margin-top: 16px;
        }
    }

    .row3 {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 10px;

        span {
            font-size: 20px;
            color: #0066cc;
            text-align: center;
        }
    }
}

.slide-up-down-enter-active,
.slide-up-down-leave-active {
    transition: transform 0.5s ease, opacity 0.5s ease;
}

.slide-up-down-enter,
.slide-up-down-leave-to {
    transform: translateY(100%);
    opacity: 0;
}
</style>