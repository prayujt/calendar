<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    import { toast } from "svelte-sonner";

    import * as Tooltip from "$lib/scn-components/ui/tooltip";
    import { Button } from "$lib/scn-components/ui/button";

    import { calendars, editEvent, showCreateTask, showEventDetails, selectedCalendars, tasks } from '../stores';
    import { fetchTasks, getDateString, getTimeString } from '../utils';
    import { TaskPriority, type Task } from '../types';
    import { API_HOST } from '../vars';

    import CreateTask from './CreateTask.svelte';

    let displayedTasks: Task[];

    onMount(() => {
        fetchTasks();
    });

    const completeTask = async (task: Task) => {
        const res = await fetch(`${API_HOST}/tasks/${task.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
            credentials: 'include',
        });
        if (res.ok) {
            toast.success(`Task marked as ${task.completed ? 'completed' : 'incomplete'}`, {
                description: `Task "${task.title}" has been marked as ${task.completed ? 'completed' : 'incomplete'}`,
            });
            fetchTasks();
        }
        else {
            toast.error('Failed to mark task as completed', {
                description: `Failed to mark task "${task.title}" as ${task.completed ? 'completed' : 'incomplete'}`,
            });
        }
    };

    const deleteTask = async (task: Task) => {
        const res = await fetch(`${API_HOST}/tasks/${task.id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (res.ok) {
            toast.success('Task deleted', {
                description: `Task "${task.title}" has been deleted`,
            });
            fetchTasks();
        }
        else {
            toast.error('Failed to delete task', {
                description: `Failed to delete task "${task.title}"`,
            });
        }
    };

    $: displayedTasks = $tasks.filter(task => $selectedCalendars.has(task.calendarId));
</script>

<div class="flex flex-col items-center w-full h-full">
    <div class="flex items-center ml-8">
        <p class="text-sm text-gray-600 select-none">Tasks</p>

        <Tooltip.Root>
            <Tooltip.Trigger asChild let:builder>
                <Button
                  builders={[builder]}
                  variant="ghost"
                  class="rounded-full p-1 hover:bg-gray-200 ml-2 w-8 h-8"
                  on:click={() => { editEvent.set(undefined); showEventDetails.set(false); showCreateTask.set(true)}}>
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" class="w-4 h-4">
                        <path fill-rule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"></path>
                    </svg>
                </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
                <p>New task</p>
            </Tooltip.Content>
        </Tooltip.Root>
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
                class={`relative group border-r-4 rounded-md p-2 m-0.5 hover:bg-gray-200 transition-colors cursor-pointer ${
                    task.priority === TaskPriority.HIGH
                    ? 'border-red-400'
                    : task.priority === TaskPriority.MEDIUM
                    ? 'border-yellow-400'
                    : task.priority === TaskPriority.LOW
                    ? 'border-green-400'
                    : 'border-gray-400'
                }`}
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

                <p class="text-xs text-gray-600">{getDateString(task.deadline)} ⋅ {getTimeString(true, task.deadline)}</p>
                <p class="text-xs text-gray-600">{task.description}</p>

                <Tooltip.Root>
                    <Tooltip.Trigger asChild let:builder>
                        <Button
                          builders={[builder]}
                          class={`absolute top-2 right-10 w-6 h-6 rounded-full p-1 transition-all bg-gray-600 text-white opacity-0 group-hover:opacity-100 hover:bg-red-400 hover:text-white`}
                          on:click={() => deleteTask(task)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p>
                            Delete task
                        </p>
                    </Tooltip.Content>
                </Tooltip.Root>

                <Tooltip.Root>
                    <Tooltip.Trigger asChild let:builder>
                        <Button
                          builders={[builder]}
                          class={`absolute top-2 right-2 w-6 h-6 rounded-full p-1 transition-all ${task.completed ? 'bg-green-400 text-gray-800 opacity-100 hover:bg-gray-600 hover:text-white' : 'bg-gray-600 text-white opacity-0 group-hover:opacity-100 hover:bg-green-400 hover:text-gray-800'}`}
                          on:click={() => { task.completed = !task.completed; completeTask(task) }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p>
                            {task.completed ? 'Mark as incomplete' : 'Mark as completed'}
                        </p>
                    </Tooltip.Content>
                </Tooltip.Root>
            </div>
        {/each}
    </div>
</div>

<div>
    {#if $showCreateTask}
        <CreateTask />
    {/if}
</div>
