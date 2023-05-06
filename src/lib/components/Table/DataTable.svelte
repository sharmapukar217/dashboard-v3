<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { Render, Subscribe } from "svelte-headless-table";
  export let rows: any = undefined;
  export let tableAttrs: any = undefined;
  export let headerRows: any = undefined;
  export let pluginStates: any = undefined;
  export let isRefetching: boolean = false;
  export let tableBodyAttrs: any = undefined;
  export let onRefresh: (() => Promise<any>) | undefined = undefined;
  let classes = "";
  let ref: HTMLElement;
  let timeoutId: ReturnType<typeof setTimeout>;
  const dispatch = createEventDispatcher();
  function refresh() {
    if (!ref) return;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const offsetWidth = ref.offsetWidth;
      const scrollWidth = ref.scrollWidth;
      if (scrollWidth - offsetWidth) {
        classes = "scrollable";
        if (ref.scrollLeft === 0) {
          classes += " scroll-start";
        } else if (ref.scrollLeft + offsetWidth >= scrollWidth) {
          classes += " scroll-end";
        }
      } else {
        classes = "";
      }
    }, 200);
  }
  const selectedIds = pluginStates.select.selectedDataIds;
  onMount(() => {
    refresh();
    const observer = new MutationObserver(() => refresh());
    observer.observe(ref!, { attributeFilter: ["width"] });
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  });
  let previousSelected = undefined;
  const handleClick = (event: any) => {
    const rowId = event.target.parentElement?.getAttribute("data-id");
    event.target.classList.toggle("select-none", event.ctrlKey);
    if (event.ctrlKey && event.altKey) {
      if (!previousSelected) {
        previousSelected = rowId;
      } else {
        if (previousSelected > rowId) return;
        for (let i = previousSelected; i != rowId; i++) {
          if (i > 100) break;
          $selectedIds = { ...$selectedIds, [i]: true };
        }
        previousSelected = undefined;
      }
    }
    if (event.ctrlKey) {
      if (rowId) {
        $selectedIds = {
          ...$selectedIds,
          [rowId]: !$selectedIds[rowId]
        };
      }
    }
  };
  const infiniteScroll = (node, callback) => {
    let lastRow = node.querySelector("tbody tr:last-child");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (!callback) return;
        if (entry.isIntersecting && !isRefetching) {
          callback();
        }
      });
    });
    return {
      update() {
        observer.disconnect();
        lastRow = node.querySelector("tbody tr:last-child");
        if (lastRow) {
          observer.observe(lastRow, { threshold: 1 });
        }
      },
      destroy() {
        observer.disconnect();
      }
    };
  };
</script>

<svelte:window on:resize={refresh} />

<div
  class="hw-full relative overflow-auto border-y border-gray-300 dark:border-gray-700 {classes}"
  bind:this={ref}
  on:scroll={refresh}>
  <table
    {...$tableAttrs}
    cellspacing="0"
    class="min-w-full"
    on:click={handleClick}
    use:infiniteScroll={onRefresh}>
    <thead
      class="bg-gray-100 dark:bg-black ring-1 ring-gray-300 dark:ring-gray-700 sticky top-0 z-10">
      {#each $headerRows as headerRow (headerRow.id)}
        <Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
          <tr {...rowAttrs} class="bg-gray-100 dark:bg-black dark:text-gray-300">
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <th {...attrs} class="truncate bg-inherit px-3 py-2 text-left text-sm capitalize">
                  <Render of={cell.render()} />
                </th>
              </Subscribe>
            {/each}
          </tr>
        </Subscribe>
      {/each}
    </thead>
    <tbody {...$tableBodyAttrs} class="bg-white dark:bg-dark-800">
      {#each $rows as row (row.id)}
        <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
          <tr
            data-id={row.id}
            class="cursor-pointer bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-900"
            {...rowAttrs}>
            {#each row.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <td
                  class="text-md border-t dark:border-gray-700 bg-inherit px-3 py-3 text-sm"
                  {...attrs}>
                  <Render of={cell.render()} />
                </td>
              </Subscribe>
            {/each}
          </tr>
        </Subscribe>
      {/each}
    </tbody>
  </table>
  {#if isRefetching}
    <div class="refresh-message">
      <i class="i-bi-arrow-repeat w-10 h-10 animate-spin" />
      <span class="animate-pulse">Refreshing...</span>
    </div>
  {/if}
</div>

<style>
  .scroll-end th:has(.stick-end),
  .scroll-end td:has(.stick-end),
  .scroll-start th:has(.stick-start),
  .scroll-start td:has(.stick-start) {
    box-shadow: none;
  }
  :global(th:has(.stick-start)),
  :global(td:has(.stick-start)) {
    transition: box-shadow 0.2s;
    --at-apply: "bg-inherit sticky left-0 z-9 shadow-[3px_0px_5px_0px_rgba(0,0,0,0.08)]";
  }
  :global(th:has(.stick-end)),
  :global(td:has(.stick-end)) {
    transition: box-shadow 0.2s;
    --at-apply: "bg-inherit sticky right-0 z-9 shadow-[-3px_0px_5px_0px_rgba(0,0,0,0.08)]";
  }
  table {
    border-spacing: 0;
    border-collapse: separate;
  }
</style>
