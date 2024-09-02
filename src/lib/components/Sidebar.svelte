<script lang="ts">
  import { userInfo } from '$lib/stores';

  let isLoaded = false;
</script>

<aside class="shadow h-screen bg-slate-50 z-50 overflow-hidden" on:wheel={(e) => e.preventDefault()}>
    <div class="mt-10 flex flex-col items-center p-1.5">
        <div class="mb-5">
            {#if $userInfo.avatar}
                {#if !isLoaded}
                    <div class="w-24 h-24 rounded-full bg-gray-300 animate-pulse"></div>
                {/if}
                <img
                    class="w-24 h-24 rounded-full transition-opacity duration-100 ease-in-out"
                    src={$userInfo.avatar}
                    alt="User Avatar"
                    on:load={() => isLoaded = true}
                    class:animate-pulse={!isLoaded}
                    style:display={isLoaded ? 'block' : 'none'}
                />
            {:else}
                <div class="flex items-center justify-center bg-gray-300 rounded-full w-24 h-24 text-3xl text-gray-800">
                    {#if $userInfo.name}
                        {#each $userInfo.name.split(" ").slice(0, 2) as part}
                            {part.charAt(0).toUpperCase()}
                        {/each}
                    {/if}
                </div>
            {/if}
        </div>
        {#if $userInfo.name}
            <p>{$userInfo.name}</p>
            <p class="mt-2 text-gray-600">@{$userInfo.username}</p>
        {:else}
            <div class="animate-pulse bg-gray-300 h-4 rounded w-1/2 mb-2"></div>
            <div class="bg-gray-300 h-4 rounded w-1/3"></div>
        {/if}
    </div>
</aside>
