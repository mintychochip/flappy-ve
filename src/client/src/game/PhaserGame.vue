<script setup lang="ts">
import { inject, onMounted, onUnmounted, Ref, ref } from 'vue';
import { EventBus } from './EventBus';
import StartGame from './main';
import Phaser from 'phaser';
import {Game as MainGame} from './scenes/Game'
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
// Save the current scene instance

const scene = ref();
const game = ref();
const route = useRoute();
const socketService: any = inject('$socket');
const emit = defineEmits(['current-active-scene']);
const apiUrl = inject('api-url') as string;
const router = useRouter();
onMounted(async () => {
    const sessionId = route.query.id as string;
    game.value = StartGame('game-container');
    EventBus.on('current-scene-ready', (scene_instance: Phaser.Scene) => {
        emit('current-active-scene', scene_instance);
        scene.value = scene_instance;
    });
    const s = socketService.getSocket();
    EventBus.on('drive', () => {
        if (!sessionId) {
            return;
        }
        const userToken = localStorage.getItem('token');
        if(!userToken) {
            return;
        }
        const data = {
            sessionId: sessionId,
            userToken: userToken,
        }
        s.emit('drive',data);
    });

    s.on('update',(data: any) => {
        EventBus.emit('update',data);
    })
    s.on('player-drive',(playerId: string) => {
        EventBus.emit('player-drive',playerId);
    });
    s.on('session-stopped', () => {
        if (router) {
            router.push('/');
        } else {
            console.error('Router not initialized');
        }
    });
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