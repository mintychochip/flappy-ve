<template>
    <div class="online-menu">
        <div class="input-container">
            <div class="spacer">
                <el-button type="primary" @click="createRoom" size="large" round>Join</el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, onMounted, Ref, ref, watch } from "vue";
const emit = defineEmits();
const socketService: any = inject("$socket");

const createRoom = () => {

}
onMounted(() => { });
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