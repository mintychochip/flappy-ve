<template>
    <div class="lobby">
      <h1>Lobby</h1>
      <p><strong>Session ID: {{ $route.params.sessionId }}</strong></p>
      <ul>
        <li 
          v-for="player in players" 
          :key="player.id" 
          :class="{ 'current-player': player.id === playerId }">
          {{ player.name }} <span v-if="player.id === playerId">(You)</span>
        </li>
      </ul>
      <div class="actions">
        <el-button type="primary" @click="startGame" :disabled="!isCreator">Start Game</el-button>
        <!-- <el-button type="danger" @click="exit">Exit</el-button> -->
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { inject, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { store } from './store.ts'
  
  const route = useRoute();
  const router = useRouter();
  const socketService = inject("$socket");
//   const playerId = inject('uuid') as string;
  const sessionId = route.params.sessionId; 
  const players = ref<{ id: string, name: string }[]>([]);
  const isCreator = ref(false);
  
  const fetchPlayers = () => {
    socketService.getSocket().emit('get-players', { sessionId }, (response: { players: { id: string, name: string }[], isCreator: boolean }) => {
      console.log(response.players);
      players.value = response.players;
      isCreator.value = response.isCreator;
    });
  };
  
  const startGame = () => {
    socketService.getSocket().emit('start-session', { sessionId });
    router.push(`/game/${sessionId}`);
  };
  
  const exit = () => {
    socketService.getSocket().emit('leave-room', { sessionId, playerId });
    router.push('/');
  };
  
  onMounted(() => {
    fetchPlayers();
    socketService.getSocket().on('player-joined', fetchPlayers);
    socketService.getSocket().on('player-left', fetchPlayers);
  });
  </script>
  
  <style scoped>
  .lobby {
    text-align: center;
  }
  
  .current-player {
    font-weight: bold;
    color: green;
  }
  
  .actions {
    margin-top: 20px;
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  </style>
  