<script lang="ts">
  import { fade } from 'svelte/transition';

  import type { Event, EventPosition } from '$lib/types';
  import { getTimeRange } from '$lib/utils';
  import { calendars, eventPositions, gridItemHeight, selectedEvent, selectedPosition, showEventDetails } from '$lib/stores';
  import { API_HOST } from '$lib/vars';

  export let event: Event;
  export let position: EventPosition;

  let initialMouse = 0;
  let initialComponent = 0;
  let mouseDown = false;
  let dragged = false;
  let originalDate: Date;

  const handleMouseDown = (e: MouseEvent) => {
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
      }

      if (dragged) {
        position.top = initialComponent + (Math.round(dy / pixelSnap) * pixelSnap);
        const newDate = new Date(originalDate);
        newDate.setMinutes(newDate.getMinutes() + 5 * Math.round((position.top - initialComponent) / pixelSnap));
        event.date = newDate;
      }
    }
  }

  const handleMouseUp = () => {
    if (!dragged) return;
    console.log('mouse up', event.title)

    mouseDown = false;
    showEventDetails.set(false);

    selectedPosition.set(position);
    eventPositions.update((value) => {
      value.set(event.id, position);
      return value;
    });

    fetch(`${API_HOST}/events/${event.id}`, {
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
  }

  /**
   * Sets the selected event and its position
   * @param event - the event that was clicked
   */
  const setSelectedEvent = (e: Event): void => {
      mouseDown = false;
      if (dragged) {
          dragged = false;
          return;
      }
      if ($selectedEvent && $selectedEvent.id === event.id) {
          showEventDetails.update((value) => !value);
          return;
      }
      selectedEvent.set(e);
      selectedPosition.set($eventPositions.get(e.id));
    showEventDetails.set(true);
  }
</script>

<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />

<div
  class="fixed"
  in:fade={{ duration: 250 }}
  out:fade={{ duration: 100 }}
  style="top: {position.top}px; left: {position.left}px"
  on:mousedown={handleMouseDown}
  on:click={() => setSelectedEvent(event)}
>
    <div
      style="height: {position.height}px; width: {position.width}px; background-color: {$calendars.get(event.calendarId).color};"
      class="shadow-lg cursor-pointer transition-fade rounded-md overflow-hidden z-20 select-none"
    >
        <div class="flex flex-col h-full p-2">
            <div class="overflow-hidden">
                <p class={`text-xs font-semibold line-clamp-${Math.ceil(position.height / 42)}`}>{event.title}</p>
            </div>
            {#if position.height > 42}
                <p class="text-xs">{getTimeRange(event.date, event.duration)}</p>
            {/if}
        </div>
    </div>
</div>
