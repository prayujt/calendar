<script lang="ts">
  import { onMount } from 'svelte';

  import type { Event, EventPosition } from '$lib/types';
  import { getTimeRange } from '$lib/utils';

  export let event: Event;
  export let position: EventPosition;

  onMount(() => {});
</script>

<div
  style="top: {position.top}px; left: {position.left}px; height: {position.height}px; width: {position.width}px;"
  class={`transition-fade fixed h-full rounded-md border overflow-hidden z-20 ${event.accepted ? 'bg-blue-200' : 'bg-gray-400'}`}>
  <div class="flex items-center space-x-2 p-2">
    <div>
      <h3 class="text-lg font-semibold">{event.title}</h3>
      <p class="text-sm">{getTimeRange(event.date, event.duration)}</p>
    </div>
  </div>
</div>

<style>

</style>
