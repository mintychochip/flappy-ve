<script setup lang="ts">
import Phaser from 'phaser';
import { onBeforeUnmount, onMounted, provide, ref, toRaw } from 'vue';
import { socketService } from './SocketService';
import Menu from './Menu.vue';
import PhaserGame from './game/PhaserGame.vue';
import { v4 as uuidv4} from 'uuid';
//  References to the PhaserGame component (game and scene are exposed)
const phaserRef = ref();
const localPlayerId = uuidv4();
provide('uuid',localPlayerId);
const sessionId = ref<string | null> (null);
provide('sessionId',sessionId);

onMounted(() => {
})
</script>

<template>
    <div id="app">
        <Menu v-model:sessionId="sessionId"></Menu>
        <PhaserGame v-if="sessionId" ref = "phaserRef"/>
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
