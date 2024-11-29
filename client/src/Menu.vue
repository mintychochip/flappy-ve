<template>
    <div class="menu">
        <h1>Lobby</h1>
        <div v-if="lobbies.length > 0">
            <ul>
                <li v-for="lobby in lobbies" :key="lobby.id">
                    {{ lobby.name }} (ID: {{ lobby.id }}) 
                    <button @click="joinLobby">Join</button>
                </li>
            </ul>
        </div>
        <div v-else>
            <p>No lobbies available</p>
        </div>
        <button @click="fetchLobbies">Refresh</button>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ClientLobby } from './model/ClientLobby';
import { io } from 'socket.io-client';
const lobbies = ref<ClientLobby[]>([]);

setInterval(() => {

});
const fetchLobbies = async () => {
    try {
        //TODO: MAGIC VALUE
        const response = await fetch('http://localhost:3000/api/lobby');
        if (!response.ok) {
            throw new Error('failed to fetch lobbies');
        }
        const data = await response.json();
        lobbies.value = data.map((lobby: { id: number, name: string }) => {
            return new ClientLobby(lobby.id, lobby.name);
        });
    } catch (err) {
        console.log(err);
    }
}

const joinLobby = async() => {

}

onMounted(() => {
    fetchLobbies();
})
</script>