<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

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
  import { Checkbox } from "$lib/scn-components/ui/checkbox";
  import { Label } from "$lib/scn-components/ui/label";
  import * as AlertDialog from "$lib/scn-components/ui/alert-dialog";
  import * as Popover from "$lib/scn-components/ui/popover";

  import { cn } from "$lib/scn-utils";

  import type { Event } from '$lib/types';
  import { editEvent, events, selectedPosition, showEventDetails } from '$lib/stores';
  import { API_HOST } from '$lib/vars';
  import { convertToEvent, fetchEvents } from '$lib/utils';

  import CalendarDropdown from './CalendarDropdown.svelte';

  export let gridDiv: HTMLElement;

  const df = new DateFormatter("en-US", {
    dateStyle: "long"
  });

  let date: DateValue | undefined = undefined;

  let startTime: string;
  let endTime: string;

  let titleComponent: HTMLInputElement;

  let component: HTMLElement;
  let width: number;
  let height: number;

  let top: string | number;
  let left: string | number;

  let savingEvent = false;
  let showRecurringAlert = false;
  let showIncompleteAlert = false;

  onMount(() => {
      titleComponent.focus();
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
    if (!date) {
      date = fromDate($editEvent.date, getLocalTimeZone());
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
  }

  const saveRecurringEvent = async (recurring: boolean) => {
    if (!$editEvent.title || !date || !startTime || !endTime) return;
    const dateString = date.toDate(getLocalTimeZone()).toISOString().split('T')[0]
    const event: Event = {
      ...$editEvent,
      date: new Date(`${dateString} ${startTime}`),
      duration: (new Date(`${dateString} ${endTime}`).getTime() - new Date(`${dateString} ${startTime}`).getTime()) / 60000,
    };

    const response = await fetch(`${API_HOST}/events/${event.id}?recurring=${recurring}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event),
      credentials: 'include',
    });
    if (!response.ok) {
      toast.error("Failed to update event", {
        description: event.title,
      });
      return;
    }
    toast.success("Event has been updated", {
      description: event.title,
    });
    if (recurring) await fetchEvents();
    else events.set([...$events].map((e) => (e.id === event.id ? event : e)));
    editEvent.set(undefined);
    savingEvent = false;
    showEventDetails.set(false);
    showRecurringAlert = false;
  }

  const saveEvent = async () => {
    if (!$editEvent.title || !date || !startTime || !endTime) {
      showIncompleteAlert = true;
      return;
    }
    savingEvent = true;

    const dateString = date.toDate(getLocalTimeZone()).toISOString().split('T')[0]
    const event: Event = {
      ...$editEvent,
      date: new Date(`${dateString} ${startTime}`),
      duration: (new Date(`${dateString} ${endTime}`).getTime() - new Date(`${dateString} ${startTime}`).getTime()) / 60000,
    };

    if (event.id) {
      if (event.recurrenceId) {
        showRecurringAlert = true;
        return;
      }
      const res = await fetch(`${API_HOST}/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event),
        credentials: 'include',
      });
      if (!res.ok) {
        toast.error("Failed to update event", {
          description: event.title,
        });
        return;
      }
      toast.success("Event has been updated", {
        description: event.title,
      });

      events.set([...$events].map((e) => (e.id === event.id ? event : e)));
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
      if (!res.ok) {
        toast.error("Failed to create event", {
          description: event.title,
        });
        return;
      }
      const eventJson = await res.json();
      toast.success("Event has been created", {
        description: event.title,
      });

      if (event.recurring) await fetchEvents();
      else events.set([...$events, convertToEvent(eventJson)]);
    }
    savingEvent = false;
    editEvent.set(undefined);
  };

  $: $editEvent, updateInformation();
  $: component, width = component && component.getBoundingClientRect().width;
  $: component, height = component && component.getBoundingClientRect().height;

  $: $selectedPosition, height, top = calculateTop();
  $: $selectedPosition, width, left = calculateLeft();
</script>

<div
  class={`fixed bg-white rounded-lg shadow-2xl p-2 z-30 ${!$selectedPosition ? 'inset-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-min h-min' : 'w-min h-min min-w-96'}`}
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

                <div class="flex-col mt-4">
                    <div class="mr-2 w-44">
                        <Popover.Root>
                            <Popover.Trigger asChild let:builder>
                                <Button
                                  variant="outline"
                                  class={cn(
                                    "w-max justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                  )}
                                  builders={[builder]}
                                >
                                    <CalendarIcon class="mr-2 h-4 w-4" />
                                    {date ? df.format(date.toDate(getLocalTimeZone())) : "Pick a date"}
                                </Button>
                            </Popover.Trigger>
                            <Popover.Content class="w-auto p-0">
                                <Calendar bind:value={date} initialFocus />
                            </Popover.Content>
                        </Popover.Root>
                    </div>
                    <div class="flex mt-2">
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
                    <div class="flex items-center space-x-2">
                      <Checkbox id="terms" bind:checked={$editEvent.recurring} aria-labelledby="terms-label" />
                      <Label
                        id="terms-label"
                        for="terms"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Recurring
                      </Label>
                    </div>
                {/if}

                <div class="mt-2">
                    <CalendarDropdown bind:selected={$editEvent.calendarId} />
                </div>
            </div>

            <div class="flex w-full mt-auto">
                <div class="ml-auto">
                    <Button
                      variant="ghost"
                      on:click={() => editEvent.set(undefined)}>
                        Cancel
                    </Button>
                    <Button
                      on:click={saveEvent}
                    >
                        {#if $editEvent.id}
                            {#if savingEvent}
                                <LoaderCircle class="mr-2 w-4 h-4 text-white animate-spin" />
                                <p class="text-white">
                                    Saving
                                </p>
                            {:else}
                                <p class="text-white">
                                    Save
                                </p>
                            {/if}
                        {:else}
                            {#if savingEvent}
                                <LoaderCircle class="mr-2 w-4 h-4 text-white animate-spin" />
                                <p class="text-white">
                                    Creating
                                </p>
                            {:else}
                                <p class="text-white">
                                    Create
                                </p>
                            {/if}
                        {/if}
                    </Button>
                </div>
            </div>
        </div>
    {/if}
</div>

<AlertDialog.Root open={showRecurringAlert}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Apply this change to all future events as well?</AlertDialog.Title>
            <AlertDialog.Description>
                This is a recurring event. Selecting Yes will apply this change to all future events as well.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel on:click={async () => await saveRecurringEvent(false)}>No</AlertDialog.Cancel>
            <AlertDialog.Action on:click={async () => await saveRecurringEvent(true)}>Yes</AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root open={showIncompleteAlert}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Missing Information</AlertDialog.Title>
            <AlertDialog.Description>
                Please fill in all the required fields before saving the event.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Action on:click={() => showIncompleteAlert = false}>Ok</AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
