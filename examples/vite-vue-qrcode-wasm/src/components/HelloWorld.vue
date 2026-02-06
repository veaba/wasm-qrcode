<script setup lang="ts">
import { ref, onMounted } from 'vue'
import initWasm, { QRCodeCore, QRErrorCorrectLevel } from "@veaba/qrcode-wasm";


defineProps<{ msg: string }>()

const svgStr = ref('')

const generateSVG = async () => {
  await initWasm()

  const qr = new QRCodeCore(
    "https://github.com/veaba/qrcodes/setting",
    QRErrorCorrectLevel.H,
  );
  const svg = qr.toSVG(256);

  svgStr.value = svg
}

onMounted(() => {
  generateSVG()

})
</script>

<template>
  <h1>{{ msg }}</h1>

  <h2> vite + vue + @veaba/qrcode-wasm</h2>

  <div v-html="svgStr"></div>

</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
