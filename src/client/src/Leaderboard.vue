<template>
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>
                    User ID
                </TableHead>
                <TableHead>
                    Username
                </TableHead>
                <TableHead>
                    Score
                </TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow v-for="(result,userId) in highestScores":key="userId">
                <TableCell class="font-medium">
                    {{ userId }}
                </TableCell>
                <TableCell class="font-medium">
                    {{ result[0].name }}
                </TableCell>
                <TableCell class="font-medium">
                    {{ result[0].score }}
                </TableCell>
            </TableRow>
        </TableBody>
    </Table>
</template>

<script setup lang="ts">
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
import { computed, inject, onMounted, ref } from "vue";
import { MatchResult } from "./game/ClientModels";
interface MatchResultMap {
    [user_id: string]: MatchResult[];
}
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
const highestScores = computed(() => {
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
    return scoresMap;
})
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