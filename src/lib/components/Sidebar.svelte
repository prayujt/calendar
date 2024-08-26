<script lang="ts">
  import prayuj from '$lib/images/PRAYUJ.jpg';

  import { userInfo } from '$lib/stores';
</script>

<aside class="fixed shadow h-screen bg-slate-50 w-72 z-50">
    <div class="mt-10 flex flex-col items-center p-1.5">
        {#if !$userInfo || $userInfo.name === 'Prayuj Tuli'}
            <img class="w-24 h-24 mb-5 rounded-full" src={prayuj} alt="Prayuj" />
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
        <p>
            {$userInfo.name}
        </p>
        <p class="mt-2 text-gray-600">
            @{$userInfo.username}
        </p>
    </div>
</aside>
