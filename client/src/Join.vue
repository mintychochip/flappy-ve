<template>
  <div class="online-menu">
    <div class="input-container">
      <!-- Input for Lobby ID -->
      <el-input style="width: 240px" v-model="localSessionId" maxlength="6" size="large" type="text" placeholder="Enter Lobby ID"
      class="input-field"></el-input>
      <el-input style="width: 240px" v-model="localPlayerName" maxlength="16" size="large" type="text" placeholder="Player Name"
      class="input-field"></el-input>
      
      <!-- Spacer between input and button -->
      <div class="spacer">
        <el-button v-if="localSessionId && localSessionId.length === 6 && localPlayerName" type="primary" @click="joinRoom" size="large" round>Join</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from "vue";
import { useRouter } from 'vue-router'

const router = useRouter(); 
const emit = defineEmits();
const localPlayerName = ref()
const localSessionId = ref();
const socketService: any = inject("$socket");
const joinRoom = () => { 
  const data = {
    sessionId: localSessionId.value,
    playerName: localPlayerName.value
  }

  socketService.getSocket().emit('join-room', data, (response: any) => {
    const { sessionId, playerId } = response as { sessionId: string, playerId: string };
    emit('update:sessionId',sessionId);
    if(!sessionId || !playerId) {
      return;
    }
    sessionStorage.setItem('sessionId',sessionId);
    sessionStorage.setItem('playerId',playerId);
    router.push({
      path: '/game'
    });
  });
}
</script>

<style scoped>
.online-menu {
  text-align: center;
  padding: 20px;
}

.input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  /* Adds space between input and button */
}

.input-field {
  margin-bottom: 10px;
  /* Adds space below the input */
}

.spacer {
  height: 10px;
  /* Creates a visible spacer */
}
</style>