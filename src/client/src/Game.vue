<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import PhaserGame from './game/PhaserGame.vue';
const phaserRef = ref();
const apiUrl = inject('api-url') as string;
const fetchClientData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("token is required");
    }
    const response = await fetch(`${apiUrl}/api/users/decode`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer: ${token}`,
        },
    });
    if (!response.ok) {
        const err = await response.json();
        console.error(err);
        return;
    }

    const { user } = await response.json();
    if (!user) {
        throw new Error("A user was not found in the response.");
    }
    return user;
};
onMounted(async () => {
    const user = await fetchClientData();
    if (user) {
        const { id } = user;
        sessionStorage.setItem('playerId', id);
    }
})
</script>

<template>
    <div id="game">
        <PhaserGame ref="phaserRef" />
    </div>
</template>

<style>
#app {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    /* Full viewport height */
    width: 100vw;
    /* Full viewport width */
}

.container {
    display: grid;
    height: 100vh;
}
</style>
