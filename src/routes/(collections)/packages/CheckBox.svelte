<script lang="ts">
  export let checked = false;
  export let disabled = false;
  export let indeterminate = false;
  export let onChange: (() => void) | undefined = undefined;
</script>

<div class="pl-3 sticky left-0">
  <input
    {disabled}
    {checked}
    {indeterminate}
    type="checkbox"
    class="w-4 h-4 text-primary-600 bg-gray-100 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
    on:change={onChange} />
</div>
