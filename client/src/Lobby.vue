<template>
    <div>
        <h1>Session Players</h1>
        <ul v-if="players.length">
            <li v-for="player in players" :key="player.playerId">{{ player.playerName }}</li>
        </ul>
        <Button>Test</Button>
        <!-- <p v-else>No players found for this session.</p> -->
    </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { Button } from '@/components/ui/button'
const socket: any = inject('$socket');
const sessionId = sessionStorage.getItem('sessionId');
const playerId = sessionStorage.getItem('playerId');

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const players = ref<Array<{ playerId: string; playerName: string }>>([]);
const fetchPlayers = async () => {
    console.log(apiBaseUrl)

    if (!sessionId || !apiBaseUrl) {
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/api/session/${sessionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error fetching players');
        }

        const data = await response.json();

        console.log(data);
        players.value = data.players;
    } catch (err) {
        console.error(err);
    }
}
onMounted(() => {
    fetchPlayers();
});
</script>