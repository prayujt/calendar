<script lang="ts">
  import { fade } from 'svelte/transition';

  import { toast } from 'svelte-sonner';

  import Button from '$lib/scn-components/ui/button/button.svelte';
  import * as Command from "$lib/scn-components/ui/command";

  import { API_HOST } from '$lib/vars';
  import { allUsers, calendars, selectedCalendar, showCalendarDetails } from '$lib/stores';

  let allUsersArr = [...$allUsers.values()];

  const updateCalendar = async () => {
    const calendarResponse = await fetch(`${API_HOST}/calendars/${$selectedCalendar.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify($selectedCalendar),
    });
    let calendarJson = await calendarResponse.json();
    if (!calendarResponse.ok) {
      toast.error("Failed to update calendar", {
        description: calendarJson.name,
      });
      return
    }
    const tempCalendars = $calendars;
    tempCalendars.set($selectedCalendar.id, {
        ...tempCalendars.get($selectedCalendar.id),
        name: calendarJson.name,
        color: calendarJson.color,
    });
    calendars.set(tempCalendars);
    toast.success("Calendar updated", {
        description: calendarJson.name,
    });
    showCalendarDetails.set(false);
  };

  const inviteUser = async (name: string) => {
    const user = allUsersArr.find((user) => `${user.firstName} ${user.lastName}` === name);
    if (!user) {
      return;
    }
    const calendarResponse = await fetch(`${API_HOST}/calendars/${$selectedCalendar.id}/members`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user.id }),
    });
    if (!calendarResponse.ok) {
      toast.error("Failed to add user", {
        description: `Failed to invite ${name} to ${$selectedCalendar.name} calendar`,
      });
      return
    }
    else {
      toast.success("User added", {
          description: `${name} invited to ${$selectedCalendar.name} calendar`,
      });
    }
  };
</script>

<div
  class={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl w-1/3 h-1/2 p-2 z-30`}
  in:fade={{ duration: 100 }}
  out:fade={{ duration: 75 }}
>
    <div class="flex flex-col gap-2 h-full">
        <div class="flex flex-col justify-center">
            <p class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</p>
            <input
              type="text"
              class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs"
              bind:value={$selectedCalendar.name}
            />
        </div>
        <div class="flex flex-col justify-center">
            <p class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Color</p>
            <input
              type="text"
              class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs"
              bind:value={$selectedCalendar.color}
            />
        </div>

        <Button on:click={() => updateCalendar()}>
            Save
        </Button>

        <div class="flex mt-4">
            <div class="w-2/5">
                <p class="text-gray-400 mb-2">Members</p>
                {#each $selectedCalendar.members as userId}
                    <div class="flex items-center gap-2 mb-2">
                        <div>
                            {#if $allUsers.get(userId).avatar}
                                <img
                                    class="w-8 h-8 rounded-full transition-opacity duration-100 ease-in-out"
                                    src={$allUsers.get(userId).avatar}
                                    alt="User Avatar"
                                />
                            {:else}
                                <div class="flex items-center justify-center bg-gray-300 rounded-full w-8 h-8 text-3xl text-gray-800">
                                    {#if $allUsers.get(userId).firstName && $allUsers.get(userId).lastName}
                                        <p class="text-sm">{$allUsers.get(userId).firstName.charAt(0).toUpperCase()}</p>
                                        <p class="text-sm">{$allUsers.get(userId).lastName.charAt(0).toUpperCase()}</p>
                                    {/if}
                                </div>
                            {/if}
                        </div>
                        <p>{$allUsers.get(userId).firstName} {$allUsers.get(userId).lastName}</p>
                    </div>
                {/each}
            </div>

            <div class="w-3/5">
                <Command.Root>
                    <Command.Input placeholder="Add users..." />
                    <Command.Empty>No user found.</Command.Empty>
                    <Command.Group>
                        {#each allUsersArr as user}
                            <Command.Item
                              value={`${user.firstName} ${user.lastName}`}
                              onSelect={(name) => inviteUser(name)}>
                                <div class="flex items-center gap-2">
                                    <div>
                                        {#if user.avatar}
                                            <img
                                                class="w-6 h-6 rounded-full transition-opacity duration-100 ease-in-out"
                                                src={user.avatar}
                                                alt="User Avatar"
                                            />
                                        {:else}
                                            <div class="flex items-center justify-center bg-gray-300 rounded-full w-6 h-6 text-3xl text-gray-800">
                                                {#if user.firstName && user.lastName}
                                                    <p class="text-xs">{user.firstName.charAt(0).toUpperCase()}</p>
                                                    <p class="text-xs">{user.lastName.charAt(0).toUpperCase()}</p>
                                                {/if}
                                            </div>
                                        {/if}
                                    </div>
                                    <p class="text-md">
                                        {user.firstName} {user.lastName}
                                    </p>
                                </div>
                            </Command.Item>
                        {/each}
                    </Command.Group>
                </Command.Root>
            </div>
        </div>

        <div class="mt-auto mr-auto">
            <Button
              variant="ghost"
              on:click={() => showCalendarDetails.set(false)}>
                Cancel
            </Button>
        </div>
    </div>
</div>
