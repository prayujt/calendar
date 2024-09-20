<script lang="ts">
  import { fade } from 'svelte/transition';

  import type { Event } from '$lib/types';
  import { editEvent } from '$lib/stores';
</script>

<div
  class="fixed inset-0 mx-auto my-auto bg-white bg-opacity-95 rounded-lg shadow-2xl p-2 w-[35%] h-[50%] z-30"
  in:fade={{ duration: 100 }}
  out:fade={{ duration: 75 }}
>
    {#if $editEvent}
        <p>
            {$editEvent.title}
        </p>
    {/if}
</div>
