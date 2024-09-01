<script lang="ts">
  import { onMount } from 'svelte';

  import type { Event, EventPosition } from '$lib/types';
  import { getTimeRange } from '$lib/utils';

  export let event: Event;
  export let position: EventPosition;

  onMount(() => {});
</script>

<div class="fixed" style="top: {position.top}px; left: {position.left}px">
  <div
    style="height: {position.height}px; width: {position.width}px;"
    class={`shadow-lg cursor-pointer transition-fade fixed rounded-md border overflow-hidden z-20 select-none ${event.accepted ? 'bg-blue-300' : 'bg-white'}`}
    >
    <div class="flex flex-col h-full p-2">
      <div class="overflow-hidden">
        <p class="text-xs font-semibold">{event.title}</p>
      </div>
      <p class="text-xs">{getTimeRange(event.date, event.duration)}</p>
    </div>
  </div>
</div>
