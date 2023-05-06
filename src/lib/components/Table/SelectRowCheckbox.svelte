<script lang="ts">
  import { clsx } from "clsx";
  import { writable, readable } from "svelte/store";
  import type { Writable, Readable } from "svelte/store";
  let classname: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let name: string | undefined = undefined;
  export let disabled: boolean | undefined = undefined;
  export let readonly: boolean | undefined = undefined;
  export let checked: Writable<boolean> = writable(false);
  export let indeterminate: Readable<boolean> = readable(false);
  if (disabled) $checked = false;
  export { classname as class };
</script>

<input
  {id}
  {name}
  {disabled}
  {readonly}
  type="checkbox"
  bind:checked={$checked}
  indeterminate={!$checked && $indeterminate}
  class={clsx(
    "w-4 h-4 text-primary-600 bg-gray-100 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 checked:bg-primary-500 checked:border-primary-500",
    classname
  )} />
