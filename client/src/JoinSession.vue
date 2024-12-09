<template>
    <Card>
        <CardHeader>
            <CardTitle>Join Session</CardTitle>
            <CardDescription>If you have friends</CardDescription>
        </CardHeader>
        <CardContent>
            <Input v-model="sessionId" name="session-id" placeholder="Session ID" />
        </CardContent>
        <CardFooter class="grid w-full">
            <Button @click="handleJoinSession">Join</Button>
        </CardFooter>
    </Card>
</template>

<script setup lang="ts">
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button';

import { inject, ref } from 'vue';
import router from './router';

const sessionId = ref<string|undefined>();
const socket: any = inject('$socket');
const handleJoinSession = async () => {
    if(!sessionId.value) {
        return;
    }
    const token = localStorage.getItem('token');
    if(!token) {
        return;
    }
    try {
        socket.getSocket().emit('join-session',{sessionId: sessionId.value, token}, (response: {success: boolean}) => {
            if(response.success && sessionId.value) {
                router.push({path: '/session', query: {id: sessionId.value}});
            }
        });   
    } catch (err) {
        console.error(err);
    }
}
</script>