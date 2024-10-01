<script lang="ts">
  import { fade } from 'svelte/transition';

  import { toast } from "svelte-sonner";

  import * as AlertDialog from "$lib/scn-components/ui/alert-dialog";
  import * as Dialog from "$lib/scn-components/ui/dialog";
  import * as Tooltip from "$lib/scn-components/ui/tooltip";
  import { Button, buttonVariants } from "$lib/scn-components/ui/button";

  import { API_HOST } from '$lib/vars';
  import { fetchEvents, getDateString, getTimeRange } from '$lib/utils';
  import { calendars, editEvent, events, selectedEvent, selectedPosition, showEventDetails } from '$lib/stores';

  export let gridDiv: HTMLElement;

  let component: HTMLElement;
  let width: number;
  let height: number;

  let top: number;
  let left: number;

  let showRecurringDelete = false;
  let showShareDialog = false;

  let shareEmailList = '';

  const calculateTop = () => {
    const temp = $selectedPosition.top - height / 4;
    if (temp + height > gridDiv.getBoundingClientRect().bottom)
      return gridDiv.getBoundingClientRect().bottom - height - 10;
    if (temp < gridDiv.getBoundingClientRect().top)
      return gridDiv.getBoundingClientRect().top + 10;
    return temp;
  };

  const calculateLeft = () => {
    const temp = $selectedPosition.left - width - 10;
    if (temp < gridDiv.getBoundingClientRect().left)
      return $selectedPosition.left + $selectedPosition.width + 10;
    return temp;
  };

  const deleteRecurringEvent = async (recurring: boolean) => {
    const response = await fetch(`${API_HOST}/events/${$selectedEvent.id}?recurring=${recurring}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    let toastMessage = "Event has been deleted";
    if (!response.ok) {
      toast.error("Failed to delete event", {
        description: $selectedEvent.title,
      });
      return;
    }
    if (recurring) {
      await fetchEvents();
      toastMessage = "All future events have been deleted";
    }
    else events.update((prev) => prev.filter((event) => event.id !== $selectedEvent.id));
    toast.success(toastMessage, {
      description: $selectedEvent.title,
      action: {
        label: "Undo",
        onClick: () => console.info("Undo")
      }
    });
    showEventDetails.set(false);
    showRecurringDelete = false;
  };

  const deleteEvent = async () => {
    if ($selectedEvent.recurrenceId) {
      showRecurringDelete = true;
      return;
    }
    const response = await fetch(`${API_HOST}/events/${$selectedEvent.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      toast.error("Failed to delete event", {
        description: $selectedEvent.title,
      });
      return;
    }
    toast.success("Event has been deleted", {
      description: $selectedEvent.title,
      action: {
        label: "Undo",
        onClick: () => console.info("Undo")
      }
    });
    events.update((prev) => prev.filter((event) => event.id !== $selectedEvent.id));

    showEventDetails.set(false);
  };

  const shareEvent = async() => {
    const response = await fetch(`${API_HOST}/events/${$selectedEvent.id}/share`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emails: shareEmailList.split('\n') }),
    });
    if (!response.ok) {
      toast.error("Failed to share event", {
        description: $selectedEvent.title,
      });
      return;
    }
    toast.success("Event has been shared", {
      description: `Shared ${$selectedEvent.title} with ${shareEmailList.replaceAll('\n', ', ')}`
    });
    showShareDialog = false;
  }

  $: component, width = component && component.getBoundingClientRect().width;
  $: component, height = component && component.getBoundingClientRect().height;

  $: $selectedPosition, height, top = calculateTop();
  $: $selectedPosition, width, left = calculateLeft();
</script>

<div
  class="fixed bg-white rounded-lg shadow-2xl p-2 w-96 h-96 z-30"
  style="top: {top}px; left: {left}px;"
  bind:this={component}
  in:fade={{ duration: 100 }}
  out:fade={{ duration: 75 }}
>
    <div class="flex flex-col h-full">
        <div class="flex flex-col mt-2">
            <div class="flex w-full mt-2 mb-3">
              <p class="flex-1 ml-4 text-lg">{$selectedEvent.title}</p>
              <div class="ml-auto">
                  <div class="flex gap-x-2">
                      <Tooltip.Root>
                          <Tooltip.Trigger asChild let:builder>
                              <Button
                                builders={[builder]}
                                variant="ghost"
                                class="rounded-full p-1 hover:bg-gray-200 w-8 h-8"
                                on:click={() => { showEventDetails.set(false); editEvent.set($selectedEvent)}}>
                                  <svg class="fill-gray-600" width="20" height="20" viewBox="0 0 24 24">
                                      <path d="M20.41 4.94l-1.35-1.35c-.78-.78-2.05-.78-2.83 0L3 16.82V21h4.18L20.41 7.77c.79-.78.79-2.05 0-2.83zm-14 14.12L5 19v-1.36l9.82-9.82 1.41 1.41-9.82 9.83z"></path>
                                  </svg>
                              </Button>
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                              <p>Edit</p>
                          </Tooltip.Content>
                      </Tooltip.Root>
                      <Tooltip.Root>
                          <Tooltip.Trigger asChild let:builder>
                              <Button
                                builders={[builder]}
                                variant="ghost"
                                class="rounded-full p-1 hover:bg-gray-200 w-8 h-8"
                                on:click={() => deleteEvent($selectedEvent.id)}>
                                  <svg class="fill-gray-600" width="20" height="20" viewBox="0 0 24 24">
                                      <path d="M15 4V3H9v1H4v2h1v13c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6h1V4h-5zm2 15H7V6h10v13z"></path>
                                      <path d="M9 8h2v9H9zm4 0h2v9h-2z"></path>
                                  </svg>
                              </Button>
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                              <p>Delete</p>
                          </Tooltip.Content>
                      </Tooltip.Root>
                      <Tooltip.Root>
                          <Tooltip.Trigger asChild let:builder>
                              <Button
                                builders={[builder]}
                                variant="ghost"
                                class="rounded-full p-1 hover:bg-gray-200 w-8 h-8"
                                on:click={() => showEventDetails.set(false)}>
                                  <svg class="fill-gray-600" width="20" height="20" viewBox="0 0 24 24">
                                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path>
                                  </svg>
                              </Button>
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                              <p>Close</p>
                          </Tooltip.Content>
                      </Tooltip.Root>
                  </div>
              </div>
            </div>

            <p class="text-gray-600 text-sm ml-4 mb-4">
                {getDateString($selectedEvent.date)} ⋅ {getTimeRange($selectedEvent.date, $selectedEvent.duration)}
            </p>

            {#each $selectedEvent.description.split('\n') as line}
                <p class="text-md ml-4">{line}</p>
                <br>
            {/each}
        </div>
        <div class="flex mt-auto ml-2">
            <Dialog.Root
              bind:open={showShareDialog}
            >
                  <Dialog.Trigger class={buttonVariants({ variant: "default" })}>
                      Share
                  </Dialog.Trigger>
                  <Dialog.Content>
                      <Dialog.Header>
                          <Dialog.Title>Who would you like to share this event with?</Dialog.Title>
                      </Dialog.Header>

                      <textarea
                        class="text-md pl-1 h-32 w-full focus:outline-none resize-none"
                        tabindex="0"
                        placeholder="Add email addresses separated by newlines"
                        bind:value={shareEmailList}
                      />

                      <Dialog.Footer>
                          <Button on:click={shareEvent}>
                              Share
                          </Button>
                      </Dialog.Footer>
                  </Dialog.Content>
            </Dialog.Root>

            <div class="flex items-center ml-auto">
                <div
                  class="rounded-sm w-3 h-3"
                  style="background-color: {$calendars.get($selectedEvent.calendarId).color};">
                </div>
                <p class="text-sm ml-2">{$calendars.get($selectedEvent.calendarId).name}</p>
            </div>
        </div>
    </div>
 </div>

<AlertDialog.Root open={showRecurringDelete}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete all future events?</AlertDialog.Title>
      <AlertDialog.Description>
          This is a recurring event. Selecting Yes will delete all future events as well.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel on:click={async () => await deleteRecurringEvent(false)}>No</AlertDialog.Cancel>
      <AlertDialog.Action on:click={async () => await deleteRecurringEvent(true)}>Yes</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
