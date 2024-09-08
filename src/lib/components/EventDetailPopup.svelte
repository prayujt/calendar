<script lang="ts">
  import { API_HOST } from '$lib/vars';
  import { getDateString, getTimeRange } from '$lib/utils';
  import { calendars, events, selectedEvent, selectedPosition, showEventDetails } from '$lib/stores';

  import { fade } from 'svelte/transition';

  export let gridDiv: HTMLElement;

  let component: HTMLElement;
  let width: number;
  let height: number;

  let top: number;
  let left: number;

  let visible = false;

  const calculateTop = () => {
    visible = false;
    setTimeout(() => {
      visible = true;
    }, 75);
    const temp = $selectedPosition.top - height / 4;
    if (temp + height > gridDiv.getBoundingClientRect().bottom)
      return gridDiv.getBoundingClientRect().bottom - height - 10;
    return temp;
  };

  const calculateLeft = () => {
    const temp = $selectedPosition.left - width - 10;
    if (temp < gridDiv.getBoundingClientRect().left)
      return $selectedPosition.left + $selectedPosition.width + 10;
    return temp;
  };

  const deleteEvent = async (eventId: string) => {
    const response = await fetch(`${API_HOST}/events/${eventId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (response.ok) {
      showEventDetails.set(false);
      events.update((prev) => prev.filter((event) => event.id !== eventId));
    }
  };

  $: component, width = component && component.getBoundingClientRect().width;
  $: component, height = component && component.getBoundingClientRect().height;

  $: $selectedPosition, height, top = calculateTop();
  $: $selectedPosition, width, left = calculateLeft();
</script>

<div
  class="fixed bg-white rounded-lg shadow-2xl p-2 w-96 h-96"
  style="top: {top}px; left: {left}px;"
  bind:this={component}
  in:fade={{ duration: 100 }}
  out:fade={{ duration: 75 }}
  class:invisible={!visible}
>
    <div class="flex flex-col h-full">
        <div class="flex flex-col mt-2">
            <div class="flex w-full mt-2 mb-3">
              <p class="flex-1 ml-4 text-lg">{$selectedEvent.title}</p>
              <div class="ml-auto">
                  <div class="flex gap-x-2">
                      <button class="rounded-full p-1 hover:bg-gray-200">
                          <svg class="fill-gray-600" width="20" height="20" viewBox="0 0 24 24">
                              <path d="M20.41 4.94l-1.35-1.35c-.78-.78-2.05-.78-2.83 0L3 16.82V21h4.18L20.41 7.77c.79-.78.79-2.05 0-2.83zm-14 14.12L5 19v-1.36l9.82-9.82 1.41 1.41-9.82 9.83z"></path>
                          </svg>
                      </button>
                      <button
                        class="rounded-full p-1 hover:bg-gray-200"
                        on:click={() => deleteEvent($selectedEvent.id)}
                      >
                          <svg class="fill-gray-600" width="20" height="20" viewBox="0 0 24 24">
                              <path d="M15 4V3H9v1H4v2h1v13c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6h1V4h-5zm2 15H7V6h10v13z"></path>
                              <path d="M9 8h2v9H9zm4 0h2v9h-2z"></path>
                          </svg>
                      </button>
                      <button
                        class="rounded-full p-1 hover:bg-gray-200"
                        on:click={() => showEventDetails.set(false)}
                      >
                          <svg class="fill-gray-600" width="20" height="20" viewBox="0 0 24 24">
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path>
                          </svg>
                      </button>
                  </div>
              </div>
            </div>

            <p class="text-gray-600 text-sm ml-4 mb-4">
                {getDateString($selectedEvent.date)} ⋅ {getTimeRange($selectedEvent.date, $selectedEvent.duration)}
            </p>

            <p class="text-md ml-4">{$selectedEvent.description}</p>
        </div>
        <div class="flex items-center ml-auto mt-auto">
            <div
              class="rounded-full w-3 h-3 fill-blue"
              style="background-color: {$calendars.get($selectedEvent.calendarId).color};">
            </div>
            <p class="text-sm ml-2">{$calendars.get($selectedEvent.calendarId).name}</p>
        </div>
    </div>
</div>
