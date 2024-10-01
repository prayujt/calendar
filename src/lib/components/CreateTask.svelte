<script lang="ts">
  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';

  import { toast } from "svelte-sonner";

  import LoaderCircle from "lucide-svelte/icons/loader-circle";
  import CalendarIcon from "lucide-svelte/icons/calendar";

  import {
    DateFormatter,
    type DateValue,
    fromDate,
    getLocalTimeZone,
  } from "@internationalized/date";

  import { Button } from "$lib/scn-components/ui/button";
  import { Calendar } from "$lib/scn-components/ui/calendar";
  import * as Select from "$lib/scn-components/ui/select";
  import * as Popover from "$lib/scn-components/ui/popover";

  import { cn } from "$lib/scn-utils";

  import { calendars, showCreateTask } from '$lib/stores';
  import { TaskPriority, type Task } from '$lib/types';
  import { fetchTasks } from '$lib/utils';
  import { API_HOST } from '$lib/vars';

  import CalendarDropdown from './CalendarDropdown.svelte';

  let createTaskLoading = false;

  const df = new DateFormatter("en-US", {
    dateStyle: "long"
  });

  let deadlineDate: DateValue | undefined = fromDate(new Date(), getLocalTimeZone());
  let deadlineTime: string = '23:59';

  let titleComponent: HTMLInputElement;

  let task: Task = {
      calendarId: Array.from($calendars.values()).find((calendar) => calendar.isDefault)!.id,
  }

  onMount(() => {
      titleComponent.focus();
  });

  const createTask = async () => {
    if (!task.title) {
      titleComponent.focus();
      return;
    }
    if (!deadlineDate || !deadlineTime) {
      return;
    }
    createTaskLoading = true;

    const dateString = deadlineDate.toDate(getLocalTimeZone()).toLocaleDateString('en-CA');
    const newTask = {
      ...task,
      deadline: new Date(`${dateString} ${deadlineTime}`),
      completed: false,
    };

    try {
      const res = await fetch(`${API_HOST}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
        credentials: 'include',
      });

      if (res.ok) {
        showCreateTask.set(false);
        toast.success('Task created', {
          description: `Task "${task.title}" has been created`,
        });
      } else {
        console.error('Failed to create task');
        toast.error('Failed to create task', {
          description: `Failed to create task "${task.title}"`,
        });
      }
    } catch (err) {
      console.error(err);
    }

    fetchTasks();
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

        <div class="flex gap-2 my-2">
            <div class="w-48">
                <Popover.Root>
                    <Popover.Trigger asChild let:builder>
                        <Button
                          variant="outline"
                          class={cn(
                            "w-full justify-start text-left font-normal",
                            !deadlineDate && "text-muted-foreground"
                          )}
                          builders={[builder]}
                        >
                            <CalendarIcon class="mr-2 h-4 w-4" />
                            {deadlineDate ? df.format(deadlineDate.toDate(getLocalTimeZone())) : "Pick a date"}
                        </Button>
                    </Popover.Trigger>
                    <Popover.Content class="w-auto p-0">
                        <Calendar bind:value={deadlineDate} initialFocus />
                    </Popover.Content>
                </Popover.Root>
            </div>

            <div class="flex items-center relative">
                <svg class="z-20 absolute left-2 w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clip-rule="evenodd"/>
                </svg>
                <input
                  type="time"
                  class="z-10 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg block w-min p-2.5 pl-7 focus:outline-none"
                  min="00:00" max="23:59"
                  bind:value={deadlineTime}
                  required />
            </div>
        </div>

        <div class="flex gap-2">
            <Select.Root
              onSelectedChange={(s) => task.priority = s.value}>
                <Select.Trigger class="w-44">
                    <div class="flex items-center">
                        <Select.Value placeholder="Select priority" />
                    </div>
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value={TaskPriority.LOW}>
                        <div class="flex items-center">
                            <div class="flex items-center">
                                <p class="text-sm ml-2">
                                    Low
                                </p>
                            </div>
                        </div>
                    </Select.Item>
                    <Select.Item value={TaskPriority.MEDIUM}>
                        <div class="flex items-center">
                            <div class="flex items-center">
                                <p class="text-sm ml-2">
                                    Medium
                                </p>
                            </div>
                        </div>
                    </Select.Item>
                    <Select.Item value={TaskPriority.HIGH}>
                        <div class="flex items-center">
                            <div class="flex items-center">
                                <p class="text-sm ml-2">
                                    High
                                </p>
                            </div>
                        </div>
                    </Select.Item>
                </Select.Content>
            </Select.Root>

            <input
              type="number"
              class="border text-gray-800 text-sm rounded-lg block w-40 p-2.5 outline-none focus:outline-none"
              placeholder="Difficulty (1 - 10)"
              bind:value={task.difficulty}
              required />

            <div class="flex w-32 border items-center rounded-lg">
                <input
                  type="number"
                  class="text-gray-800 text-sm block w-16 p-2.5 outline-none focus:outline-none"
                  placeholder="30?"
                  bind:value={task.duration}
                  required />
                <p class="ml-auto mr-2 text-sm text-gray-400">minutes</p>
            </div>

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

<style>
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Firefox */
    input[type=number] {
      -moz-appearance: textfield;
    }
</style>
