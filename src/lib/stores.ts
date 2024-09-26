import { writable } from "svelte/store";
import type { Calendar, Event, Task, User } from "./types";

export const commandMenuOpen = writable(false);

export const userInfo = writable<User>({});

export const gridItemHeight = writable(0);
export const gridItemWidth = writable(0);

export const calendars = writable<Map<string, Calendar>>(
    new Map<string, Calendar>(),
);
export const selectedCalendars = writable<Set<string>>(new Set<string>());

export const events = writable<Event[]>([]);
export const eventPositions = writable<Map<string, EventPosition>>(
    new Map<string, EventPosition>(),
);

export const tasks = writable<Task[]>([]);

export const showEventDetails = writable(false);
export const selectedEvent = writable<Event>(undefined);
export const selectedPosition = writable<EventPosition>(undefined);

export const showCreateTask = writable(false);

export const editEvent = writable<Event>(undefined);

export const dragging = writable<string>(undefined);
