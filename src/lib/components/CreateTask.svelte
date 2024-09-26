<script lang="ts">
  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';

  import { calendars, showCreateTask } from '$lib/stores';
  import { getCalendarsArray } from '$lib/utils';
  import type { Task } from '$lib/types';

  let showCalendarDropdown = false;
  let createTaskLoading = false;

  let titleComponent: HTMLInputElement;

  let task: Task = {
      calendarId: Array.from($calendars.values()).find((calendar) => calendar.isDefault)!.id,
  }

  onMount(() => {
      titleComponent.focus();
  });

  const selectCalendar = (id: string) => {
    task.calendarId = id;
    showCalendarDropdown = false;
  };

  const createTask = async () => {
    createTaskLoading = true;

    try {
      const res = await fetch('/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
        credentials: 'include',
      });

      if (res.ok) {
        showCreateTask.set(false);
      } else {
        console.error('Failed to create task');
      }
    } catch (err) {
      console.error(err);
    }

    createTaskLoading = false;
  };
</script>

<div
  class={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl w-1/3 h-1/2 p-2 z-30`}
  in:fade={{ duration: 100 }}
  out:fade={{ duration: 75 }}
>
    <div class="flex flex-col h-full w-full">
        <div class="h-14 w-full">
            <input
              tabindex="0"
              class="text-lg font-medium pl-1 h-full w-full border-t-transparent border-b-[1px] border-x-transparent border-b-gray-200 focus:outline-none"
              placeholder="Title"
              bind:value={task.title}
              bind:this={titleComponent}
            />
        </div>

        <div class="mt-6">
            <textarea
              class="text-md pl-1 h-32 w-full focus:outline-none resize-none"
              tabindex="0"
              placeholder="Enter task description"
              bind:value={task.description}
            />
        </div>

        {#if showCalendarDropdown}
            <div>
                {#each getCalendarsArray() as calendar (calendar.id)}
                    <button
                      class="mt-2 p-1 flex items-center hover:bg-gray-200 rounded-lg w-full"
                      on:click={() => selectCalendar(calendar.id)}>
                        <div
                          class="rounded-sm w-3 h-3"
                          style="background-color: {calendar.color};">
                        </div>
                        <div class="flex items-center">
                            <p class="text-sm ml-2">
                                {calendar.name}
                            </p>
                            {#if calendar.id === task.calendarId}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="ml-1 size-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            {/if}
                        </div>
                    </button>
                {/each}
            </div>
        {:else}
            <button
              class="mt-2 flex items-center cursor-pointer select-none w-min hover:border border-gray-300 rounded-md p-1 hover:bg-gray-200"
              on:click={() => showCalendarDropdown = !showCalendarDropdown}
              tabindex="0"
            >
                <div
                  class="rounded-sm w-3 h-3"
                  style="background-color: {$calendars.get(task.calendarId).color};">
                </div>
                <p class="text-sm ml-2">{$calendars.get(task.calendarId).name}</p>
            </button>
        {/if}

        <div class="ml-auto mt-auto">
            <button
              class="text-gray-500 rounded-md px-4 py-1 hover:text-gray-600"
              on:click={() => showCreateTask.set(false)}>
                <p class="font-semibold text-md">
                    Cancel
                </p>
            </button>
            <button
              class="bg-blue-600 text-white rounded-md px-4 py-1 hover:bg-blue-700">
                <p class="font-semibold text-md">
                    {createTaskLoading ? 'Creating...' : 'Create'}
                </p>
            </button>
        </div>
    </div>
</div>
