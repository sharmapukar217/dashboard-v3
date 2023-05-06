<script lang="ts">
  import { writable } from "svelte/store";
  import { createInfiniteQuery } from "@tanstack/svelte-query";
  import { createTable, createRender } from "svelte-headless-table";
  import { addSelectedRows, addHiddenColumns } from "svelte-headless-table/plugins";

  import BreadCrumbs from "./BreadCrumbs.svelte";
  import { DataTable } from "$lib/components/Table";
  import Renderer from "$lib/components/Renderer.svelte";
  import WithAuth from "$lib/components/WithAuth.svelte";
  import { onLoadVendors } from "$lib/functions/vendor.telefunc";

  export let data;

  const vendorsQuery = createInfiniteQuery({
    queryKey: ["vendors"],
    queryFn: () => onLoadVendors(),
    initialData: {
      pageParams: [undefined],
      pages: [[...data.vendors]]
    }
  });

  const vendors = writable<Array<Record<string, any>>>([]);

  $: {
    let array: any[] = [];
    $vendorsQuery.data?.pages.map((p: any) => {
      array = [...array, ...p];
    });
    $vendors = array;
  }

  const table = createTable(vendors, {
    select: addSelectedRows(),
    hidden: addHiddenColumns()
  });

  const columns = table.createColumns([
    table.column({
      id: "id",
      header: "ID",
      cell: ({ row }) => {
        return createRender(Renderer, {
          component: `<a href="/vendors/${row.original.id}" class="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 inline-block rounded-lg text-black dark:text-white font-medium px-2 hover:text-primary-500 dark:hover:text-primary-400">${row.original.id}</a>`
        });
      }
    }),
    table.column({
      id: "vendorName",
      header: "Vendor Name",
      cell: ({ row }) => row.original.vendorName
    }),
    table.column({
      id: "vendorAddress",
      header: "Address",
      cell: ({ row }) => row.original.vendorAddress
    }),
    table.column({
      id: "vendorEmail",
      header: "Email Address",
      cell: ({ row }) => {
        return createRender(Renderer, {
          component: `<a class="text-blue-500 dark:text-blue-400 hover:underline" href="mailto:${row.original.vendorEmail}">${row.original.vendorEmail}</div>`
        });
      }
    }),
    table.column({
      id: "mainVendor",
      header: "Main Vendor",
      cell: ({ row }) => row.original.mainVendor?.vendorName || "-"
    })
  ]);

  const { rows, tableAttrs, headerRows, tableBodyAttrs, pluginStates } =
    table.createViewModel(columns);
</script>

<WithAuth>
  <div
    class="p-4 bg-white block sm:flex items-center justify-between dark:bg-dark-800 dark:border-gray-700">
    <div class="w-full">
      <BreadCrumbs />
      <h1 class="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">All vendors</h1>
      <div class="items-center justify-between block sm:flex">
        <div class="flex items-center mb-4 sm:mb-0 space-x-2">
          <form class="sm:pr-3">
            <label for="package-search" class="sr-only">Search</label>
            <div class="relative mt-1 w-48 sm:w-64 xl:w-96">
              <input
                type="text"
                id="package-search"
                name="package-search"
                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Search for vendors" />
            </div>
          </form>

          <button
            class="inline-flex justify-center p-1 text-gray-500 rounded-md cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            on:click={() => $vendorsQuery.refetch()}>
            <i class="i-bi-arrow-repeat w-6 h-6" class:animate-spin={$vendorsQuery.isFetching} />
          </button>
          <button
            class="inline-flex justify-center p-1 text-gray-500 rounded-md cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
            <i class="i-bi-three-dots-vertical w-6 h-6" />
          </button>
        </div>
        <div class="flex items-center ml-auto space-x-2 sm:space-x-3">
          <a
            href="/vendors/create-vendor"
            class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-xl text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800 sm:ml-2">
            Create new vendor
          </a>
        </div>
      </div>
    </div>
  </div>

  <DataTable {tableAttrs} {rows} {headerRows} {tableBodyAttrs} {pluginStates} />

  <slot />
</WithAuth>
