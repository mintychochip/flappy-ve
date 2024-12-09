<template>
    <Card>
        <CardHeader>
            <CardTitle>Create Session</CardTitle>
            <CardDescription>Session Settings</CardDescription>
        </CardHeader>
        <form @submit="handleCreateSession">
            <CardContent class="space-y-6">
                <NumberField v-model="pipeCount" id="pipe-count" :default-value="pipeCount" :min="1" :max="128">
                    <Label class="text-sm">Pipe Count</Label>
                    <NumberFieldContent>
                        <NumberFieldDecrement />
                        <NumberFieldInput />
                        <NumberFieldIncrement />
                    </NumberFieldContent>
                </NumberField>
                <NumberField v-model="pipeVelocityX" id="pipe-velocity" :default-value="pipeVelocityX" :min="1" :max="128">
                    <Label class="text-sm">Pipe Velocity</Label>
                    <NumberFieldContent>
                        <NumberFieldDecrement />
                        <NumberFieldInput />
                        <NumberFieldIncrement />
                    </NumberFieldContent>
                </NumberField>
                <NumberField v-model="playerGravity" id="player-gravity" :default-value="playerGravity" :min="1" :max="128">
                    <Label class="text-sm">Player Gravity</Label>
                    <NumberFieldContent>
                        <NumberFieldDecrement />
                        <NumberFieldInput />
                        <NumberFieldIncrement />
                    </NumberFieldContent>
                </NumberField>
                <NumberField v-model="tps" id="tps" :default-value="tps" :min="1" :max="128">
                    <Label class="text-sm">Ticks Per Second</Label>
                    <NumberFieldContent>
                        <NumberFieldDecrement />
                        <NumberFieldInput />
                        <NumberFieldIncrement />
                    </NumberFieldContent>
                </NumberField>
                <NumberField v-model="playerJumpVelocityY" id="player-jump-velocity" :default-value="playerJumpVelocityY" :min="1"
                    :max="128">
                    <Label class="text-sm">Player Jump Velocity</Label>
                    <NumberFieldContent>
                        <NumberFieldDecrement />
                        <NumberFieldInput />
                        <NumberFieldIncrement />
                    </NumberFieldContent>
                </NumberField>
            </CardContent>
            <CardFooter class="grid w-full">
                <Button type="submit">Create</Button>
            </CardFooter>
        </form>
    </Card>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
    NumberField,
    NumberFieldContent,
    NumberFieldDecrement,
    NumberFieldInput,
    NumberFieldIncrement
} from '@/components/ui/number-field'
import { Vector } from './game/ClientModels';
import router from './router';
import { useToast } from './components/ui/toast';
const pipeCount = ref<number>(4);
const pipeVelocityX = ref<number>(10);
const playerGravity = ref<number>(50);
const tps = ref<number>(32);
const playerJumpVelocityY = ref<number>(8);

interface SessionConfig {
    pipeCount: number
    pipeVelocity: Vector
    playerGravity: number
    tps: number
    playerJumpVelocity: Vector
}
const apiUrl: string = inject('api-url') as string;

const { toast } = useToast();
const handleCreateSession = async (e:SubmitEvent) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        if(!token) {
            router.push('/login');
            return;
        }
        const config: SessionConfig = {
            pipeCount: pipeCount.value,  
            pipeVelocity: { 
                x: -pipeVelocityX.value,  
                y: 0                            
            },
            playerGravity: playerGravity.value,  
            tps: tps.value,                      
            playerJumpVelocity: { 
                x: 0,                               
                y: -playerJumpVelocityY.value   
            }
        };
        const response = await fetch(`${apiUrl}/api/session`, {
            method: 'POST',
            headers: {
                "Authorization" : `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                config,
                token 
            })
        });

        if(!response.ok) {
            const err = await response.json();
            console.error(err);
            return;
        }

        const data = await response.json();
        const sessionId = data.sessionId;

        if(!sessionId) {
            console.error("A session ID was not found in the response.");
            return;
        }
        toast({
            title: `Session ID: ${sessionId}`,
            description: 'Use this to join a session',
            duration: 5000
        })
    } catch (err) {
        toast({})
        console.error(err);
    }

}
</script>
