<template>
    <Card>
        <CardHeader class="grid grid-cols-2">
            <div>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>Global Leaderboard</CardDescription>
            </div>
            <div class="flex justify-end">
                <Input placeholder="Username" v-model="searchQuery" />
            </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                Username
                            </TableHead>
                            <TableHead>
                                Score
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="(entry) in filteredScores" :key="entry.userId">
                            <TableCell class="font-medium">
                                {{ entry.result.name }}
                            </TableCell>
                            <TableCell class="font-medium">
                                {{ entry.result.score }}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
    </Card>

</template>

<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
import { ChevronDoubleDownIcon } from "@heroicons/vue/24/solid";
import { computed, inject, onMounted, reactive, ref } from "vue";
import { MatchResult } from "./game/ClientModels";
interface MatchResultMap {
    [user_id: string]: MatchResult[];
}
const searchQuery = ref<string>();
const userMatchResults = ref<MatchResultMap>();
const apiUrl = inject('api-url') as string;
const fetchAllMatchResults = async () => {
    try {
        const response = await fetch(`${apiUrl}/api/match-results`, {
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
        return await response.json();
    } catch (err) {
        console.error(err);
    }
}

const filteredScores = computed(() => {
    const scores = highestScores();
    if(!scores) {
        return null;
    }
    if(!searchQuery.value) {
        return scores;
    }
    const val = searchQuery.value;
    return highestScores()?.filter((entry) =>
        entry.result.name.toLowerCase().includes(val.toLowerCase())
      );
})
const highestScores = () => {
    if (!userMatchResults.value) {
        return;
    }
    const scoresMap: MatchResultMap = {};
    Object.entries(userMatchResults.value).forEach(([userId, userResults]) => {
        let highestScoreResult = userResults[0];

        userResults.forEach((result) => {
            if (result.score > highestScoreResult.score) {
                highestScoreResult = result;
            }
        });

        scoresMap[userId] = [highestScoreResult];
    });
    const sortedScores = Object.entries(scoresMap)
        .map(([userId, results]) => ({ userId, result: results[0] }))
        .sort((a, b) => b.result.score - a.result.score);
    console.log(sortedScores);
    return sortedScores;
}
onMounted(async () => {

    const { matchResults } = await fetchAllMatchResults();
    const resultsByUser: MatchResultMap = {};

    if (matchResults && Array.isArray(matchResults)) {
        matchResults.forEach((result) => {
            const { user_id } = result;
            if (!resultsByUser[user_id]) {
                resultsByUser[user_id] = [];
            }
            resultsByUser[user_id].push(result);
        });
        userMatchResults.value = resultsByUser;
    } else {
        console.error("No valid matchResults found.");
    }
});
</script>