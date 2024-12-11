
<template>
    <div class="flex items-center justify-center min-h-screen">  
            <Card>
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Login</CardDescription>
            </CardHeader>
            <form @submit="handleSubmit">
                <CardContent>
                    <div class="grid items-center w-full gap-4">
                        <div class="flex flex-col space-y-1.5">
                            <Label for="username" class="text-sm font-medium">Username</Label>
                            <Input id="username" placeholder="Enter Username" v-model="localUsername"/>
                        </div>

                        <div class="flex flex-col space-y-1.5">
                            <Label for="password" class="text-sm font-medium">Password</Label>
                            <Input id="password" type="password" placeholder="Enter Password" v-model="localPassword"/>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <div class="flex items-center justify-between w-full">
                        <Button type="submit" name="login" variant="outline">Login</Button>
                        <Button type="submit" name="signup" variant="outline">Sign Up</Button>
                    </div>
                </CardFooter>
            </form>
        </Card>
    </div>
</template>
<script setup lang="ts">
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToastProvider } from '@/components/ui/toast'
import { useToast } from '@/components/ui/toast'
import {inject, ref} from 'vue'
import router from './router'

const localPassword = ref<string>();
const localUsername = ref<string>();
const { toast } = useToast();
const apiUrl = inject('api-url') as string;

const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if(!localUsername.value || !localPassword.value) {
        return;
    }
    
    if(e.submitter?.name === 'signup') {
        await handleSignUp();
    } else {
        await handleLogin();
    }
}
const handleSignUp = async () => {
    try {
        const response = await fetch(`${apiUrl}/api/users`, {
            method: 'POST',
            headers: {
                "Content-Type" :"application/json",
            },
            body: JSON.stringify({
                name: localUsername.value,
                password: localPassword.value
            })
        })

        if(!response.ok) {
            const err = await response.json();
            console.error(err);
            return;
        }

        toast({
            title: 'User has been created',
            duration: 3000
        })
    } catch (err) {
        console.error(err);
    }
}
const handleLogin = async () => {
    try {
        const response = await fetch(`${apiUrl}/api/users/login`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: localUsername.value,
                password: localPassword.value
            }),
        });

        if(!response.ok) {
            const err = await response.json();
            console.error(err);

            toast({
                title: 'Login Failed',
                description: err.error,
                duration: 3000
            });
            return;
        }
        const data = await response.json();
        const token = data.token;
        localStorage.setItem('token',token);

        router.push({path: '/'});
    } catch (err) {
        toast({
                title: 'Something went wrong',
                duration: 3000,
                variant: 'destructive'
            });
        console.error(err);
    }
}
</script>
