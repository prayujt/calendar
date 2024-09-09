<script lang="ts">
    import { calendars, selectedCalendars, userInfo } from '$lib/stores';
    import { getCalendarsArray } from '$lib/utils';

    import SidebarTasks from './SidebarTasks.svelte';

    let isLoaded = false;

    const toggleCalendar = (id: string) => {
        const tempSelected = new Set($selectedCalendars);
        if (tempSelected.has(id)) tempSelected.delete(id);
        else tempSelected.add(id);
        selectedCalendars.set(tempSelected);
    };

    $: $calendars, selectedCalendars.set(new Set<string>([
        ...$calendars.keys(),
    ]));
</script>

<aside class="flex justify-center shadow h-screen bg-slate-100 z-50 overflow-hidden" on:wheel={(e) => e.preventDefault()}>
    <div class="mt-4 flex flex-col items-center p-1.5 w-full">
        <div class="mb-4">
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
        <div class="mb-6">
            {#if $userInfo.name}
                <p>{$userInfo.name}</p>
                <p class="mt-2 text-gray-600">@{$userInfo.username}</p>
            {:else}
                <div class="animate-pulse bg-gray-300 h-4 rounded w-1/2 mb-2"></div>
                <div class="bg-gray-300 h-4 rounded w-1/3"></div>
            {/if}
        </div>

        <div class="grow w-full overflow-hidden">
            <SidebarTasks />
        </div>

        <div class="flex flex-col items-center mt-4 mb-4">
            <p class="text-sm text-gray-600 mb-2 select-none">Calendars</p>
            {#each getCalendarsArray() as calendar}
                <div class="text-center min-w-28 max-w-36 mb-1">
                    <div
                        class={`${$selectedCalendars.has(calendar.id) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'} rounded-md cursor-pointer select-none transition-colors duration-250 ease-in-out px-2 py-1`}
                        on:click={() => toggleCalendar(calendar.id)}
                    >
                        <p class="text-sm">{calendar.name}</p>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</aside>
