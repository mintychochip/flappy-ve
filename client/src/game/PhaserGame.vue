<script setup lang="ts">
import { inject, onMounted, onUnmounted, Ref, ref } from 'vue';
import { EventBus } from './EventBus';
import StartGame from './main';
import Phaser from 'phaser';
// Save the current scene instance

const scene = ref();
const game = ref();
const socketService: any = inject('$socket');
const emit = defineEmits(['current-active-scene']);
const serverListeners = () => {
    socketService.getSocket().on('update', (object: any) => {
        EventBus.emit('update', object);
    });

    /**
     * Called when another player drives, to animate their spirte
     */
    socketService.getSocket().on('player-drive',(playerId: string) => {
        EventBus.emit('player-drive',playerId);
    })
}
const sessionId = sessionStorage.getItem('sessionId');
const playerId = sessionStorage.getItem('playerId');
onMounted(() => {

    game.value = StartGame('game-container');
    EventBus.on('current-scene-ready', (scene_instance: Phaser.Scene) => {
        emit('current-active-scene', scene_instance);
        scene.value = scene_instance;
    });

    EventBus.on('drive', () => {
        if (!sessionId) { // Check if sessionId and its value are valid
            return;
        }
        const data = {
            sessionId: sessionId,
            playerId: playerId,
        }
        socketService.getSocket().emit('drive',data);
    });
    serverListeners();
});

onUnmounted(() => {

    if (game.value) {
        game.value.destroy(true);
        game.value = null;
    }

});

defineExpose({ scene, game });

</script>

<template>
    <div id="game-container"></div>
</template>