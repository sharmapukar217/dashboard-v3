<script lang="ts">
  import { page } from "$app/stores";
  import { superForm } from "sveltekit-superforms/client";
  import * as flashModule from "sveltekit-flash-message/client";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";

  import { authStore } from "$lib/stores/authStore";
  import { ensureRoles } from "$lib/utilities/functions";
  import { onLoadVendors } from "$lib/functions/vendor.telefunc";
  import { onLoadPackageById } from "$lib/functions/package.telefunc";
  import { updatePackageInfoSchema } from "$lib/utilities/zod-schema";
  import { ComboBoxInput, PackageStatusInput } from "$lib/components/Inputs";

  const queryClient = useQueryClient();
  const packageQuery = createQuery({
    queryKey: ["package", $page.params.id],
    queryFn: () => onLoadPackageById($page.params.id)
  });

  const vendorsList = createQuery({
    queryKey: ["vendors-list"],
    queryFn: () => onLoadVendors()
  });

  const { form, errors, enhance, submitting, capture, restore } = superForm($page.form, {
    resetForm: true,
    invalidateAll: false,
    defaultValidator: "clear",
    validators: updatePackageInfoSchema,
    flashMessage: { module: flashModule },
    onResult({ result }) {
      if (result.type === "success" && result.data?.updatedPackage) {
        // // update table
        // queryClient.setQueryData(["packages"], (prev: any) => {
        //   const newPackage = result.data.newPackage;
        //   if (!prev.pages) {
        //     return { pageParams: [], pages: [newPackage] };
        //   } else {
        //     return {
        //       ...prev,
        //       pages: [[{ ...newPackage }, ...prev.pages[0]], ...prev.pages.splice(1)]
        //     };
        //   }
        // });
      }
    }
  });
</script>

<h1 class="font-medium mx-4 my-2">Package details</h1>

<form
  class="relative px-4 pb-2 sm:px-6 space-y-3 overflow-auto"
  method="post"
  autocomplete="off"
  use:enhance>
  <div class="relative w-full sm:w-3/4">
    <label for="id" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">ID</label>
    <input
      id="id"
      name="id"
      type="text"
      bind:value={$form.id}
      aria-invalid={!!$errors.id}
      class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
      placeholder="Enter the name of the customer"
      readonly
      disabled
      title="Created at {new Date($packageQuery.data?.createdAt).toLocaleString()}" />
    <button class="absolute right-2 top-8" on:click={() => $packageQuery.refetch()}
      ><i
        class="i-bi-arrow-repeat w-6 h-6"
        class:animate-spin={$packageQuery.isRefetching} /></button>
  </div>

  <div>
    <label for="customerName" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
      >Full Name</label>
    <input
      type="text"
      id="customerName"
      name="customerName"
      bind:value={$form.customerName}
      aria-invalid={!!$errors.customerName}
      class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
      placeholder="Enter the full name of the customer."
      required
      readonly={!ensureRoles($authStore.currentUser?.role, ["SUPERUSER", "ADMINUSER"])} />

    {#if $errors.customerName}
      <small class="text-red-500">{$errors.customerName}</small>
    {/if}
  </div>

  <div class="w-full sm:w-2/3">
    <label for="customerNumber" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
      >Contact Number</label>
    <input
      type="text"
      id="customerNumber"
      name="customerNumber"
      bind:value={$form.customerNumber}
      aria-invalid={!!$errors.customerNumber}
      class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
      placeholder="Enter the phone number of the customer."
      required
      readonly={!ensureRoles($authStore.currentUser?.role, ["SUPERUSER", "ADMINUSER"])} />

    {#if $errors.customerNumber}
      <small class="text-red-500">{$errors.customerNumber}</small>
    {/if}
  </div>

  <div class="w-full sm:w-3/4">
    <label
      for="customerAddress"
      class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
      >Customer's Address (Delivery Address)</label>
    <input
      type="text"
      id="customerAddress"
      name="customerAddress"
      bind:value={$form.customerAddress}
      aria-invalid={!!$errors.customerAddress}
      class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
      placeholder="Enter the phone number of the customer."
      required
      readonly={!ensureRoles($authStore.currentUser?.role, ["SUPERUSER", "ADMINUSER"])} />

    {#if $errors.customerAddress}
      <small class="text-red-500">{$errors.customerAddress}</small>
    {/if}
  </div>

  <div class="w-full sm:w-3/4">
    <ComboBoxInput
      id="vendorName"
      valueFieldName="vendorName"
      labelFieldName="vendorName"
      placeholder="Select the vendor"
      error={!!$errors.vendorName}
      bind:value={$form.vendorName}
      items={$vendorsList.data}
      refetchFunction={() => $vendorsList.refetch()}
      inputClassName="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
      <label
        slot="label"
        for="vendorName"
        class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Vendor</label>
    </ComboBoxInput>

    {#if $errors.vendorName}
      <small class="text-red-500">{$errors.vendorName}</small>
    {/if}
  </div>

  <div class="pt-1">
    <PackageStatusInput id="status" name="status" bind:value={$form.status} />
    {#if $packageQuery.data?.StatusUpdatedBy}
      <div class="text-xs text-gray-500 dark:text-gray-300 inline-flex items-center">
        Last updated by <div class="text-primary-500 dark:text-primary-400 mx-1 hover:underline">
          @{$packageQuery.data.StatusUpdatedBy.username}
        </div>
        at {new Date($packageQuery.data.statusUpdatedAt).toLocaleString()}.
      </div>
    {/if}
  </div>

  <div class="inline-flex items-center space-x-2 w-full">
    <button
      type="submit"
      class="inline-flex items-center justify-center w-full text-base text-white !bg-primary-500 !hover:bg-primary-600 rounded-xl py-2.5 shadow dark:border-gray-600 focus:ring-4 focus:ring-primary-300"
      disabled={$submitting}>
      {#if $submitting}
        <i class="i-svg-spinners:3-dots-scale w-6 h-6 mr-2" />
      {:else}
        Submit
      {/if}
    </button>
    <a
      href="/packages"
      class="w-full px-3 py-2.5 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-800 dark:focus:ring-gray-700"
      >Cancel</a>
  </div>
</form>
