<script setup>
import { ref, computed } from 'vue'
import Home from './Home.vue'
import Game from './Game.vue'
import NotFound from './NotFound.vue'


const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
})

const currentView = computed(() => {
  console.log()
  return routes[currentPath.value.slice(1) || '/'] || NotFound
})
</script>

<template>
  <nav>
    <a href="/">Ditch</a>
  </nav>
  <RouterView/>
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