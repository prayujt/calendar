<script lang="ts">
  import { fade } from 'svelte/transition';
  import { onDestroy, onMount } from 'svelte';

  import { toast } from "svelte-sonner";

  import * as AlertDialog from "$lib/scn-components/ui/alert-dialog";

  import type { Event, EventPosition } from '$lib/types';
  import { fetchEvents, getTimeRange } from '$lib/utils';
  import { calendars, dragging, editEvent, eventPositions, gridItemHeight, selectedEvent, selectedPosition, showCreateTask, showEventDetails } from '$lib/stores';
  import { API_HOST } from '$lib/vars';

  export let event: Event;
  export let position: EventPosition;

  let initialMouse = 0;
  let initialComponent = 0;
  let mouseDown = false;
  let dragged = false;
  let originalDate: Date;

  let showRecurringAlert = false;

  const handleMouseDown = (e: MouseEvent) => {
    if ($showCreateTask) return;
    showEventDetails.set(false);
    initialMouse = e.clientY;
    initialComponent = position.top;
    originalDate = new Date(event.date);
    mouseDown = true;
    dragged = false;
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (mouseDown) {
      const dy = e.clientY - initialMouse;
      const pixelSnap = $gridItemHeight / 12;

      if (Math.abs(dy) > pixelSnap * 2) {
        dragged = true;
        dragging.set(event.id);
      }

      if (dragged) {
        position.top = initialComponent + (Math.round(dy / pixelSnap) * pixelSnap);
        const newDate = new Date(originalDate);
        newDate.setMinutes(newDate.getMinutes() + 5 * Math.round((position.top - initialComponent) / pixelSnap));
        event.date = newDate;

        selectedPosition.set(position);
        eventPositions.update((value) => {
          value.set(event.id, position);
          return value;
        });
      }
    }
  }

  const confirmRecurringUpdate = async (recurring: boolean) => {
    const res = await fetch(`${API_HOST}/events/${event.id}?recurring=${recurring}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...event,
        date: event.date
      }),
      credentials: 'include',
    });
    if (!res.ok) {
      toast.error("Failed to update event time", {
        description: event.title,
      });
      return;
    }
    toast.success("Event time has been updated", {
      description: event.title,
    });

    if (recurring) await fetchEvents();
  }

  const handleMouseUp = async () => {
    if (!dragged) return;

    mouseDown = false;
    showEventDetails.set(false);

    selectedPosition.set(position);
    eventPositions.update((value) => {
      value.set(event.id, position);
      return value;
    });
    dragging.set(undefined);

    if (event.recurrenceId) {
      showRecurringAlert = true;
      return;
    }
    const res = await fetch(`${API_HOST}/events/${event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        ...event,
        date: event.date
      }),
      credentials: 'include',
    });

    if (!res.ok) {
      toast.error("Failed to update event time", {
        description: event.title,
      });
    }
    toast.success("Event time has been updated", {
      description: event.title,
    });
  }

  /**
   * Sets the selected event and its position
   * @param event - the event that was clicked
   */
  const setSelectedEvent = (e: Event): void => {
    if ($showCreateTask) return;
    mouseDown = false;
    if (dragged) {
        dragged = false;
        return;
    }
    if ($editEvent) return;
    selectedEvent.set(e);
    selectedPosition.set($eventPositions.get(e.id));
    showEventDetails.set(true);
  }

  onMount(() => {
    window.addEventListener('resize', () => {
      if ($selectedEvent && $selectedEvent.id === event.id) selectedPosition.set($eventPositions.get(event.id))
    });
  })

  onDestroy(() => {
      typeof window !== 'undefined' && window.removeEventListener('resize', () => {
        if ($selectedEvent && $selectedEvent.id === event.id) selectedPosition.set($eventPositions.get(event.id))
      });
  });
</script>

<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />

<div
  class={`fixed hover:shadow-md transition-shadow hover:opacity-100 bg-white opacity-95 transition-opacity ${dragged ? 'z-30' : 'z-20'}`}
  in:fade={{ duration: 250 }}
  out:fade={{ duration: 100 }}
  style="top: {position.top}px; left: {position.left}px"
  on:mousedown={handleMouseDown}
  on:click={() => setSelectedEvent(event)}
>
    <div
      style="height: {position.height}px; width: {position.width}px; background-color: {$calendars.get(event.calendarId).color}"
      class="shadow-lg cursor-pointer transition-fade rounded-md overflow-hidden select-none bg-blue-200"
    >
        <div class="flex flex-col h-full p-2">
            <div class="overflow-hidden">
                <p class={`text-xs font-semibold line-clamp-${Math.ceil(position.height / 42)}`}>{event.title}</p>
            </div>
            {#if position.height > 42 && position.width > 110}
                <p class="text-xs">{getTimeRange(event.date, event.duration)}</p>
            {/if}
        </div>
    </div>
</div>

<AlertDialog.Root open={showRecurringAlert}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Change the time for all future events as well?</AlertDialog.Title>
            <AlertDialog.Description>
                This is a recurring event. Selecting Yes will apply this change to all future events as well.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel on:click={async () => await confirmRecurringUpdate(false)}>No</AlertDialog.Cancel>
            <AlertDialog.Action on:click={async () => await confirmRecurringUpdate(true)}>Yes</AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
