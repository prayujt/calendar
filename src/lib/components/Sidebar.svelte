<script lang="ts">
  import prayuj from '$lib/images/PRAYUJ.jpg';

  import { userInfo } from '$lib/stores';

  let isLoaded = false;
</script>

<aside class="fixed shadow h-screen bg-slate-50 w-72 z-50">
    <div class="mt-10 flex flex-col items-center p-1.5">
        <div class="mb-5">
          {#if !$userInfo || $userInfo.name === 'Prayuj Tuli'}
              <img
                  class="w-24 h-24 rounded-full transition-opacity duration-100 ease-in-out"
                  src={prayuj}
                  alt="Prayuj"
                  on:load={() => isLoaded = true}
                  class:opacity-0={!isLoaded}
              />
          {:else}
              <div class="flex items-center justify-center bg-gray-300 rounded-full w-24 h-24 text-3xl text-gray-800">
                  {#if $userInfo.name}
                      {#each $userInfo.name
                        .split(" ")
                        .slice(0, 2) as part}
                        {part.charAt(0).toUpperCase()}
                      {/each}
                  {/if}
              </div>
          {/if}
        </div>
        <p>
            {$userInfo.name}
        </p>
        <p class="mt-2 text-gray-600">
            @{$userInfo.username}
        </p>
    </div>
</aside>
