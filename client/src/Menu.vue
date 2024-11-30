<template>
    <div class="menu">
        <h1>Lobby</h1>
        <button @click="createLobby">Create Lobby</button>
        <div v-if="lobbies.length > 0">
            <ul>
                <li v-for="lobby in lobbies" :key="lobby.id">
                    {{ lobby.name }} (ID: {{ lobby.id }}) 
                </li>
            </ul>
        </div>
        <div v-else>
            <p>No lobbies available</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { ClientLobby } from './model/ClientLobby';
const lobbies = ref<ClientLobby[]>([]);

const socket : any = inject('socket');
const createLobby = async() => {
    try {
        const endpoint = "http://localhost:3000/api/lobby";
        const id = socket.id;
        if(!id) {
            throw new Error('no name');
        }
        const data = {
            socket_id: id,
        }
    
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",  // Set the content type to JSON
            },
            body: JSON.stringify(data),  // Send the data as a JSON string in the body
        });

        if(response.ok) {
            const result = await response.json();
            console.log('lobby created:', result);
        } else {
            const error = await response.json();
            console.error("Failed to create lobby:", error);
        }
    } catch (err) {
        console.log(err);
    }
}
const fetchLobbies = async () => {
    try {
        //TODO: MAGIC VALUE
        const endpoint = "http://localhost:3000/api/lobby";
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('failed to fetch lobbies');
        }
        const data = await response.json();
        lobbies.value = data.map((lobby: { id: number, name: string }) => {
            return new ClientLobby(lobby.id, lobby.name);
        });
    } catch (err) {
        console.error(err);
    }
}

const listenToLobbyUpdates = () => {
    socket.on('lobby-create', () => {
        fetchLobbies();
    });
    socket.on('lobby-delete',() => {
        fetchLobbies();
    })
}
onMounted(() => {
    fetchLobbies();
    listenToLobbyUpdates();
})
</script>