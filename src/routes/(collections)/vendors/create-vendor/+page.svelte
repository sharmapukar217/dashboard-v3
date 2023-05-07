<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { applyAction } from "$app/forms";
  import { superForm } from "sveltekit-superforms/client";
  import * as flashModule from "sveltekit-flash-message/client";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";

  import { pageMeta } from "$lib/stores/pageMeta";
  import { ComboBoxInput } from "$lib/components/Inputs";
  import PageModal from "$lib/components/PageModal.svelte";
  import { addVendorSchema } from "$lib/utilities/zod-schema";
  import { onLoadVendors } from "$lib/functions/vendor.telefunc";

  pageMeta.set({ title: "Create vendor" });

  const queryClient = useQueryClient();
  const vendorsList = createQuery({
    queryKey: ["vendors-list"],
    queryFn: () => onLoadVendors()
  });

  const { form, errors, enhance, submitting, capture, restore } = superForm($page.form, {
    resetForm: true,
    invalidateAll: false,
    defaultValidator: "clear",
    validators: addVendorSchema,
    flashMessage: { module: flashModule },
    onResult({ result }) {
      if (result.type === "success" && result.data?.newVendor) {
        const newVendor = result.data.newVendor;
        // update list
        queryClient.setQueryData(["vendors-list"], (prev: any) => {
          return [{ id: newVendor.id, vendorName: newVendor.vendorName }, ...prev];
        });
        // update table
        queryClient.setQueryData(["vendors"], (prev: any) => {
          if (!prev.pages) {
            return { pageParams: [], pages: [newVendor] };
          } else {
            return {
              ...prev,
              pages: [[{ ...newVendor }, ...prev.pages[0]], ...prev.pages.splice(1)]
            };
          }
        });

        // paginate
        goto("/vendors");
      } else {
        applyAction(result);
      }
    }
  });

  const handleClose = () => {
    goto("/vendors");
  };

  export const snapshot = { capture, restore };
</script>

<PageModal onClose={handleClose}>
  <div slot="header" class="p-4">
    <h1 class="font-medium">Create a new vendor</h1>
    <small class="text-xs leading-tight text-gray-500"
      >Please fill up all the fields to continue...</small>
  </div>
  <form class="px-4 pb-2 sm:px-6 space-y-3" method="post" autocomplete="off" use:enhance>
    <div class="w-full sm:w-3/4">
      <label for="vendorName" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
        >Vendor name</label>
      <input
        type="text"
        id="vendorName"
        name="vendorName"
        bind:value={$form.vendorName}
        aria-invalid={!!$errors.vendorName}
        class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        placeholder="Enter the name of the customer"
        required />

      {#if $errors.vendorName}
        <small class="text-red-500">{$errors.vendorName}</small>
      {/if}
    </div>

    <div>
      <label for="vendorEmail" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
        >Email address</label>
      <input
        type="email"
        id="vendorEmail"
        name="vendorEmail"
        bind:value={$form.vendorEmail}
        aria-invalid={!!$errors.vendorEmail}
        class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        placeholder="Enter the phone number of the customer"
        required />
      {#if $errors.vendorEmail}
        <small class="text-red-500">{$errors.vendorEmail}</small>
      {/if}
    </div>

    <div>
      <label
        for="vendorAddress"
        class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
        >Vendor's address</label>
      <input
        type="text"
        id="vendorAddress"
        name="vendorAddress"
        bind:value={$form.vendorAddress}
        aria-invalid={!!$errors.vendorAddress}
        class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        placeholder="Enter the address of the customer (delivery address)"
        required />
      {#if $errors.vendorAddress}
        <small class="text-red-500">{$errors.vendorAddress}</small>
      {/if}
    </div>

    <div class="w-full sm:w-3/4">
      <ComboBoxInput
        id="mainVendorName"
        valueFieldName="vendorName"
        labelFieldName="vendorName"
        bind:value={$form.mainVendorName}
        erorr={$errors.mainVendorName}
        placeholder="Select the main vendor"
        items={$vendorsList.data}
        refetchFunction={() => $vendorsList.refetch()}
        inputClassName="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
        <label
          for="mainVendorName"
          class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
          slot="label">Main Vendor</label>
      </ComboBoxInput>
    </div>

    <div class="inline-flex items-center space-x-2 w-full py-2">
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
        href="/vendors"
        class="w-full px-3 py-2.5 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-800 dark:focus:ring-gray-700"
        >Cancel</a>
    </div>
  </form>
</PageModal>
