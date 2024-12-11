<template>
    <div class=" flex justify-center items-center min-h-screen">
        <Card class="w-2/3">
            <CardHeader>
                <CardTitle>The winner of the game was: {{ winnerName }}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User Id</TableHead>
                            <TableHead>Id</TableHead>
                            <TableHead>Id</TableHead>
                            <TableHead>Id</TableHead>
                        </TableRow>
                    </TableHeader>
                </Table>
            </CardContent>
            <CardFooter>
                <Button @click="handleBackToDashboard">Back to Dashboard</Button>

            </CardFooter>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import router from './router';
const route = useRoute();
const localMatchId = ref<number>();
const winnerName = ref<string>();
const apiUrl = inject('api-url');
const handleBackToDashboard = () => {
    router.push('/');
}

const fetchResults = async (matchId: number) => {
    try {
        const response = await fetch(`${apiUrl}/api/matches/${matchId}/match-results`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const err = await response.json();
            console.error(err);
            return;
        }

        const results = await response.json();
        return results;
    } catch (err) {
        console.error(err);
    }
}
onMounted(async () => {
    const stringMatchId = route.query.matchId as string;
    localMatchId.value = Number.parseInt(stringMatchId);

    const results = await fetchResults(localMatchId.value);
    console.log(results);
})
</script>