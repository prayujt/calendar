<script lang="ts">
  import { onMount } from 'svelte';
  import { userInfo } from '$lib/stores';
  import type { IdpUser, User } from '$lib/types';

  import Sidebar from '$components/Sidebar.svelte';

  let error: string;

  let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let hours: string[] = [];

  onMount(async () => {
    let tempHours: string[] = [];
    for (let i = 1; i < 12; i++) {
      tempHours.push(`${i}AM`);
    }
    for (let i = 1; i < 12; i++) {
      tempHours.push(`${i}PM`);
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
      error = err.message;
    }
  });

</script>

<Sidebar />

<div class="ml-72 grid grid-cols-8 grid-rows-[auto_1fr]">
    <div class="p-2 text-center"></div>
    {#each daysOfWeek as day}
        <div class="bg-gray-100 p-2 text-center border-l border-b border-gray-300">{day}</div>
    {/each}

    <!-- Calendar Grid -->
    {#each hours as hour}
        <div class="p-2 text-center">{hour}</div>
        {#each daysOfWeek as _}
            <div class="p-2 border-t border-l border-gray-100 bg-white hover:bg-gray-100 transition-colors cursor-pointer">

            </div>
        {/each}
    {/each}
</div>
