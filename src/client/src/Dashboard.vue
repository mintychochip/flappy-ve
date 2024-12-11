<template>
    <div class="items-center justify-center min-h-screen">
        <Card class="h-full w-full">
            <CardHeader>
                <CardTitle>Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
                <div class="flex space-x-4">
                    <!-- Tabs section -->
                    <div class="flex-1">
                        <Tabs default-value="create">
                            <TabsList class="grid grid-cols-2">
                                <TabsTrigger value="create">Create</TabsTrigger>
                                <TabsTrigger value="join">Join</TabsTrigger>
                            </TabsList>
                            <TabsContent value="create">
                                <CreateSession />
                            </TabsContent>
                            <TabsContent value="join">
                                <JoinSession />
                            </TabsContent>
                        </Tabs>
                    </div>
                    <!-- Test Card section -->
                    <div class="flex-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Leaderboard</CardTitle>
                                <CardDescription>Global Leaderboard</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Leaderboard/>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
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
import CreateSession from './CreateSession.vue';
import JoinSession from './JoinSession.vue';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import Leaderboard from './Leaderboard.vue';
</script>
