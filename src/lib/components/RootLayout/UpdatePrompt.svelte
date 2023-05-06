<script lang="ts">
  import { toast } from "$lib/utilities/toast";

  export let handleUpdate: () => void;

  const cancelUpdate = () => toast.remove("service-worker");
</script>

<div class="flex w-full max-w-xs py-2">
  <div
    class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-primary-500 bg-primary-100 rounded-lg dark:bg-primary-500 dark:text-white">
    <i class="i-bi-arrow-repeat w-5 h-5" />
    <span class="sr-only">Refresh icon</span>
  </div>
  <div class="ml-3 text-sm font-normal">
    <span class="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Update available</span>
    <div class="mb-2 text-sm font-normal">A new software version is available.</div>
    <div class="grid grid-cols-2 gap-2">
      <div>
        <button
          on:click={handleUpdate}
          class="inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-primary-800"
          >Update</button>
      </div>
      <div>
        <button
          on:click={cancelUpdate}
          class="inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700"
          >Not now</button>
      </div>
    </div>
  </div>
  <button
    type="button"
    on:click={cancelUpdate}
    class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-100 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
    aria-label="Close">
    <span class="sr-only">Close</span>
    <svg
      aria-hidden="true"
      class="w-5 h-5"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      ><path
        fill-rule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clip-rule="evenodd" /></svg>
  </button>
</div>
