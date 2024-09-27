<script lang="ts">
  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';

  import LoaderCircle from "lucide-svelte/icons/loader-circle";

  import { Button } from "$lib/scn-components/ui/button";

  import { calendars, showCreateTask } from '$lib/stores';
  import type { Task } from '$lib/types';

  import CalendarDropdown from './CalendarDropdown.svelte';

  let createTaskLoading = false;

  let titleComponent: HTMLInputElement;

  let task: Task = {
      calendarId: Array.from($calendars.values()).find((calendar) => calendar.isDefault)!.id,
  }

  onMount(() => {
      titleComponent.focus();
  });

  const createTask = async () => {
    createTaskLoading = true;

    return;
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

        <div class="mt-2">
            <CalendarDropdown bind:selected={task.calendarId} />
        </div>

        <div class="ml-auto mt-auto">
            <Button
              variant="ghost"
              on:click={() => showCreateTask.set(false)}>
                Cancel
            </Button>
            <Button on:click={createTask}>
                {#if createTaskLoading}
                    <LoaderCircle class="mr-2 w-4 h-4 text-white animate-spin" />
                {/if}
                <p class="text-white">
                    Create
                </p>
            </Button>
        </div>
    </div>
</div>
