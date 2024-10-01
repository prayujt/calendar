<script lang="ts">
  import { onMount } from 'svelte';
  import { allUsers, calendars, commandMenuOpen, editEvent, events, selectedPosition, userInfo } from '$lib/stores';
  import type { Calendar, Event, IdpUser, User } from '$lib/types';
  import { convertToEvent, fetchEvents, getCalendarsArray, getDateString, getTimeRange } from '$lib/utils';
  import { API_HOST } from '$lib/vars';

  import Sidebar from '$components/Sidebar.svelte';
  import CalendarWeek from '$components/CalendarWeek.svelte';

  import { Command } from 'cmdk-sv';

  let search = '';
  let value = 'create new event...';

  let pages: string[] = [];
  let page: string | undefined = undefined;

  let selectedCalendarId = '';

  let eventGenerationLoading = false;
  let eventGenerationError = false;

  let generatedEvent: Event;

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
    const res = await fetch(`${API_HOST}/users`, {
      credentials: 'include',
    });
    const userJson = await res.json();
    const userMap = new Map<string, User>();
    userJson.forEach((user: User) => userMap.set(user.id, user));
    allUsers.set(userMap);
  });

  const isMac = typeof navigator !== 'undefined' ? navigator.userAgent.includes('Mac') : false;

  const keyPressEvent = async (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'j') event.preventDefault();
    if (event.ctrlKey && event.key === 'k' && $commandMenuOpen) event.preventDefault();

    if ((isMac ? event.metaKey : event.ctrlKey) && event.key === 'k' && !$commandMenuOpen) {
      event.preventDefault();
      commandMenuOpen.set(true);
      pages = [];
      value = '0';
    }
    else if (event.key === 'Escape' || (event.key === 'Backspace' && !search && $commandMenuOpen)) {
      event.preventDefault();
      if (pages.length > 0) {
        const newPages = pages.slice(0, -1);
        pages = newPages;
        value = '0';
      } else commandMenuOpen.set(false);
    }
    else if (page === 'newEvent') {
      if (event.ctrlKey && event.key === 'j') {
        event.preventDefault();
        const val = parseInt(value);
        value = ((val + 1) % getCalendarsArray().length).toString();
      }
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        const val = parseInt(value);
        value = ((val - 1 + getCalendarsArray().length) % getCalendarsArray().length).toString();
      }
    }
    else if (search && page === 'createEvent') {
      eventGenerationError = false;
      if (event.key === 'Enter') {
        eventGenerationLoading = true;
        try {
          if (!selectedCalendarId) {
            const defaultCalendar: Calendar = Array.from($calendars.values()).find((calendar) => calendar.isDefault)
            selectedCalendarId = defaultCalendar.id;
          }

          const eventResponse = await fetch(`${API_HOST}/events/generate`, {
            method: 'POST',
            body: JSON.stringify({
              content: search,
              calendarId: selectedCalendarId,
            }),
            credentials: 'include',
          })
          if (eventResponse.status !== 200) {
            eventGenerationError = true;
            eventGenerationLoading = false;
            return;
          }
          generatedEvent = convertToEvent(await eventResponse.json());
          eventGenerationLoading = false;
          value = '0';
          search = '';
          pages = [...pages, 'approveEvent']
        } catch (error) {
          console.error('Error creating new event:', error);
          eventGenerationLoading = false;
          eventGenerationError = true;
        }
      }
    }
    else if (page === 'approveEvent') {
      if (event.ctrlKey && event.key === 'j') {
        const val = parseInt(value);
        value = ((val + 1) % 2).toString();
      }
      if (event.ctrlKey && event.key === 'k') {
        const val = parseInt(value);
        value = ((val + 1) % 2).toString();
      }
    }
  };

  const submitEvent = async(approve: boolean) => {
    if (!generatedEvent) return;
    if (approve) {
      eventGenerationLoading = true;
      const res = await fetch(`${API_HOST}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...generatedEvent,
          calendarId: selectedCalendarId,
        }),
        credentials: 'include',
      });
      const eventJson = await res.json();
      events.set([...$events, convertToEvent(eventJson)]);

      if (eventJson.recurrenceId) await fetchEvents();
    }
    else {
      editEvent.set({
        ...generatedEvent,
        calendarId: selectedCalendarId,
      });
      selectedPosition.set(undefined);
    }

    value = '0';
    search = '';
    pages = [];
    eventGenerationLoading = false;
    commandMenuOpen.set(false);
  }
</script>

<svelte:head>
    <title>Calendar</title>
</svelte:head>

<svelte:window on:keydown={keyPressEvent} />

<Command.Dialog
  class="fixed inset-0 z-50 flex items-center justify-center p-4"
  open={$commandMenuOpen}
  on:close={() => commandMenuOpen.set(false)}
  bind:value={value}
  label="Command Menu"
>
    <div class={`bg-white rounded-lg shadow-2xl h-1/2 w-1/3 overflow-y-auto opacity-95`}>
        <Command.Input
          bind:value={search}
          class="selection:text-white selection:bg-orange-500 text-lg mt-4 mx-3 w-[calc(100%-1.5rem)] focus:outline-none focus:border-transparent"
          style="caret-color: blue;"
          placeholder={page == 'createEvent' ? "Begin typing..." : "What do you need?"}
        />
        <Command.Separator class="mt-4 border-t border-gray-200" />
        <Command.List class="">
            {#if !page}
                <Command.Empty class="m-4 text-gray-500">
                  No results found.
                </Command.Empty>
                <Command.Group heading="Events" class="m-4 text-sm text-gray-500">
                    <Command.Item
                      onSelect={() => { pages = [...pages, 'newEvent']; search = ''; value = '0'; }}
                      class={`rounded-lg mt-1 -mx-1 py-3 text-md text-gray-800 ${value === '0' && 'bg-gray-100'} hover:bg-gray-100`}
                      value="0"
                      >
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
                    Select the calendar you want to create the event in.
                </p>
                <Command.Group heading="Calendars" class="m-4 text-sm text-gray-500">
                    {#each getCalendarsArray() as calendar, index}
                        <Command.Item
                          onSelect={() => { pages = [...pages, 'createEvent']; search = ''; selectedCalendarId = calendar.id; }}
                          class={`rounded-lg mt-1 -mx-1 py-3 text-md text-gray-800 ${value === index.toString() && 'bg-gray-100'} hover:bg-gray-100`}
                          value={index.toString()}
                          >
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
                                    {calendar.name}
                                </p>
                            </div>
                        </Command.Item>
                    {/each}
                </Command.Group>

            {:else if page == 'createEvent'}
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
                        <p class='text-red-500 text-md mb-6'>Error generating the event...</p>
                        <p class='text-gray-500 text-md'>Please be more specific</p>
                    </div>
                {/if}
            {:else if page == 'approveEvent'}
                <Command.Group heading="Choices" class="m-4 text-sm text-gray-500">
                    <Command.Item
                      onSelect={() => submitEvent(true)}
                      class={`rounded-lg mt-1 -mx-1 py-3 text-md text-gray-800 ${value === '0' && 'bg-gray-100'} hover:bg-gray-100`}
                      value={'0'}
                      >
                        <p class="ml-2">
                            Approve
                        </p>
                    </Command.Item>
                    <Command.Item
                      onSelect={() => submitEvent(false)}
                      class={`rounded-lg mt-1 -mx-1 py-3 text-md text-gray-800 ${value === '1'.toString() && 'bg-gray-100'} hover:bg-gray-100`}
                      value={'1'}
                      >
                        <p class="ml-2">
                            Reject
                        </p>
                    </Command.Item>
                </Command.Group>

                {#if generatedEvent}
                    <div
                      style="background-color: {$calendars.get(selectedCalendarId).color}"
                      class="m-4 shadow-lg cursor-pointer transition-fade rounded-md overflow-hidden select-none bg-blue-200"
                    >
                        <div class="flex flex-col h-full p-2">
                            <div class="overflow-hidden">
                                <p class="text-xs font-semibold">{generatedEvent.title}</p>
                            </div>
                            <p class="text-xs">
                                {getDateString(generatedEvent.date)}
                            </p>
                            <p class="text-xs">{getTimeRange(generatedEvent.date, generatedEvent.duration)}</p>
                            <p class="text-xs mt-4">{generatedEvent.description || "No Description"}</p>
                            {#if generatedEvent.recurring}
                              <p class="text-xs mt-4">Recurring Event</p>
                            {/if}
                        </div>
                    </div>
                    {#if eventGenerationLoading}
                        <div class="flex flex-col justify-center items-center h-20">
                            <p class='text-gray-500 text-md mb-6'>Creating event...</p>
                            <div class='flex space-x-2 justify-center items-center'>
                                <div class='h-4 w-4 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                                <div class='h-4 w-4 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                                <div class='h-4 w-4 bg-blue-400 rounded-full animate-bounce'></div>
                            </div>
                        </div>
                    {/if}
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
