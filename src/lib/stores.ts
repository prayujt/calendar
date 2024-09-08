import { writable } from "svelte/store";
import type { User } from "./types";

export const commandMenuOpen = writable(false);

export const userInfo = writable<User>({});

export const calendars = writable<Map<string, Calendar>>(
    new Map<string, Calendar>(),
);
export const selectedCalendars = writable<Set<string>>(new Set<string>());

export const events = writable<Event[]>([]);

export const showEventDetails = writable(false);
export const selectedEvent = writable<Event>(undefined);
export const selectedPosition = writable<EventPosition>(undefined);
