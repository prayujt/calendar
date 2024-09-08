<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    import { selectedCalendars, tasks } from '../stores';
    import { getDateString, getTimeString } from '../utils';

    let displayedTasks: Task[];
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
                id: '3',
                calendarId: '70e3c9da-e063-4306-8663-8ec3718b001a',
                title: 'Finish iOS bugs before release',
                description: 'Issues with the timeline page',
                deadline: new Date('2024-09-24'),
            },
            {
                id: '4',
                calendarId: '70e3c9da-e063-4306-8663-8ec3718b001a',
                title: 'Finish iOS bugs before release',
                description: 'Issues with the timeline page',
                deadline: new Date('2024-09-24'),
            },
            {
                id: '5',
                calendarId: '70e3c9da-e063-4306-8663-8ec3718b001a',
                title: 'Finish iOS bugs before release',
                description: 'Issues with the timeline page',
                deadline: new Date('2024-09-24'),
            },
            {
                id: '6',
                calendarId: '70e3c9da-e063-4306-8663-8ec3718b001a',
                title: 'Finish iOS bugs before release',
                description: 'Issues with the timeline page',
                deadline: new Date('2024-09-24'),
            },
            {
                id: '7',
                calendarId: '70e3c9da-e063-4306-8663-8ec3718b001a',
                title: 'Finish iOS bugs before release',
                description: 'Issues with the timeline page',
                deadline: new Date('2024-09-24'),
            },
            {
                id: '8',
                calendarId: '70e3c9da-e063-4306-8663-8ec3718b001a',
                title: 'Finish iOS bugs before release',
                description: 'Issues with the timeline page',
                deadline: new Date('2024-09-24'),
            },
            {
                id: '9',
                calendarId: 'e2b95734-9689-4995-9bf2-38741e871d53',
                title: 'Finish CNT4007 Homework',
                description: 'Big assignment, need to start early',
                deadline: new Date(),
            },
            {
                id: '10',
                calendarId: '390c5ec0-796c-4811-a652-8e6f4dd90d32',
                title: 'Finish iOS bugs before release',
                description: 'Issues with the timeline page',
                deadline: new Date('2024-09-24'),
            },
        ])
    });

    $: displayedTasks = $tasks.filter(task => $selectedCalendars.has(task.calendarId));
</script>

<div class="flex flex-col items-center mb-4 w-full h-full">
    <p class="text-sm text-gray-600 mb-2 select-none">Tasks</p>
    <div
        class="no-scrollbar border-2 border-bg-gray-600 rounded-lg shadow-lg w-full h-[30rem] overflow-y-auto"
        on:wheel={(e) => e.stopPropagation()}
    >
        {#if displayedTasks.length === 0}
            <p
              class="mt-4 text-center text-sm text-gray-600 m-2"
              transition:fade={{duration: 200}}
            >
                No tasks to show
            </p>
        {/if}

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
