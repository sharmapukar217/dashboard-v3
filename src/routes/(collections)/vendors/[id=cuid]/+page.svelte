<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { applyAction } from "$app/forms";
  import { superForm } from "sveltekit-superforms/client";
  import * as flashModule from "sveltekit-flash-message/client";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";

  import { pageMeta } from "$lib/stores/pageMeta";
  import { omit } from "$lib/utilities/functions";
  import { authStore } from "$lib/stores/authStore";
  import { ensureRoles } from "$lib/utilities/functions";
  import { ComboBoxInput } from "$lib/components/Inputs";
  import PageModal from "$lib/components/PageModal.svelte";
  import { onLoadVendors, onLoadVendorById } from "$lib/functions/vendor.telefunc";
  import { updateVendorSchema } from "$lib/utilities/zod-schema";

  export let data;
  let addDeliveryCharge = false;

  const queryClient = useQueryClient();
  const vendor = createQuery({
    initialData: data.vendor,
    queryKey: ["vendor", $page.params.id],
    queryFn: () => onLoadVendorById($page.params.id)
  });

  $: if ($vendor.data) pageMeta.set({ title: `Vendor (${$vendor.data.vendorName})` });

  const vendorsList = createQuery({
    queryKey: ["vendors-list"],
    queryFn: () => onLoadVendors()
  });

  const { form, errors, enhance, submitting, capture, restore } = superForm(data.form, {
    resetForm: true,
    invalidateAll: false,
    defaultValidator: "clear",
    validators: updateVendorSchema,
    flashMessage: { module: flashModule },
    async onResult({ result }) {
      if (result.type === "success" && result.data?.updatedVendor) {
        const updatedVendor = result.data.updatedVendor;
        queryClient.setQueryData(["vendors-list"], (prev: any) => {
          if (!prev) return [{ ...newVendor }];
          return prev.map((v) => {
            return v.id === updatedVendor.id ? updatedVendor : v;
          });
        });
        await queryClient.invalidateQueries(["vendors"]);
      } else {
        applyAction(result);
      }
    }
  });

  $: if ($vendor.data) {
    $form = {
      ...omit($vendor.data, ["mainVendor"]),
      mainVendorName: $vendor.data.mainVendor?.vendorName
    };
  }

  const handleClose = () => {
    goto("/vendors");
  };

  export const snapshot = { capture, restore };
</script>

<PageModal onClose={handleClose}>
  <div slot="header" class="p-4">
    <h1 class="font-medium">Vendor information</h1>
    <div class="text-sm font-medium leading-tight text-gray-500 inline-flex items-center">
      Information related to vendor
      <div class="badge text-xs rounded ml-1 text-primary-600 dark:text-primary-500 uppercase">
        {$vendor.data?.vendorName}
      </div>
    </div>
  </div>
  <form class="px-4 pb-2 sm:px-6 space-y-3" method="post" autocomplete="off" use:enhance>
    <div class="relative">
      <label for="id">ID</label>
      <input
        name="id"
        type="text"
        class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        readonly
        disabled
        bind:value={$form.id} />
      <button type="button" class="absolute top-7.5 right-3" on:click={() => $vendor.refetch()}>
        <i class="i-bi-arrow-repeat w-6 h-6" class:animate-spin={$vendor.isRefetching} />
      </button>
    </div>

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
        type="text"
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
        placeholder="Select the vendor"
        error={$errors.mainVendorName}
        bind:value={$form.mainVendorName}
        items={$vendorsList.data}
        refetchFunction={() => $vendorsList.refetch()}
        inputClassName="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
        <label
          slot="label"
          for="mainVendorName"
          class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Main Vendor</label>
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
