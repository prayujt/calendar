<script lang="ts">
  import { onMount } from 'svelte';
  import { userInfo } from '$lib/stores';
  import type { IdpUser, User } from '$lib/types';

  let error: string;

  onMount(async () => {
    try {
      const response = await fetch(`https://idp.prayujt.com/sessions/whoami`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const res = await response.json() as IdpUser;
      userInfo.set({
          id: res.identity.id,
          name: `${res.identity.traits.firstName} ${res.identity.traits.lastName}`,
          email: res.identity.traits.email,
      } as User);
    } catch (err: any) {
      error = err.message;
    }
  });
</script>

<p class="text-4xl">Welcome to Prayuj Calendar</p>
<p class="text-lg">You are logged in as {JSON.stringify($userInfo)}</p>

{#if error}
  <p>{error}</p>
{/if}
