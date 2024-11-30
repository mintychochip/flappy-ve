<script setup lang="ts">
import Phaser from 'phaser';
import { onBeforeUnmount, onMounted, provide, ref, toRaw } from 'vue';
import PhaserGame from './game/PhaserGame.vue';
import { io, Socket } from 'socket.io-client';

//  References to the PhaserGame component (game and scene are exposed)
const phaserRef = ref();

const socket : Socket = io('http://localhost:3000');
provide('socket',socket);

const addSprite = () => {

    const scene = toRaw(phaserRef.value.scene) as Phaser.Scene;

    if (scene)
    {

        // Add a new sprite to the current scene at a random position
        const x = Phaser.Math.Between(64, scene.scale.width - 64);
        const y = Phaser.Math.Between(64, scene.scale.height - 64);
    
        // `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
        scene.add.sprite(x, y, 'star');

    }

}

onMounted(() => {
    const handleBeforeUnload = (event: Event) => {
        socket.emit('window-reload',{id: socket.id});
    }

    window.addEventListener('beforeunload',handleBeforeUnload);
    onBeforeUnmount(() => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    })
})

</script>

<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>
