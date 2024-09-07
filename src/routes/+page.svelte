<script lang="ts">
  import { onMount } from 'svelte';
  import { commandMenuOpen, events, userInfo } from '$lib/stores';
  import type { IdpUser, User } from '$lib/types';
  import { convertToEvent } from '$lib/utils';

  import Sidebar from '$components/Sidebar.svelte';
  import CalendarWeek from '$components/CalendarWeek.svelte';

  import { Command } from 'cmdk-sv';

  let search = '';
  let value = 'create new event...';

  let pages: string[] = [];
  let page: string | undefined = undefined;

  let eventGenerationLoading = false;
  let eventGenerationError = false;

  $: page = pages[pages.length - 1]

  onMount(async () => {
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
          avatar: res.identity.traits.avatar,
      } as User);
    } catch (err: any) {
      userInfo.set({
        id: '',
        name: 'Prayuj Tuli',
        email: 'prayujtuli@hotmail.com',
        username: 'prayujt',
        avatar: 'https://static.prayujt.com/images/PRAYUJ.jpg'
      } as User);
    }
  });

  const keyPressEvent = async (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      commandMenuOpen.update((prev) => !prev);
    }
    else if (event.key === 'Escape' || (event.key === 'Backspace' && !search)) {
      event.preventDefault();
      if (pages.length > 0) {
        const newPages = pages.slice(0, -1);
        pages = newPages;
        value = 'create new event...';
      } else commandMenuOpen.set(false);
    }
    else if (search && page == 'newEvent') {
      eventGenerationError = false;
      if (event.key === 'Enter') {
          eventGenerationLoading = true;
          try {
              const eventResponse  = await fetch(`https://api.calendar.prayujt.com/events/generate`, {
                method: 'POST',
                body: JSON.stringify({ content: search }),
                credentials: 'include',
              })
              const eventJson = await eventResponse.json();
              events.set([...$events, convertToEvent(eventJson)]);
              commandMenuOpen.set(false);
              pages = [];
              search = '';
              eventGenerationLoading = false;
          } catch (error) {
              console.error('Error creating new event:', error);
              eventGenerationLoading = false;
              eventGenerationError = true;
          }
      }
    }
  };
</script>

<svelte:head>
    <title>Calendar</title>
</svelte:head>

<svelte:window on:keydown={keyPressEvent} />

<Command.Dialog
  class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
  open={$commandMenuOpen}
  on:close={() => commandMenuOpen.set(false)}
  bind:value={value}
  label="Command Menu"
>
    <div class={`bg-white rounded-lg shadow-lg h-1/2 w-1/3 overflow-y-auto`}>
        <Command.Input
          bind:value={search}
          class="selection:text-white selection:bg-orange-500 text-lg mt-4 mx-3 w-[calc(100%-1.5rem)] focus:outline-none focus:border-transparent"
          style="caret-color: blue;"
          placeholder={page == 'newEvent' ? "Begin typing..." : "What do you need?"}
        />
        <Command.Separator class="mt-4 border-t border-gray-200" />
        <Command.List class="">
            {#if !page}
                <Command.Empty class="m-4 text-gray-500">
                  No results found.
                </Command.Empty>
                <Command.Group heading="Events" class="m-4 text-sm text-gray-500">
                    <Command.Item
                      onSelect={() => { pages = [...pages, 'newEvent']; search = ''; }}
                      class={`rounded-lg mt-1 -mx-1 py-3 text-md text-gray-800 ${value === 'create new event...' && 'bg-gray-100'} hover:bg-gray-100`}>
                        <div class="ml-4 flex">
                            <svg
                              class="w-5 h-5"
                              fill="none"
                              shape-rendering="geometricPrecision"
                              stroke="currentColor"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="1.5"
                              viewBox="0 0 24 24"
                              >
                                  <path d="M12 5v14"></path>
                                  <path d="M5 12h14"></path>
                            </svg>
                            <p class="ml-2">
                                Create New Event...
                            </p>
                        </div>
                    </Command.Item>
                </Command.Group>
            {:else if page == 'newEvent'}
                <p class="text-md m-4 text-gray-500">
                    Provide some details about the event you want to create.
                </p>
                {#if eventGenerationLoading}
                    <div class="flex flex-col justify-center items-center h-40">
                        <p class='text-gray-500 text-md mb-6'>Generating event...</p>
                        <div class='flex space-x-2 justify-center items-center'>
                            <div class='h-4 w-4 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                            <div class='h-4 w-4 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                            <div class='h-4 w-4 bg-blue-400 rounded-full animate-bounce'></div>
                        </div>
                    </div>
                {/if}
                {#if eventGenerationError}
                    <div class="flex flex-col items-center mt-12">
                        <p class='text-red-500 text-md mb-6'>There was an error...</p>
                        <p class='text-gray-500 text-md'>Please try again</p>
                    </div>
                {/if}
            {/if}
        </Command.List>
    </div>
</Command.Dialog>

<div class="md:grid md:grid-cols-[15%_85%]">
    <div class="md:block hidden">
        <Sidebar />
    </div>

    <div>
        <CalendarWeek />
    </div>
</div>
