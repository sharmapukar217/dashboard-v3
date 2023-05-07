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
  import { ComboBoxInput, PasswordInput } from "$lib/components/Inputs";
  import PageModal from "$lib/components/PageModal.svelte";
  import { onLoadVendors } from "$lib/functions/vendor.telefunc";
  import { onLoadUserById } from "$lib/functions/user.telefunc";
  import { addUserSchema } from "$lib/utilities/zod-schema";

  export let data;
  let showPasswordField = false;

  const queryClient = useQueryClient();
  const user = createQuery({
    initialData: data.user,
    queryKey: ["user", $page.params.id],
    queryFn: () => onLoadUserById($page.params.id)
  });

  $: if ($user.data) pageMeta.set({ title: `User (${$user.data.name})` });

  const vendorsList = createQuery({
    queryKey: ["vendors-list"],
    queryFn: () => onLoadVendors()
  });

  const { form, errors, enhance, submitting, capture, restore } = superForm(data.form, {
    resetForm: false,
    invalidateAll: false,
    taintedMessage: false,
    defaultValidator: "clear",
    validators: addUserSchema,
    flashMessage: { module: flashModule },
    async onResult({ result }) {
      if (result.type === "success" && result.data?.updatedVendor) {
        const updatedVendor = result.data.updatedVendor;
        queryClient.setQueryData(["users-list"], (prev: any) => {
          if (!prev) return [{ ...newVendor }];
          return prev.map((v) => {
            return v.id === updatedVendor.id ? updatedVendor : v;
          });
        });
        await queryClient.invalidateQueries(["users"]);
      } else {
        applyAction(result);
      }
    }
  });

  $: if ($user.data) {
    $form = {
      ...omit($user.data, ["vendor"]),
      vendorName: $user.data.vendor?.vendorName
    };
  }

  const handleClose = () => {
    goto("/users");
  };

  const handleSendResetLink = async (ev) => {
    ev.preventDefault();
    await fetch(ev.target.action, { method: "POST", body: new FormData(ev.target) });
    await flashModule.updateFlash(page);
    // send password reset link here
    showPasswordField = false;
  };

  export const snapshot = { capture, restore };
</script>

<PageModal onClose={handleClose}>
  <div slot="header" class="p-4">
    <h1 class="font-medium">User information</h1>
    <div class="text-sm font-medium leading-tight text-gray-500 inline-flex items-center">
      Information related to user
      <div class="text-xs rounded ml-1 text-primary-600 dark:text-primary-500">
        @{$user.data?.username}
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
      <button type="button" class="absolute top-7.5 right-3" on:click={() => $user.refetch()}>
        <i class="i-bi-arrow-repeat w-6 h-6" class:animate-spin={$user.isRefetching} />
      </button>
    </div>

    <div class="w-full sm:w-3/4">
      <label for="name" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
        >Name</label>
      <input
        type="text"
        id="name"
        name="name"
        bind:value={$form.name}
        aria-invalid={!!$errors.name}
        class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        placeholder="Enter the full name."
        required />

      {#if $errors.name}
        <small class="text-red-500">{$errors.name}</small>
      {/if}
    </div>

    <div class="flex flex-col sm:flex-row md:space-x-3 space-y-2 sm:space-y-0">
      <div class="w-full">
        <label for="email" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
          >Email address</label>
        <input
          type="text"
          id="email"
          name="email"
          bind:value={$form.email}
          aria-invalid={!!$errors.email}
          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          placeholder="Enter the email address of the user."
          required />
        {#if $errors.email}
          <small class="text-red-500">{$errors.email}</small>
        {/if}
      </div>

      <div class="w-full">
        <label for="username" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
          >Username</label>
        <input
          type="text"
          id="username"
          name="username"
          bind:value={$form.username}
          aria-invalid={!!$errors.username}
          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          placeholder="Enter the username" />
        {#if $errors.username}
          <small class="text-red-500">{$errors.username}</small>
        {/if}
      </div>
    </div>

    {#if showPasswordField}
      <div class="space-y-2">
        <div class="flex flex-col sm:flex-row space-y-1 sm:space-x-3 sm:space-y-0">
          <div class="w-full">
            <PasswordInput
              showHints
              id="password"
              name="password"
              bind:value={$form.password}
              error={$errors.password?.[0]}
              required={!$form.autoGeneratePassword}
              disabled={$form.autoGeneratePassword}>
              <label
                slot="label"
                for="password"
                class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
                >Password</label>
            </PasswordInput>
          </div>

          <div class="w-full">
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              bind:value={$form.confirmPassword}
              error={$errors.confirmPassword?.[0]}
              required={!$form.autoGeneratePassword}
              disabled={$form.autoGeneratePassword}>
              <label
                slot="label"
                for="confirmPassword"
                class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
                >Confirm Password</label>
            </PasswordInput>
          </div>
        </div>

        <div class="inline-flex items-center w-full space-x-2">
          <div class="inline-flex items-center space-x-2 border-r-2 pr-2 dark:border-gray-700">
            <input
              type="checkbox"
              id="autoGeneratePassword"
              name="autoGeneratePassword"
              bind:checked={$form.autoGeneratePassword}
              class="w-4 h-4 text-primary-600 bg-gray-100 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            <label for="autoGeneratePassword" class="ml-1.6 text-gray-800 dark:text-gray-200"
              >Auto generate password</label>
          </div>
          <div>
            <form method="post" action="/reset-pwd?/requestReset" on:submit={handleSendResetLink}>
              <input type="email" name="email" bind:value={$form.email} hidden />
              <button
                formmethod="/reset-pwd?/requestReset"
                type="submit"
                class="text-primary-600 dark:text-primary-400">Send reset link</button>
            </form>
          </div>
        </div>
      </div>
    {/if}

    <label class="relative inline-flex items-center cursor-pointer ml-auto">
      <input type="checkbox" class="sr-only peer" bind:checked={showPasswordField} />
      <div
        class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 mr-2" />
      Update password
    </label>

    <div>
      <label for="role" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
        >Select a role</label>
      <select
        name="role"
        id="role"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        bind:value={$form.role}>
        {#if $authStore.currentUser?.role?.toUpperCase() === "DEVELOPER"}
          <option>DEVELOPER</option>
        {/if}
        <option>SUPERUSER</option>
        <option>ADMINUSER</option>
        <option>VENDORUSER</option>
        <option>NORMALUSER</option>
      </select>
    </div>

    <div class="w-full sm:w-3/4">
      <ComboBoxInput
        id="vendorName"
        valueFieldName="vendorName"
        labelFieldName="vendorName"
        placeholder="Select the vendor"
        error={$errors.vendorName}
        bind:value={$form.vendorName}
        items={$vendorsList.data}
        refetchFunction={() => $vendorsList.refetch()}
        inputClassName="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
        <label
          slot="label"
          for="vendorName"
          class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Vendor</label>
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
