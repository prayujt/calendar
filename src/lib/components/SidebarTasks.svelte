<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    import { API_HOST } from '../vars';
    import { calendars, editEvent, showCreateTask, showEventDetails, selectedCalendars, tasks } from '../stores';
    import { getDateString, getTimeString } from '../utils';
    import { TaskPriority, type Task } from '../types';

    import CreateTask from './CreateTask.svelte';

    let displayedTasks: Task[];

    onMount(async () => {
        const tasksReq  = await fetch(`${API_HOST}/tasks`, {
            credentials: 'include',
        })
        const tasksJson = await tasksReq.json();
        tasks.set(tasksJson);
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
    <div class="flex items-center ml-8">
        <p class="text-sm text-gray-600 select-none">Tasks</p>
        <button
          class="bg-blue-700 text-white rounded-lg ml-4 p-1"
          on:click={() => { editEvent.set(undefined); showEventDetails.set(false); showCreateTask.set(true)}}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" class="w-4 h-4">
                <path fill-rule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"></path>
            </svg>
        </button>
    </div>
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
                      class="rounded-sm w-2 h-2 fill-blue"
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

<div>
    {#if $showCreateTask}
        <CreateTask />
    {/if}
</div>
