<script setup lang="ts">
import Phaser from 'phaser';
import { onBeforeUnmount, onMounted, provide, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router'
import { socketService } from './SocketService';
import OnlineMenu from './OnlineMenu.vue';
import PhaserGame from './game/PhaserGame.vue';
import { v4 as uuidv4} from 'uuid';

const route = useRoute();

//  References to the PhaserGame component (game and scene are exposed)
const phaserRef = ref();

const sessionId = ref<string | null>(route.query.sessionId || null)
const playerId = ref<string | null>(route.query.playerId || null)

onMounted(() => {
})
</script>

<template>
    <div id="game">
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
