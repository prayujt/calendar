<script lang="ts">
  import { onMount } from 'svelte';
  import type { Event, EventPosition } from '$lib/types';

  export let event: Event;
  export let position: EventPosition;

  onMount(() => {});

 $: console.log(event);
</script>

<div class="fixed bg-white rounded-lg shadow-lg p-2" style="top: {position.top}px; left: {position.left - 250}px;">
    <p>{event.title}</p>
</div>
