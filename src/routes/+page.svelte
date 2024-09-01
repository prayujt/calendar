<script lang="ts">
  import { onMount } from 'svelte';
  import { userInfo } from '$lib/stores';
  import type { IdpUser, User } from '$lib/types';

  import Sidebar from '$components/Sidebar.svelte';
  import CalendarWeek from '$components/CalendarWeek.svelte';

  onMount(async () => {
    try {
      const test = await fetch(`https://api.calendar.prayujt.com/events`, {
        credentials: 'include',
      })
      console.log(test);
      console.log(await test.json());
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

</script>

<svelte:head>
    <title>Calendar</title>
</svelte:head>

<div class="md:grid md:grid-cols-[15%_85%]">
    <div class="md:block hidden">
        <Sidebar />
    </div>

    <div>
        <CalendarWeek />
    </div>
</div>
