<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    import { selectedCalendars, tasks } from '../stores';
    import { getDateString, getTimeString } from '../utils';

    onMount(() => {
        tasks.set([
            {
                id: '1',
                calendarId: 'fa90ab20-213b-47c2-9f44-4545ff9633a1',
                title: 'Finish CNT4007 Homework',
                description: 'Big assignment, need to start early',
                deadline: new Date(),
            },
            {
                id: '2',
                calendarId: '70e3c9da-e063-4306-8663-8ec3718b001a',
                title: 'Finish iOS bugs before release',
                description: 'Issues with the timeline page',
                deadline: new Date('2024-09-24'),
            },
            {
                id: '2',
                calendarId: '70e3c9da-e063-4306-8663-8ec3718b001a',
                title: 'Finish iOS bugs before release',
                description: 'Issues with the timeline page',
                deadline: new Date('2024-09-24'),
            },
            {
                id: '2',
                calendarId: '70e3c9da-e063-4306-8663-8ec3718b001a',
                title: 'Finish iOS bugs before release',
                description: 'Issues with the timeline page',
                deadline: new Date('2024-09-24'),
            },
            {
                id: '2',
                calendarId: '70e3c9da-e063-4306-8663-8ec3718b001a',
                title: 'Finish iOS bugs before release',
                description: 'Issues with the timeline page',
                deadline: new Date('2024-09-24'),
            },
            {
                id: '2',
                calendarId: '70e3c9da-e063-4306-8663-8ec3718b001a',
                title: 'Finish iOS bugs before release',
                description: 'Issues with the timeline page',
                deadline: new Date('2024-09-24'),
            },
            {
                id: '2',
                calendarId: '70e3c9da-e063-4306-8663-8ec3718b001a',
                title: 'Finish iOS bugs before release',
                description: 'Issues with the timeline page',
                deadline: new Date('2024-09-24'),
            },
            {
                id: '2',
                calendarId: '70e3c9da-e063-4306-8663-8ec3718b001a',
                title: 'Finish iOS bugs before release',
                description: 'Issues with the timeline page',
                deadline: new Date('2024-09-24'),
            },

        ])
    });
</script>

<div class="flex flex-col items-center mb-4 w-full h-full">
    <p class="text-sm text-gray-600 mb-2 select-none">Tasks</p>
    <div
        class="no-scrollbar border-2 border-bg-gray-600 rounded-lg shadow-lg w-full h-[30rem] overflow-y-auto"
        on:wheel={(e) => e.stopPropagation()}
    >
        {#each $tasks as task}
            {#if $selectedCalendars.has(task.calendarId)}
                <div
                    class="border-2 rounded-md p-2 m-2"
                    transition:fade={{duration: 200}}
                >
                    <p class="text-sm">{task.title}</p>
                    <p class="text-xs text-gray-600">{getDateString(task.deadline)} ⋅ {getTimeString(task.deadline)}</p>
                    <p class="text-xs text-gray-600">{task.description}</p>
                </div>
            {/if}
        {/each}
    </div>
</div>
