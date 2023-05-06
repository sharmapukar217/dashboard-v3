<script lang="ts">
  import { fade } from "svelte/transition";
  export let selectedRows: any;
</script>

<div
  transition:fade={{ duration: 200 }}
  class="z-60 dark:bg-dark-800 absolute left-1/2 bottom-12 flex -translate-x-1/2 transform select-none items-center rounded-full border border-gray-300 bg-white px-2 py-2 shadow-sm dark:border-gray-600 w-sm md:w-auto inline-block">
  <div class="ml-2 font-medium sm:mr-6">
    <span>{selectedRows.length}</span>
    <span>data(s)</span>
    <span class="hidden sm:inline">selected.</span>
  </div>

  <div class="ml-auto inline-flex items-center space-x-2">
    <button
      class="bg-primary-500 focus:(ring-2 dark:ring-primary-900) ml-auto rounded-full px-2 py-0.5 text-white ring-black">
      Update
    </button>

    <button
      class="focus:(ring-2 ring-red-900) h-8 w-8 rounded-full bg-red-100 text-red-500 dark:bg-red-500 dark:text-white">
      <i class="i-bi-trash" />
    </button>

    <button
      class="focus:(ring-2 dark:ring-gray-900) rounded-full px-2 py-1.5 text-sm font-medium ring-black hover:bg-gray-100 dark:hover:bg-gray-700"
      on:click={() => (selectedRows = [])}>
      <small>CANCEL</small>
    </button>
  </div>
</div>
