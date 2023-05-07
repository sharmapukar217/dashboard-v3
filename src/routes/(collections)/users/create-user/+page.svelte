<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { applyAction } from "$app/forms";
  import { superForm } from "sveltekit-superforms/client";
  import * as flashModule from "sveltekit-flash-message/client";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";

  import { pageMeta } from "$lib/stores/pageMeta";
  import { authStore } from "$lib/stores/authStore";
  import { ComboBoxInput, PasswordInput } from "$lib/components/Inputs";
  import PageModal from "$lib/components/PageModal.svelte";
  import { addUserSchema } from "$lib/utilities/zod-schema";
  import { onLoadVendors } from "$lib/functions/vendor.telefunc";

  pageMeta.set({ title: "Create user" });

  const queryClient = useQueryClient();
  const vendorsList = createQuery({
    queryKey: ["vendors-list"],
    queryFn: () => onLoadVendors()
  });

  const { form, errors, enhance, submitting, capture, restore } = superForm($page.form, {
    resetForm: true,
    invalidateAll: false,
    taintedMessage: false,
    defaultValidator: "clear",
    validators: addUserSchema,
    flashMessage: { module: flashModule },
    onResult({ result }) {
      if (result.type === "success") {
        if (result.data?.newUser) {
          const newUser = result.data.newUser;
          // update list
          queryClient.setQueryData(["users-list"], (prev: any) => {
            if (!prev) return [{ ...newUser }];
            return [{ ...newUser }, ...prev];
          });
          // update table
          queryClient.setQueryData(["users"], (prev: any) => {
            if (!prev.pages) {
              return { pageParams: [], pages: [newUser] };
            } else {
              return {
                ...prev,
                pages: [[{ ...newUser }, ...prev.pages[0]], ...prev.pages.splice(1)]
              };
            }
          });
        }

        // paginate
        goto("/users");
      } else {
        applyAction(result);
      }
    }
  });

  const handleClose = () => {
    goto("/users");
  };

  export const snapshot = { capture, restore };
</script>

<PageModal onClose={handleClose}>
  <div slot="header" class="p-4">
    <h1 class="font-medium">Create a new user</h1>
    <small class="text-xs leading-tight text-gray-500"
      >Please fill up all the fields to continue...</small>
  </div>
  <form class="px-4 pb-2 sm:px-6 space-y-3" method="post" autocomplete="off" use:enhance>
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
        placeholder="Enter the name of the user"
        required />

      {#if $errors.name}
        <small class="text-red-500">{$errors.name}</small>
      {/if}
    </div>

    <div>
      <label for="email" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
        >Email address</label>
      <input
        type="email"
        id="email"
        name="email"
        bind:value={$form.email}
        aria-invalid={!!$errors.email}
        class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        placeholder="Enter the email address of user"
        required />
      {#if $errors.email}
        <small class="text-red-500">{$errors.email}</small>
      {/if}
      <small class="block text-gray-500 dark:text-gray-300"
        >This email address is used for validation, password resets, email alerts and more!</small>
    </div>

    {#if !$form.sendInvitationLink}
      <div>
        <label for="username" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
          >Username</label>
        <input
          type="text"
          id="username"
          name="username"
          bind:value={$form.username}
          aria-invalid={!!$errors.username}
          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          placeholder="Enter a new username (optional)"
          required />
        {#if $errors.username}
          <small class="text-red-500">{$errors.username}</small>
        {/if}
      </div>

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

        <div class="inline-flex items-center">
          <input
            type="checkbox"
            id="autoGeneratePassword"
            name="autoGeneratePassword"
            bind:checked={$form.autoGeneratePassword}
            class="w-4 h-4 text-primary-600 bg-gray-100 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
          <label for="autoGeneratePassword" class="ml-1.6 text-gray-800 dark:text-gray-200"
            >Auto generate password</label>
        </div>
      </div>
    {/if}

    <div class="w-full sm:w-3/4">
      <ComboBoxInput
        id="vendorName"
        valueFieldName="vendorName"
        labelFieldName="vendorName"
        bind:value={$form.vendorName}
        erorr={$errors.vendorName}
        placeholder="Select the user's vendor"
        items={$vendorsList.data}
        refetchFunction={() => $vendorsList.refetch()}
        inputClassName="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
        <label
          for="vendorName"
          class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
          slot="label">Vendor</label>
      </ComboBoxInput>
    </div>

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

    <label
      class="relative inline-flex items-center cursor-pointer ml-auto"
      for="sendInvitationLink">
      <input
        type="checkbox"
        class="sr-only peer"
        id="sendInvitationLink"
        name="sendInvitationLink"
        bind:checked={$form.sendInvitationLink} />
      <div
        class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 mr-2" />
      Send invitation link instead
    </label>

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
        href="/users"
        class="w-full px-3 py-2.5 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-800 dark:focus:ring-gray-700"
        >Cancel</a>
    </div>
  </form>
</PageModal>
