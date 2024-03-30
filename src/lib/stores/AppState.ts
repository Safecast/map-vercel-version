import { writable } from "svelte/store";
import { type AppState, Layer } from "$lib/types";

export const state = writable<AppState>({});