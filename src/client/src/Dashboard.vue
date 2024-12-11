<template>
    <div class="grid items-center justify-center min-h-screen">
        <Tabs default-value="create">
            <TabsList class="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create</TabsTrigger>
                <TabsTrigger value="join">Join</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
                <CreateSession/>
            </TabsContent>
            <TabsContent value="join">
                <JoinSession/>
            </TabsContent>
        </Tabs>
    </div>
</template>

<script setup lang="ts">
import CreateSession from './CreateSession.vue';
import JoinSession from './JoinSession.vue';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
</script>
