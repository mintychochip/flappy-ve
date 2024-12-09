<template>
    <div>
        <Card class="w-2/3 mx-auto">
            <CardHeader>
                <CardTitle class="text-2x1">Session</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs default-value="players">
                    <TabsList class="grid w-full grid-cols-2">
                        <TabsTrigger value="players" class="text-x1 px-8 py-4">Players</TabsTrigger>
                        <TabsTrigger value="settings" class="text-x1 px-8 py-4">Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="players">
                        <ScrollArea class="h-2/3 w-full border rounded-md p-4">

                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'; import { Button } from '@/components/ui/button'
import ScrollArea from './components/ui/scroll-area/ScrollArea.vue';
import { Route } from 'lucide-vue-next';
import { useRoute } from 'vue-router';
import router from './router';
const socket: any = inject('$socket');
const players = [
    { id: 1, name: "Player 1", isReady: true, isHost: true },
    { id: 2, name: "Player 2", isReady: false, isHost: false },
    { id: 3, name: "Player 3", isReady: true, isHost: false },
    { id: 4, name: "Player 4", isReady: false, isHost: false },
]
const apiUrl = inject('api-url') as string;
const route = useRoute();
const sessionId = ref<string|undefined>();
onMounted(async () => {
    sessionId.value = route.query.id as string;
    if (!sessionId.value) {
        router.push('/');
    }

    try {
        const response = await fetch(`${apiUrl}/api/session/${sessionId.value}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if(!response.ok) {
            router.push('/');
            return;
        }

        const data = await response.json();
        if(!data) {
            router.push('/');
        }
    } catch (err) {
        console.error(err);
    }
});
</script>