<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    import { calendars, selectedCalendars, tasks } from '../stores';
    import { getDateString, getTimeString } from '../utils';
    import { TaskPriority, type Task } from '../types';

    let displayedTasks: Task[];

    onMount(() => {
        tasks.set([
            {
                id: '1',
                calendarId: 'fa90ab20-213b-47c2-9f44-4545ff9633a1',
                title: 'Finish CNT4007 Homework',
                description: 'Big assignment, need to start early',
                deadline: new Date(),
                priority: TaskPriority.HIGH,
                completed: false,
            },
            {
                id: '2',
                calendarId: '70e3c9da-e063-4306-8663-8ec3718b001a',
                title: 'Finish iOS bugs before release',
                description: 'Issues with the timeline page',
                deadline: new Date('2024-09-24'),
                priority: TaskPriority.MEDIUM,
                completed: false,
            },
            {
                id: '3',
                calendarId: '70e3c9da-e063-4306-8663-8ec3718b001a',
                title: 'Integrate Stripe Payments into Website',
                description: 'Issues with the timeline page',
                deadline: new Date('2024-09-24'),
                priority: TaskPriority.LOW,
                completed: false,
            },
            {
                id: '1',
                calendarId: 'e2b95734-9689-4995-9bf2-38741e871d53',
                title: 'Finish CNT4007 Homework',
                description: 'Big assignment, need to start early',
                deadline: new Date(),
                priority: TaskPriority.HIGH,
                completed: false,
            },
            {
                id: '2',
                calendarId: '390c5ec0-796c-4811-a652-8e6f4dd90d32',
                title: 'Finish iOS bugs before release',
                description: 'Issues with the timeline page',
                deadline: new Date('2024-09-24'),
                priority: TaskPriority.MEDIUM,
                completed: false,
            },
            {
                id: '3',
                calendarId: '390c5ec0-796c-4811-a652-8e6f4dd90d32',
                title: 'Integrate Stripe Payments into Website',
                description: 'Issues with the timeline page',
                deadline: new Date('2024-09-24'),
                priority: TaskPriority.LOW,
                completed: false,
            },

        ])
    });

    const getStatusColor = (priority: TaskPriority) => {
        if (priority === TaskPriority.HIGH) return 'red-400';
        if (priority === TaskPriority.MEDIUM) return 'yellow-400';
        if (priority === TaskPriority.LOW) return 'green-400';
        return 'gray-400';
    };

    $: displayedTasks = $tasks.filter(task => $selectedCalendars.has(task.calendarId));
</script>

<div class="flex flex-col items-center w-full h-full">
    <p class="text-sm text-gray-600 select-none">Tasks</p>
    <div
      class="no-scrollbar rounded-lg shadow-lg w-full h-full overflow-y-auto"
      on:wheel={(e) => e.stopPropagation()}
    >
        {#if displayedTasks.length === 0}
            <p
              class="mt-4 text-center text-sm text-gray-600 m-2"
              out:fade={{duration: 0}}
              in:fade={{duration: 200}}
            >
                No tasks to show
            </p>
        {/if}

        {#each displayedTasks as task}
            <div
                class={`border-r-8 border-${getStatusColor(task.priority)} rounded-md p-2 m-0.5`}
                out:fade={{duration: 0}}
                in:fade={{duration: 200}}
            >
                <p class="text-sm">{task.title}</p>
                <div class="flex items-center">
                    <div
                      class="rounded-full w-2 h-2 fill-blue"
                      style="background-color: {$calendars.get(task.calendarId).color};">
                    </div>
                    <p class="text-xs ml-2">{$calendars.get(task.calendarId).name}</p>
                </div>

                <p class="text-xs text-gray-600">{getDateString(task.deadline)} ⋅ {getTimeString(task.deadline)}</p>
                <p class="text-xs text-gray-600">{task.description}</p>
            </div>
        {/each}
    </div>
</div>
