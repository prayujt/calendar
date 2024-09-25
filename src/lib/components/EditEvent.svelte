<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  import type { CreateEvent } from '$lib/types';
  import { editEvent, events, selectedPosition } from '$lib/stores';
  import { API_HOST } from '$lib/vars';
  import { convertToEvent } from '$lib/utils';

  export let gridDiv: HTMLElement;

  let date: string;
  let startTime: string;
  let endTime: string;

  let titleComponent: HTMLInputElement;

  let component: HTMLElement;
  let width: number;
  let height: number;

  let top: number;
  let left: number;

  onMount(() => {
    titleComponent.focus();
  })

  const calculateTop = () => {
    const temp = $selectedPosition.top - height / 4;
    if (temp + height > gridDiv.getBoundingClientRect().bottom)
      return gridDiv.getBoundingClientRect().bottom - height - 10;
    if (temp < gridDiv.getBoundingClientRect().top)
      return gridDiv.getBoundingClientRect().top + 10;
    return temp;
  };

  const calculateLeft = () => {
    const temp = $selectedPosition.left - width - 10;
    if (temp < gridDiv.getBoundingClientRect().left)
      return $selectedPosition.left + $selectedPosition.width + 10;
    return temp;
  };

  const updateInformation = () => {
    if (!$editEvent) return;
    date = $editEvent.date.toLocaleDateString('en-CA');
    startTime = $editEvent.date.toLocaleTimeString('en-CA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    endTime = new Date($editEvent.date.getTime() + $editEvent.duration * 60000).toLocaleTimeString('en-CA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  const saveEvent = async () => {
    if (!$editEvent.title) {
      return;
    }
    const event: Event = {
      ...$editEvent,
      date: new Date(`${date} ${startTime}`),
      duration: (new Date(`${date} ${endTime}`).getTime() - new Date(`${date} ${startTime}`).getTime()) / 60000,
    };

    if (event.id) {
      await fetch(`${API_HOST}/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      events.set([...$events].map((e) => (e.id === event.id ? event : e)));
    }
    else {
      const createEvent: CreateEvent = {
        ...event,
        recurring: false
      }
      const res = await fetch(`${API_HOST}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createEvent)
      });
      const eventJson = await res.json();
      events.set([...$events, convertToEvent(eventJson)]);
    }
    editEvent.set(undefined);
  };

  $: $editEvent, updateInformation();
  $: component, width = component && component.getBoundingClientRect().width;
  $: component, height = component && component.getBoundingClientRect().height;

  $: $selectedPosition, height, top = calculateTop();
  $: $selectedPosition, width, left = calculateLeft();
</script>

<div
  class="fixed bg-white rounded-lg shadow-2xl p-2 w-96 h-96 z-30"
  style="top: {top}px; left: {left}px;"
  bind:this={component}
  in:fade={{ duration: 100 }}
  out:fade={{ duration: 75 }}
>
    {#if $editEvent}
        <div class="pl-1 flex flex-col h-full w-full">
            <div class="w-full">
                <div class="flex w-full items-center">
                    <div class="h-14 w-full">
                        <input
                          tabindex="0"
                          class="text-lg font-medium pl-1 h-full w-full border-t-transparent border-b-[1px] border-x-transparent border-b-gray-200 focus:outline-none"
                          placeholder="Title"
                          bind:value={$editEvent.title}
                          bind:this={titleComponent}
                        />
                    </div>
                    <div class="ml-auto">
                          <button
                            tabindex="-1"
                            class="rounded-full p-1 hover:bg-gray-200"
                            on:click={() => editEvent.set(undefined)}
                          >
                              <svg class="fill-gray-600" width="20" height="20" viewBox="0 0 24 24">
                                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path>
                              </svg>
                          </button>
                    </div>
                </div>

                <div class="flex mt-6">
                    <div>
                      <input
                        class="text-md pl-1 focus:outline-none"
                        tabindex="-1"
                        type="date"
                        bind:value={date}
                        placeholder="YYYY-MM-DD"
                      />
                    </div>
                    <div class="ml-8">
                        <input
                          class="text-md focus:outline-none"
                          tabindex="-1"
                          type="time"
                          bind:value={startTime}
                        />
                    </div>
                    <p class="mx-2">
                       -
                    </p>
                    <div>
                        <input
                          class="text-md text-black focus:outline-none"
                          tabindex="-1"
                          type="time"
                          bind:value={endTime}
                        />
                    </div>
                </div>

                <div class="mt-6">
                    <textarea
                      class="text-md pl-1 h-44 w-full focus:outline-none resize-none"
                      tabindex="0"
                      placeholder="Enter event description"
                      bind:value={$editEvent.description}
                    />
                </div>
            </div>

            <div class="flex w-full mt-auto">
                <div class="ml-auto">
                  <button
                      class="text-gray-500 rounded-md px-4 py-1 hover:text-gray-600"
                      on:click={saveEvent}>
                        <p class="font-semibold text-md">
                            Cancel
                        </p>
                    </button>

                    <button
                      class="bg-blue-600 text-white rounded-md px-4 py-1 hover:bg-blue-700"
                      on:click={saveEvent}>
                        <p class="font-semibold text-md">
                            {#if $editEvent.id}
                                Save
                            {:else}
                                Create event
                            {/if}
                        </p>
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>
