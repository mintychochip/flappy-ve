<template>
    <div>
        <Card class="w-2/3 mx-auto">
            <CardHeader>
                <div class="flex justify-between items-center">
                    <!-- Title -->
                    <CardTitle class="text-2xl">
                        {{ sessionHost?.name || "Unknown" }}'s Lobby
                    </CardTitle>

                    <!-- Buttons -->
                    <div class="flex space-x-2">
                        <Button @click="fetchPlayers">Refresh Players</Button>
                        <Button
                            @click="handleStart"
                            class="bg-green-500"
                            v-if="
                                sessionHost &&
                                client &&
                                sessionHost.id === client.id
                            "
                            >Start</Button
                        >
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs default-value="players">
                    <TabsList class="grid w-full grid-cols-2">
                        <TabsTrigger value="players" class="text-x1 px-8 py-4"
                            >Players</TabsTrigger
                        >
                        <TabsTrigger value="settings" class="text-x1 px-8 py-4"
                            >Settings</TabsTrigger
                        >
                    </TabsList>
                    <TabsContent value="players">
                        <ScrollArea class="h-2/3 w-full border rounded-md p-4">
                            <div
                                v-for="player in clientPlayers"
                                :key="player.type"
                                class="flex"
                            >
                                <RocketLaunchIcon
                                    class="w-6 h-6"
                                ></RocketLaunchIcon>
                                <div class="text-large">
                                    {{ player?.name }}
                                </div>
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import { RocketLaunchIcon } from "@heroicons/vue/24/solid";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ScrollArea from "./components/ui/scroll-area/ScrollArea.vue";
import { useRoute } from "vue-router";
import router from "./router";
import { GameObject } from "./game/ClientModels";
const apiUrl = inject("api-url") as string;
const socket: any = inject("$socket");
const route = useRoute();
const sessionId = ref<string>();
const sessionHost = ref<User | null>();
const sessionMeta = ref<Session | null>();
const clientPlayers = ref<GameObject[] | null>();
const client = ref<User>();
interface User {
    id: string;
    name: string;
}

interface Session {
    objects: Map<string, GameObject>;
}

const handleStart = async () => {
    const userToken = localStorage.getItem("token");
    if (!userToken) {
        router.push("/");
        return;
    }
    try {
        const response = await fetch(`${apiUrl}/api/session/start`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({
                userToken,
                sessionId: sessionId.value,
            }),
        });
        if (!response.ok) {
            const err = await response.json();
            console.error(err);
            return;
        }
    } catch (err) {
        console.error(err);
    }
};

const fetchPlayers = async () => {
    const { host, session } = await fetchSessionData();
    sessionHost.value = host;
    sessionMeta.value = session;
    clientPlayers.value = await playersInSession();
};
const playersInSession = async (): Promise<GameObject[] | null> => {
    if (!sessionMeta.value) {
        return null;
    }
    return Object.entries(sessionMeta.value.objects)
        .filter(([id, object]) => (object as GameObject).type === "player")
        .map(([id, object]) => object);
};
const fetchClientData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("token is required");
    }
    const response = await fetch(`${apiUrl}/api/user/decode`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer: ${token}`,
        },
    });

    if (!response.ok) {
        const err = await response.json();
        console.error(err);
        return;
    }

    const { user } = await response.json();
    if (!user) {
        throw new Error("A user was not found in the response.");
    }
    return user;
};
const fetchSessionData = async (): Promise<{
    host: User | null;
    session: Session | null;
}> => {
    try {
        const response = await fetch(
            `${apiUrl}/api/session/${sessionId.value}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            router.push("/");
            return { host: null, session: null };
        }

        const data = await response.json();
        if (!data) {
            router.push("/");
        }
        return { host: data.host, session: data.session };
    } catch (err) {
        console.error(err);
        return { host: null, session: null };
    }
};
onMounted(async () => {
    sessionId.value = route.query.id as string;
    if (!sessionId.value) {
        router.push("/");
    }
    const { host, session } = await fetchSessionData();
    sessionHost.value = host;
    sessionMeta.value = session;
    clientPlayers.value = await playersInSession();
    client.value = await fetchClientData();

    socket.getSocket().on('started', () => {
        router.push('/game');
    })
});
</script>

