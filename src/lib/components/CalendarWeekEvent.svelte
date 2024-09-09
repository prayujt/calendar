<script lang="ts">
  import { fade } from 'svelte/transition';

  import type { Event, EventPosition } from '$lib/types';
  import { getTimeRange } from '$lib/utils';
  import { calendars } from '$lib/stores';

  export let event: Event;
  export let position: EventPosition;
</script>

<div
  class="fixed"
  transition:fade={{duration: 250}}
  style="top: {position.top}px; left: {position.left}px"
>
    <div
      style="height: {position.height}px; width: {position.width}px; background-color: {event.accepted ? $calendars.get(event.calendarId).color : 'white'};"
      class="shadow-lg cursor-pointer transition-fade rounded-md border overflow-hidden z-20 select-none"
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
