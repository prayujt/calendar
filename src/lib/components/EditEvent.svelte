<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  import type { Event } from '$lib/types';
  import { calendars, editEvent, events, selectedPosition } from '$lib/stores';
  import { API_HOST } from '$lib/vars';
  import { convertToEvent, fetchEvents, getCalendarsArray } from '$lib/utils';

  export let gridDiv: HTMLElement;

  let date: string;
  let startTime: string;
  let endTime: string;

  let titleComponent: HTMLInputElement;

  let component: HTMLElement;
  let width: number;
  let height: number;

  let top: string | number;
  let left: string | number;

  let savingEvent = false;
  let showCalendarDropdown = false;

  onMount(() => {
    titleComponent.focus();
    $editEvent.recurring = false;
  });

  const calculateTop = () => {
    if (!$selectedPosition) return '50%';
    const temp = $selectedPosition.top - height / 4;
    if (temp + height > gridDiv.getBoundingClientRect().bottom)
      return gridDiv.getBoundingClientRect().bottom - height - 10;
    if (temp < gridDiv.getBoundingClientRect().top)
      return gridDiv.getBoundingClientRect().top + 10;
    return temp;
  };

  const calculateLeft = () => {
    if (!$selectedPosition) return '50%';
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
    if (!$editEvent.title || !date || !startTime || !endTime) {
      alert('Please fill in all the fields');
      return;
    }
    savingEvent = true;
    const event: Event = {
      ...$editEvent,
      date: new Date(`${date} ${startTime}`),
      duration: (new Date(`${date} ${endTime}`).getTime() - new Date(`${date} ${startTime}`).getTime()) / 60000,
    };

    if (event.id) {
      let recurring = false;
      if (event.recurrenceId) {
        recurring = confirm('Do you want to update all future events as well?');
      }
      await fetch(`${API_HOST}/events/${event.id}?recurring=${recurring}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event),
        credentials: 'include',
      });

      if (recurring) await fetchEvents();
      else events.set([...$events].map((e) => (e.id === event.id ? event : e)));
    }
    else {
      const res = await fetch(`${API_HOST}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event),
        credentials: 'include',
      });
      const eventJson = await res.json();

      if (event.recurring) await fetchEvents();
      else events.set([...$events, convertToEvent(eventJson)]);
    }
    savingEvent = false;
    editEvent.set(undefined);
  };

  const selectCalendar = (id: string) => {
    $editEvent.calendarId = id;
    showCalendarDropdown = false;
  };

  $: $editEvent, updateInformation();
  $: component, width = component && component.getBoundingClientRect().width;
  $: component, height = component && component.getBoundingClientRect().height;

  $: $selectedPosition, height, top = calculateTop();
  $: $selectedPosition, width, left = calculateLeft();
</script>

<div
  class={`fixed bg-white rounded-lg shadow-2xl p-2 z-30 ${!$selectedPosition ? 'inset-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-min h-min' : 'w-min h-min'}`}
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
                    <div class="flex items-center">
                        <input
                          type="time"
                          class="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 pr-8 focus:outline-none"
                          min="00:00" max="23:59"
                          bind:value={startTime}
                          required />
                        <svg class="-ml-6 w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                    <div class="flex items-center">
                        <p class="mx-2 -mt-1 text-lg">-</p>
                    </div>
                    <div class="flex items-center">
                        <input
                          type="time"
                          class="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 pr-8 focus:outline-none"
                          min="00:00" max="23:59"
                          bind:value={endTime}
                          required />
                        <svg class="-ml-6 w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                </div>

                <div class="mt-6">
                    <textarea
                      class="text-md pl-1 h-32 w-full focus:outline-none resize-none"
                      tabindex="0"
                      placeholder="Enter event description"
                      bind:value={$editEvent.description}
                    />
                </div>
            </div>

            <div class="flex flex-col justify-center">
                {#if !$editEvent.id}
                    <div class="flex items-center mt-2 cursor-pointer w-min">
                        <input
                          tabindex="0"
                          type="checkbox"
                          bind:checked={$editEvent.recurring}
                          class="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"/>
                        <button on:click={() => $editEvent.recurring = !$editEvent.recurring} tabindex="-1">
                            <p class="ms-2 text-sm font-medium text-gray-900">
                                Recurring
                            </p>
                        </button>
                    </div>
                {/if}

                {#if showCalendarDropdown}
                    <div class="flex flex-col justify-center shadow-lg w-min p-2 select-none cursor-pointer">
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
                                    {#if calendar.id === $editEvent.calendarId}
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
                          style="background-color: {$calendars.get($editEvent.calendarId).color};">
                        </div>
                        <p class="text-sm ml-2">{$calendars.get($editEvent.calendarId).name}</p>
                    </button>
                {/if}
            </div>

            <div class="flex w-full mt-auto">
                <div class="ml-auto">
                  <button
                      class="text-gray-500 rounded-md px-4 py-1 hover:text-gray-600"
                      on:click={() => editEvent.set(undefined)}>
                        <p class="font-semibold text-md">
                            Cancel
                        </p>
                    </button>

                    <button
                      class="bg-blue-600 text-white rounded-md px-4 py-1 hover:bg-blue-700"
                      on:click={saveEvent}>
                        <p class="font-semibold text-md">
                            {#if $editEvent.id}
                                {savingEvent ? 'Saving...' : 'Save'}
                            {:else}
                                {savingEvent ? 'Creating...' : 'Create event'}
                            {/if}
                        </p>
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>
