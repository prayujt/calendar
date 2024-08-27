<script lang="ts">
  import { onMount } from 'svelte';
  import { userInfo } from '$lib/stores';
  import type { IdpUser, User } from '$lib/types';

  import Sidebar from '$components/Sidebar.svelte';

  let daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  let hours: string[] = [];

  let scrollTopElement: HTMLElement;

  const scrollToStart = () => {
    if (scrollTopElement)
      scrollTopElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  onMount(async () => {
    let tempHours: string[] = ['12 AM'];
    for (let i = 1; i < 12; i++) {
      tempHours.push(`${i} AM`);
    }
    for (let i = 1; i < 12; i++) {
      tempHours.push(`${i} PM`);
    }
    hours = tempHours;
    try {
      const response = await fetch(`https://idp.prayujt.com/sessions/whoami`, {
        credentials: 'include',
      });

      const res = await response.json() as IdpUser;
      userInfo.set({
          id: res.identity.id,
          name: `${res.identity.traits.firstName} ${res.identity.traits.lastName}`,
          email: res.identity.traits.email,
          username: res.identity.traits.username,
      } as User);
    } catch (err: any) {
      userInfo.set({
        id: '',
        name: 'Prayuj Tuli',
        email: 'prayujtuli@hotmail.com',
        username: 'prayujt',
      } as User);
    }

  });

 $: scrollTopElement, scrollToStart();
</script>

<svelte:head>
    <title>Calendar</title>
</svelte:head>

<Sidebar />

<div class="ml-72 flex flex-col h-screen">
    <div class="ml-20 grid grid-cols-7">
        {#each daysOfWeek as day}
            <div class="p-2 text-center">{day}</div>
        {/each}
    </div>

    <div class="flex-1 overflow-auto">
        {#each hours as hour}
            <div class="flex">
                <div class="text-xs text-gray-600 mr-2 ml-2 w-16 text-center">
                    {hour}
                </div>

                {#each daysOfWeek as day}
                  {#if hour === '8 AM' && day === 'SUN'}
                    <div
                      class="hour-card flex-1 p-2 border-t border-l border-gray-100 bg-white hover:bg-gray-100 transition-colors cursor-pointer"
                      bind:this={scrollTopElement}>
                    </div>
                  {:else}
                    <div class="hour-card flex-1 p-2 border-t border-l border-gray-100 bg-white hover:bg-gray-100 transition-colors cursor-pointer">
                    </div>
                  {/if}
                {/each}
            </div>
        {/each}
    </div>
</div>

<style>
  .hour-card {
    min-height: 75px;
    max-height: 100px;
  }
</style>
