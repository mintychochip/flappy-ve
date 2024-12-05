<script setup lang="ts">
import Phaser from 'phaser';
import { onBeforeUnmount, onMounted, provide, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router'
import { socketService } from './SocketService';
import OnlineMenu from './OnlineMenu.vue';
import PhaserGame from './game/PhaserGame.vue';

const route = useRoute();

//  References to the PhaserGame component (game and scene are exposed)
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
