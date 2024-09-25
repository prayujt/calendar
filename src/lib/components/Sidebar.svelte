<script lang="ts">
    import { onMount } from 'svelte';

    import { calendars, selectedCalendars, userInfo } from '$lib/stores';
    import { getCalendarsArray } from '$lib/utils';

    import SidebarTasks from './SidebarTasks.svelte';

    let isLoaded = false;
    let calendarsMap = new Map<string, boolean>();

    onMount(() => {
        const calendarsArr = getCalendarsArray();
        for (const calendar of calendarsArr) {
            calendarsMap.set(calendar.id, true);
        }
    });

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
            <div class="flex flex-col items-center">
                {#if $userInfo.name}
                    <p class="font-semibold">{$userInfo.name}</p>
                    <p class="mt-2 text-gray-600">@{$userInfo.username}</p>
                {:else}
                    <div class="animate-pulse bg-gray-300 h-4 rounded w-1/2 mb-2"></div>
                    <div class="bg-gray-300 h-4 rounded w-1/3"></div>
                {/if}
            </div>
        </div>

        <div class="grow w-full overflow-hidden">
            <SidebarTasks />
        </div>

        <div class="flex flex-col mt-4 mb-4">
            <p class="text-sm ml-2 mb-2 text-gray-600 select-none">Calendars</p>
            <div>
                {#each getCalendarsArray() as calendar}
                    <div class="flex mb-2 items-center cursor-pointer w-min">
                        <input
                          tabindex="0"
                          type="checkbox"
                          on:click={() => toggleCalendar(calendar.id)}
                          checked={$selectedCalendars.has(calendar.id)}
                          class="cursor-pointer w-4 h-4 border-gray-300 rounded text-white"
                          style={`accent-color: ${calendar.color};`}/>
                            <button on:click={() => toggleCalendar(calendar.id)}>
                                <p class="ms-2 text-sm font-medium text-gray-900">
                                    {calendar.name}
                                </p>
                            </button>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</aside>
