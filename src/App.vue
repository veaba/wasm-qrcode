<script setup lang="ts">
import { ref } from 'vue'
import Home from './Home.vue'
import Benchmark from './Benchmark.vue'

const currentPage = ref<'home' | 'benchmark'>('home')

function navigate(page: 'home' | 'benchmark') {
  currentPage.value = page
}
</script>

<template>
  <div class="app">
    <nav class="nav" v-if="currentPage === 'home'">
      <a href="#" @click.prevent="navigate('benchmark')">🏁 基准测试</a>
    </nav>
    <nav class="nav" v-else>
      <a href="#" @click.prevent="navigate('home')">← 返回主页</a>
    </nav>
    
    <Home v-if="currentPage === 'home'" />
    <Benchmark v-else />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
}

.app {
  min-height: 100vh;
}

.nav {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
}

.nav a {
  display: inline-block;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.nav a:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
