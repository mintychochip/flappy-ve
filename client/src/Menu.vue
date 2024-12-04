<template>
    <div class="menu">
        <div class="input-container">
            <!-- Input for Lobby ID -->
            <el-input style="width: 240px" v-model="localSessionId" maxlength="6" size="large" type="text" placeholder="Enter Lobby ID"
                class="input-field"></el-input>
            <!-- <el-input style="width: 240px" v-model="playerName" maxlength="6" size="large" type="text" placeholder="Enter Lobby ID"
                class="input-field"></el-input> -->
            
            <!-- Spacer between input and button -->
            <div class="spacer">
                <el-button v-if="localSessionId && localSessionId.length === 6" type="primary" @click="joinRoom" size="large" round>Join</el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, onMounted, Ref, ref, watch } from "vue";
import { ElMessage } from "element-plus";
const emit = defineEmits();
const props = defineProps({
    sessionId: {
        type: String,
        required: true,
    },
    playerId: {
        try: String,
        required: true,
    }
});
const localPlayerId = ref(props.playerId);
const localSessionId = ref(props.sessionId);
const playerId = inject('uuid') as string;
const socketService: any = inject("$socket");
const playerId = 
const joinRoom = () => { 
    // Emit the 'join-room' event with room_id and handle callback
    const data = {
        sessionId: localSessionId.value,
        playerName: 'Test'
    }
    socketService.getSocket().emit('join-room', data, (response: {playerId: string}) => {
        emit('update:sessionId',localSessionId.value);
            ElMessage({
                message: `Joined ${localSessionId.value}`,
                type: 'success',
                duration: 1000
            });
        });
        emit('update:playerId', playerId);
}
onMounted(() => { });
</script>

<style scoped>
.menu {
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