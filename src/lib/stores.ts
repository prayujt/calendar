import { writable } from "svelte/store";
import { User } from "./types";

export const userInfo = writable<User | null>(null);
