<template>
    <Card>
        <CardHeader>
            <CardTitle>Join Session</CardTitle>
            <CardDescription>If you have friends</CardDescription>
        </CardHeader>
        <CardContent>
            <Input v-model="localSessionId" name="session-id" placeholder="Session ID" />
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

const localSessionId = ref<string | undefined>();
const socket: any = inject('$socket');
const handleJoinSession = async () => {
    if (!localSessionId.value) {
        return;
    }
    localStorage.setItem('sessionId', localSessionId.value);
    const token = localStorage.getItem('token');
    if (!token) {
        return;
    }
    const data = {
        sessionId: localSessionId.value,
        token
    }
    try {
        socket.getSocket().emit('join', data, (response: boolean) => {
            if (response && localSessionId.value) {
                router.push({ path: '/session', query:{ id: localSessionId.value}});
            }
        });
    } catch (err) {
        console.error(err);
    }
}
</script>