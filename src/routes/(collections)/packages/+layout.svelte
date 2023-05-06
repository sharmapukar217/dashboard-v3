<script lang="ts">
  import { writable } from "svelte/store";
  import TableView from "./TableView.svelte";
  import BreadCrumbs from "./BreadCrumbs.svelte";
  import { createInfiniteQuery } from "@tanstack/svelte-query";
  import { createTable, createRender } from "svelte-headless-table";
  import { addSelectedRows, addHiddenColumns } from "svelte-headless-table/plugins";

  import IDRow from "./IDRow.svelte";
  import StatusColumn from "./StatusColumn.svelte";
  import { authStore } from "$lib/stores/authStore";
  import { ensureRoles } from "$lib/utilities/functions";
  import Renderer from "$lib/components/Renderer.svelte";
  import WithAuth from "$lib/components/WithAuth.svelte";
  import { onLoadPackages } from "$lib/functions/package.telefunc";
  import { DataTable, SelectRowCheckbox, RowManager } from "$lib/components/Table";

  export let data;

  const packagesQuery = createInfiniteQuery({
    queryKey: ["packages"],
    queryFn: () => onLoadPackages(),
    initialData: {
      pageParams: [undefined],
      pages: [[...data.packages]]
    }
  });

  const packages = writable<Array<Record<string, any>>>([]);

  $: {
    let array: any[] = [];
    $packagesQuery.data?.pages.map((p: any) => {
      array = [...array, ...p];
    });
    $packages = array;
  }

  const table = createTable(packages, {
    select: addSelectedRows(),
    hidden: addHiddenColumns()
  });

  const columns = table.createColumns(
    [
      table.column({
        id: "select-all",
        header: ({ ...rest }, { pluginStates }) => {
          return createRender(SelectRowCheckbox, {
            name: "select-all",
            class: "stick-start ml-2 checkbox-input",
            checked: pluginStates.select.allRowsSelected,
            indeterminate: pluginStates.select.someRowsSelected
          });
        },
        cell: ({ row }, { pluginStates }) => {
          return createRender(SelectRowCheckbox, {
            name: "select",
            class: "ml-2 stick-start checkbox-input",
            checked: pluginStates.select.getRowState(row).isSelected
          });
        }
      }),
      table.column({
        id: "id",
        accessor: "id",
        header: "ID",
        cell: (info) => {
          const { id, createdAt } = info.row.original;
          return createRender(IDRow, { id, createdAt });
        }
      }),
      table.column({
        header: "Customer Name",
        accessor: "customerName"
      }),
      table.column({
        header: "Contact Number",
        accessor: "customerNumber",
        cell: (info) =>
          createRender(Renderer, {
            component: `<a href="tel:${info.value}" class="text-blue-500 hover:underline">${info.value}</a>`
          })
      }),
      table.column({
        header: "Location",
        accessor: "customerAddress"
      }),
      table.column({
        id: "vendor.vendorName",
        header: "Vendor Name",
        accessor: "vendorName",
        cell: (info) => {
          return createRender(Renderer, {
            component: `<p class="badge">${info.row.original.vendor?.vendorName}</p>`
          });
        }
      }),
      table.column({
        header: "Status",
        accessor: "status",
        cell: (info) => createRender(StatusColumn, { data: info.row.original })
      }),
      table.column({
        header: "COD",
        accessor: "cod"
      }),
      table.column({
        header: "DC",
        accessor: "deliveryCharge"
      }),
      table.column({
        header: "COD - DC",
        cell: (info) => {
          const { cod, deliveryCharge } = info.row.original;
          return `Rs. ${cod - deliveryCharge}`;
        },
        accessor: "actualPrice"
      }),
      ensureRoles($authStore.currentUser?.role, ["SUPERUSER", "ADMINUSER"]) &&
        table.column({
          header: "Customer Payment",
          accessor: "customerPaymentMethod",
          cell: (info) => {
            const { customerPaymentMethod, customerPaymentVerifiedBy, customerPaymentVerifiedAt } =
              info.row.original;
            const date = new Date(customerPaymentVerifiedAt).toLocaleString();
            const badgeType = customerPaymentMethod === "NOT_PAID" ? "badge-red" : "badge-green";
            const title = customerPaymentVerifiedBy
              ? `verified by @${customerPaymentVerifiedBy} at ${date}`
              : "not paid.";
            return createRender(Renderer, {
              component: `<div><span class="badge ${badgeType}" title="${title}">${customerPaymentMethod}</span>
          ${
            customerPaymentVerifiedBy
              ? `<div><small class="text-primary-500 hover:underline">@${customerPaymentVerifiedBy}</small> <br /><small class="text-gray-500">${date}</small></div>`
              : ""
          }
          </div>`
            });
          }
        }),
      table.column({
        header: "Vendor Payment",
        accessor: "vendorPaymentMethod",
        cell: (info) => {
          const { vendorPaymentMethod, vendorPaymentVerifiedBy, vendorPaymentVerifiedAt } =
            info.row.original;
          const badgeType = vendorPaymentMethod === "NOT_PAID" ? "badge-red" : "badge-green";
          return createRender(Renderer, {
            component: `<div><span class="badge ${badgeType}">${vendorPaymentMethod}</span>
          ${
            vendorPaymentVerifiedBy
              ? `<div><small class="text-primary-500 hover:underline">@${vendorPaymentVerifiedBy}</small> <br /><small class="text-gray-500">${new Date(
                  vendorPaymentVerifiedAt
                ).toLocaleString()}</small></div>`
              : ""
          }
          </div>`
          });
        }
      }),
      table.column({
        header: ({ state }) => createRender(RowManager, { state }),
        cell: (info) =>
          createRender(Renderer, {
            component: `<div class="stick-end inline-flex -z-10">
            <a href="/packages/${info.row.original.id}" class="hover:text-primary-500"><i class="i-bi-chevron-right w-5 h-5 ml-2"></i></a>
          </div>`
          }),
        id: "actions"
      })
    ].filter(Boolean)
  );

  const { rows, tableAttrs, headerRows, tableBodyAttrs, pluginStates } =
    table.createViewModel(columns);
</script>

<WithAuth>
  <div
    class="p-4 bg-white block sm:flex items-center justify-between dark:bg-dark-800 dark:border-gray-700">
    <div class="w-full">
      <BreadCrumbs />
      <h1 class="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">All packages</h1>
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
                placeholder="Search for packages" />
            </div>
          </form>

          <button
            class="inline-flex justify-center p-1 text-gray-500 rounded-md cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            on:click={() => $packagesQuery.refetch()}>
            <i class="i-bi-arrow-repeat w-6 h-6" class:animate-spin={$packagesQuery.isFetching} />
          </button>
          <button
            class="inline-flex justify-center p-1 text-gray-500 rounded-md cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
            <i class="i-bi-three-dots-vertical w-6 h-6" />
          </button>
        </div>
        <div class="flex items-center ml-auto space-x-2 sm:space-x-3">
          <a
            href="/packages/add-info"
            class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-xl text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800 sm:ml-2">
            Add new package
          </a>

          <a
            target="_blank"
            href="/packages/export"
            class="!hidden inline-flex items-center justify-center w-1/2 px-3 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 sm:w-auto dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">
            <i class="i-heroicons-arrow-down-tray mr-2" />
            Export
          </a>
        </div>
      </div>
    </div>
  </div>

  <DataTable {tableAttrs} {rows} {headerRows} {tableBodyAttrs} {pluginStates} />

  <!-- <TableView /> -->

  <slot />
</WithAuth>
