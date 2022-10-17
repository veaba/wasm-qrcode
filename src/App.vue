<script setup lang='ts'>
import { onMounted, ref } from 'vue'
// QRCode
import wasm, { version } from '../wasm-qrcode/pkg/wasm_qrcode'

const refVersion = ref()
const refText = ref()

const runWasm = async () => {
  await wasm();
  refVersion.value = ref(version())
}
runWasm()

// onMounted(() => {
//   const qrCodeNode = document.getElementById('qrcode')
//   const qrCode = new QRCode(qrCodeNode, {
//     text: refText,
//     width: 100,
//     height: 100,
//     colorDark: '#000000',
//     colorLight: '#ffffff',
//     correctLevel: QRCode.CorrectLevel.h,
//   })
//   console.log('qrcode=>', qrCode)
// })
</script>
<template>

  <h2>哇哈哈</h2>

  <h3>refVersion=>{{refVersion}}</h3>
  <fieldset>
    <legend>QRCode by rust wasm.</legend>
    <div id="qrcode"></div>
  </fieldset>

</template>