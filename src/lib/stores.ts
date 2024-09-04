import { writable } from "svelte/store";
import type { User } from "./types";

export const commandMenuOpen = writable(false);

export const userInfo = writable<User>({});
