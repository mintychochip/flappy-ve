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
            <Button @click="">Join</Button>
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

const sessionId = ref<string|undefined>();
const apiUrl = inject('api-url') as string;
const socket: any = inject('$socket');
const handleJoinSession = async () => {
    if(!sessionId.value) {
        return;
    }
    const token = localStorage.getItem('token');
    if(!token) {

        return;
    }
    const data = {
        sessionId: sessionId.value,
        token
    }
    try {
        socket.getSocket().emit('join',data, (response: {sessionId: string}) => {
            console.log(response.sessionId);
        });   
    } catch (err) {
        console.error(err);
    }
}
</script>