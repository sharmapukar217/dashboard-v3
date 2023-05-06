<script lang="ts">
  import { clickAway } from "$lib/actions/clickAway";
  import { splitCamelCase } from "$lib/utilities/functions";

  export let state: any;
  const visibleColumns = $$props.state.visibleColumns;
  const { hiddenColumnIds } = state.pluginStates.hidden;
  const cols = state.flatColumns
    .map((c) => c.id)
    .filter((c) => {
      return !["id", "select-all", "actions"].includes(c);
    });
  const visibleCols = $visibleColumns.map((c) => c.id);
  const handleChange = (e: any) => {
    const id = e.target.getAttribute("data-col");
    hiddenColumnIds.update((ids) => {
      if (e.target.checked) return ids.filter((i) => i !== id);
      const newIDLst = [...ids, id];
      return newIDLst;
    });
  };
  let opened = false;
  const toggle = () => (opened = !opened);
  const close = () => (opened = false);
</script>

<div class="relative">
  <button class="stick-end py-0" on:click={toggle}><i class="i-bi-three-dots h-5 w-5" /></button>
  <div
    class="dark:bg-dark-700 max-h-70 min-w-25 fixed right-5 space-y-1 overflow-auto rounded-md border bg-white p-1 shadow dark:border-gray-700"
    use:clickAway={close}
    class:hidden={!opened}>
    {#each cols as col (col)}
      {@const id = `toggle-${col}-visibility`}
      <div
        class="dark:hover:(bg-black text-white) flex cursor-pointer items-center rounded-md py-0.5 px-2">
        <input
          {id}
          type="checkbox"
          data-col={col}
          class="w-4 h-4 text-primary-600 bg-gray-100 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mr-2 checked:bg-primary-500 checked:border-primary-500"
          checked={visibleCols.includes(col)}
          on:change={handleChange} />
        <label class="w-full cursor-pointer" for={id}>{splitCamelCase(col).toUpperCase()}</label>
      </div>
    {/each}
  </div>
</div>
