<template>
    <div class="online-menu">
      <div class="input-container">
        <!-- Input for Player Name-->
        <el-input style="width: 240px" v-model="localPlayerName" maxlength="16" size="large" type="text" placeholder="Player Name"
        class="input-field"></el-input>
        
        <!-- Spacer between input and button -->
        <div class="spacer">
          <el-button v-if="localPlayerName" type="primary" @click="createRoom" size="large" round>Create</el-button>
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
  const socketService: any = inject("$socket");
  const createRoom = () => {
    socketService.getSocket().emit('create-room', { playerName: localPlayerName }, (response: { roomId: string }) => {
        const { roomId } = response;
        router.push(`/lobby/${roomId}`);
    });
  }; 
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