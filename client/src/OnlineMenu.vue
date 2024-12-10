<template>
        <Button>Create Session</Button>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
  import { hostname } from 'os';
import { inject } from 'vue';
  import { useRouter } from 'vue-router'
  const socket: any = inject('$socket');
  const router = useRouter();

  const createNew = () => {
    const hostName = "Test"; // pull this from sessionstorage later

    socket.getSocket().emit('create-room',hostName,(response: {sessionId:string}) => {
      console.log(response.sessionId);
    });
  }
  function joinSession() {
    router.push('/join');
    console.log("Join game clicked");
  }
</script>