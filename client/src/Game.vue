<script setup lang="ts">
import { ref } from 'vue';
import PhaserGame from './game/PhaserGame.vue';
const phaserRef = ref();

</script>

<template>
    <div id="game">
        <PhaserGame ref = "phaserRef"/>
    </div>
</template>

<style>
#app {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;  /* Full viewport height */
    width: 100vw;   /* Full viewport width */
}

.container {
    display: grid;
    height: 100vh;
}

</style>
