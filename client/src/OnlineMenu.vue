<template>
    <div class="home-container">
      <div class="button-container">
        <button class="home-button" @click="createNew">Create New Session</button>
        <button class="home-button" @click="joinSession">Join Session</button>
      </div>
    </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'

  const router = useRouter()

  function createNew() {
    router.push('/create');
    console.log("Play game clicked");
  }
  function joinSession() {
    router.push('/join');
    console.log("Join game clicked");
  }
</script>

<style scoped>
  .home-container {
    background-image: url('/path/to/your/background.jpg'); /* Update the path */
    background-size: cover;
    background-position: center;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .button-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .home-button {
    padding: 15px 30px;
    font-size: 18px;
    font-weight: bold;
    background-color: rgba(255, 255, 255, 0.8);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }
  
  .home-button:hover {
    background-color: rgba(200, 200, 200, 0.9);
    transform: scale(1.05);
  }
  
  .home-button:active {
    transform: scale(0.95);
  }
</style>