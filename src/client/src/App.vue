<script setup>
import { ref, computed, provide } from 'vue'
import Game from './Game.vue'
import Toaster from './components/ui/toast/Toaster.vue';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
provide('api-url',VITE_API_BASE_URL);
const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
})

const currentView = computed(() => {
  console.log()
})
</script>

<template>
  <div class="fixed inset-0 bg-gray-900 dark:bg-gray-800">
    <Toaster/>
    <RouterView/>
  </div>
</template>

<style scoped>
  nav {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 5px;
    background-color: aqua;
    color: gold;
    height: 15px;
    border: red;
  }
</style>