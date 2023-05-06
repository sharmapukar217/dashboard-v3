import { writable } from "svelte/store";

function createStore() {
  const defaultValues = {
    title: "LogikinNepal",
    titleTemplate: "%s | LogikinNepal"
  };

  const store = writable(defaultValues, () => set(defaultValues));

  function set(values: any) {
    store.set({ ...values });
  }

  return {
    subscribe: store.subscribe,
    set
  };
}

export const pageMeta = createStore();
