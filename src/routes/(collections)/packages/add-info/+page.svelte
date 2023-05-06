<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { applyAction } from "$app/forms";
  import { superForm } from "sveltekit-superforms/client";
  import * as flashModule from "sveltekit-flash-message/client";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";

  import { pageMeta } from "$lib/stores/pageMeta";
  import { authStore } from "$lib/stores/authStore";
  import { ensureRoles } from "$lib/utilities/functions";
  import { ComboBoxInput } from "$lib/components/Inputs";
  import PageModal from "$lib/components/PageModal.svelte";
  import { onLoadVendors } from "$lib/functions/vendor.telefunc";
  import { addPackageInfoSchema } from "$lib/utilities/zod-schema";

  let addDeliveryCharge = false;

  pageMeta.set({ title: "Add new package info" });

  const queryClient = useQueryClient();
  const vendorsList = createQuery({
    queryKey: ["vendors-list"],
    queryFn: () => onLoadVendors([])
  });

  const { form, errors, enhance, submitting, capture, restore } = superForm($page.form, {
    resetForm: true,
    invalidateAll: false,
    defaultValidator: "clear",
    validators: addPackageInfoSchema,
    flashMessage: { module: flashModule },
    onResult({ result }) {
      if (result.type === "success" && result.data?.newPackage) {
        // update table
        queryClient.setQueryData(["packages"], (prev: any) => {
          const newPackage = result.data.newPackage;
          if (!prev.pages) {
            return { pageParams: [], pages: [newPackage] };
          } else {
            return {
              ...prev,
              pages: [[{ ...newPackage }, ...prev.pages[0]], ...prev.pages.splice(1)]
            };
          }
        });

        goto("/packages");
      } else {
        applyAction(result);
      }
    }
  });

  const handleClose = () => {
    goto("/packages");
  };

  export const snapshot = { capture, restore };
</script>

<PageModal onClose={handleClose}>
  <div slot="header" class="p-4">
    <h1 class="font-medium">Add a record for new package</h1>
    <small class="text-xs leading-tight text-gray-500"
      >Please fill up all the fields to continue...</small>
  </div>
  <form class="px-4 pb-2 sm:px-6 space-y-3" method="post" autocomplete="off" use:enhance>
    <div class="w-full sm:w-3/4">
      <label for="customerName" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
        >Customer name</label>
      <input
        type="text"
        id="customerName"
        name="customerName"
        bind:value={$form.customerName}
        aria-invalid={!!$errors.customerName}
        class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        placeholder="Enter the name of the customer"
        required />

      {#if $errors.customerName}
        <small class="text-red-500">{$errors.customerName}</small>
      {/if}
    </div>

    <div>
      <label
        for="customerNumber"
        class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Contact number</label>
      <input
        type="text"
        id="customerNumber"
        name="customerNumber"
        bind:value={$form.customerNumber}
        aria-invalid={!!$errors.customerNumber}
        class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        placeholder="Enter the phone number of the customer"
        required />
      {#if $errors.customerNumber}
        <small class="text-red-500">{$errors.customerNumber}</small>
      {/if}
    </div>

    <div>
      <label
        for="customerAddress"
        class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
        >Customer's address</label>
      <input
        type="text"
        id="customerAddress"
        name="customerAddress"
        bind:value={$form.customerAddress}
        aria-invalid={!!$errors.customerAddress}
        class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        placeholder="Enter the address of the customer (delivery address)"
        required />
      {#if $errors.customerAddress}
        <small class="text-red-500">{$errors.customerAddress}</small>
      {/if}
    </div>

    <div class="w-full sm:w-3/4">
      <ComboBoxInput
        required
        id="vendorName"
        valueFieldName="vendorName"
        labelFieldName="vendorName"
        bind:value={$form.vendorName}
        error={$errors.vendorName}
        placeholder="Select the vendor"
        items={$vendorsList.data}
        refetchFunction={() => $vendorsList.refetch()}
        inputClassName="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" />
    </div>

    <div>
      <div class="flex flex-col sm:flex-row sm:space-x-2 space-y-2 md:space-y-0">
        <div class="sm:w-2/3">
          <label for="cod" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
            >COD (Rs)</label>
          <input
            min="0"
            id="cod"
            name="cod"
            type="number"
            bind:value={$form.cod}
            aria-invalid={!!$errors.cod}
            class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            placeholder="Enter the cod (price)"
            required />
          {#if $errors.cod}
            <small class="text-red-500">{$errors.cod}</small>
          {/if}
        </div>

        {#if addDeliveryCharge}
          <div class="w-full sm:w-1/3">
            <label
              for="deliveryCharge"
              class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
              >Delivery charge</label>
            <input
              type="number"
              id="deliveryCharge"
              name="deliveryCharge"
              bind:value={$form.deliveryCharge}
              class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Enter the delivery charge"
              required />
          </div>
        {/if}
      </div>
      {#if ensureRoles($authStore.currentUser?.role, ["SUPERUSER", "ADMINUSER"])}
        <div class="inline-flex items-center space-x-2 mt-1">
          <input
            type="checkbox"
            id="addDeliveryCharge"
            bind:checked={addDeliveryCharge}
            class="w-4 h-4 text-primary-600 bg-gray-100 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
          <label for="addDeliveryCharge">Add delivery charge</label>
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
</PageModal>
