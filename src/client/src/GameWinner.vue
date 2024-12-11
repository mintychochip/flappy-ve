<template>
    <div class=" flex justify-center items-center min-h-screen">
        <Card class="w-2/3">
            <CardHeader>
                <CardTitle>  The winner of the game was: {{ localWinner?.name || 'unknown' }}
                </CardTitle>
                <CardDescription>Match ID: {{ localMatchId }}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User Name</TableHead>
                            <TableHead>Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="result in localResults" :key="result.id">
                            <TableCell class="font-medium">
                                {{ result.name }}
                            </TableCell>
                            <TableCell>
                                {{ result.score }}
                            </TableCell>
                        </TableRow> 
                    </TableBody>
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
import { MatchResult } from './game/ClientModels';
const route = useRoute();
const localMatchId = ref<number>();
const localResults = ref<MatchResult[]>();
const localWinner = ref<MatchResult | null>();
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

const fetchWinner = async () => {
   const winner = findWinner(localResults.value);
   if(winner) {
    localWinner.value = winner;
   }
}
const findWinner = (results: MatchResult[] | undefined) => {
    if(!results) {
        return null;
    }
    let max = results[0];
    if(results.length === 1) {
        return max;
    }
    for(let i = 1; i < results.length; i++) {
        const result = results[i];
        if(result.score > max.score) {
            max = result;
        }
    }
    return max;
}
onMounted(async () => {
    const stringMatchId = route.query.matchId as string;
    localMatchId.value = Number.parseInt(stringMatchId);

    const {results} = await fetchResults(localMatchId.value);

    if(results) {
        localResults.value = results;
    } 
    await fetchWinner();
})
</script>