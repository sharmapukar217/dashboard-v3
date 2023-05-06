<script lang="ts">
  import { writable } from "svelte/store";
  import type { ColumnDef, TableOptions } from "@tanstack/table-core/src/types";
  import {
    createSvelteTable,
    flexRender,
    getCoreRowModel,
    renderComponent
  } from "@tanstack/svelte-table";

  import CheckBox from "./CheckBox.svelte";
  import RowSelection from "./RowSelection.svelte";

  const tableColumns: ColumnDef<any> = [
    {
      id: "select",
      header: ({ table }) =>
        renderComponent(CheckBox, {
          checked: table.getIsAllRowsSelected(),
          indeterminate: table.getIsSomeRowsSelected(),
          onChange: table.getToggleAllRowsSelectedHandler()
        }),
      cell: ({ row }) =>
        renderComponent(CheckBox, {
          checked: row.getIsSelected(),
          disabled: !row.getCanSelect(),
          indeterminate: row.getIsSomeSelected(),
          onChange: row.getToggleSelectedHandler()
        })
    },
    {
      accessorKey: "id",
      header: "id"
    },
    {
      accessorKey: "customerName",
      header: "Customer Name"
    },
    {
      accessorKey: "customerNumber",
      header: "Customer Number"
    },
    {
      accessorKey: "customerAddress",
      header: "Customer Address"
    },
    {
      accessorKey: "vendor",
      accessor: "vendor.name",
      header: "vendor"
    },
    {
      accessorKey: "status",
      header: "status"
    }
  ];

  let rowSelection = {};
  const options = writable<TableOptions<any>>({
    data: [
      { id: 1, customerName: "test" },
      { id: 2, customerName: "test" },
      { id: 3, customerName: "test" },
      { id: 4, customerName: "test" },
      { id: 5, customerName: "test" },
      { id: 6, customerName: "test" },
      { id: 7, customerName: "test" },
      { id: 8, customerName: "test" },
      { id: 9, customerName: "test" }
    ],
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel()
  });

  const table = createSvelteTable(options);
  $: selectedRows = $table.getSelectedRowModel().flatRows;
  console.log($table);
</script>

<div class="border-y border-gray-300 dark:border-gray-700 overflow-auto">
  <table class="min-w-full table-fixed">
    <thead class="bg-gray-100 dark:bg-black ring-1 ring-gray-300 dark:ring-gray-700 sticky top-0">
      {#each $table.getHeaderGroups() as headerGroup}
        <tr>
          {#each headerGroup.headers as header}
            <th
              class="py-3 px-2 text-xs font-medium text-left text-gray-500 whitespace-nowrap uppercase dark:text-gray-400">
              {#if !header.isPlaceholder}
                <svelte:component
                  this={flexRender(header.column.columnDef.header, header.getContext())} />
              {/if}
            </th>
          {/each}
        </tr>
      {/each}
    </thead>
    <tbody class="bg-white divide-y divide-gray-200 dark:bg-dark-800 dark:divide-gray-700">
      {#each $table.getRowModel().rows as row}
        <tr class="hover:bg-gray-100/70 dark:hover:bg-dark-900 cursor-pointer">
          {#each row.getVisibleCells() as cell}
            <td
              class="py-4 px-2 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
              <svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())} />
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
<div
  class="w-full px-4 py-2 bg-white border-b border-gray-300 dark:bg-black dark:border-gray-700 inline-flex items-center">
  <div>
    <span class="text-sm font-normal text-gray-500 dark:text-gray-400"
      >Showing <span class="font-semibold text-gray-900 dark:text-white">1-20</span> of
      <span class="font-semibold text-gray-900 dark:text-white">2290</span></span>
  </div>

  <div class=" ml-auto space-x-1">
    <a
      href="/packages"
      class="inline-flex justify-center p-1 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
      <svg
        class="w-7 h-7"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg">
        <path
          fill-rule="evenodd"
          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
          clip-rule="evenodd" /></svg>
    </a>
    <a
      href="/packages"
      class="inline-flex justify-center p-1 mr-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
      <svg
        class="w-7 h-7"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        ><path
          fill-rule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clip-rule="evenodd" /></svg>
    </a>
  </div>
</div>

<RowSelection {selectedRows} />

<slot />
