<script lang="ts">
  import { page } from "$app/stores";
  import { PasswordInput } from "$lib/components/Inputs";
  import { superForm } from "sveltekit-superforms/client";
  import * as flashModule from "sveltekit-flash-message/client";
  import { addUserSchema } from "$lib/utilities/zod-schema";

  import { pageMeta } from "$lib/stores/pageMeta";

  pageMeta.set({ title: "Setup your account" });

  const { form, errors, enhance, submitting } = superForm($page.form, {
    resetForm: true,
    invalidateAll: false,
    taintedMessage: false,
    defaultValidator: "clear",
    validators: addUserSchema,
    flashMessage: { module: flashModule }
  });
</script>

<div class="h-full w-full px-5 py-4 sm:max-w-lg mx-auto">
  <div class="mx-auto text-center mt-5">
    <h1 class="text-2xl">LogikinNepal</h1>
    <h2>Setup your account</h2>
  </div>

  <form method="post" class="mt-5 space-y-2" autocomplete="off" use:enhance>
    <input type="text" name="role" bind:value={$form.role} hidden />
    <div>
      <label for="name" class="text-gray-800 dark:text-gray-200">Full name</label>
      <input
        required
        id="name"
        type="text"
        name="name"
        bind:value={$form.name}
        data-invalid={$errors.name}
        placeholder="Enter your full name."
        class="block w-full text-sm rounded-xl border-2 border-white shadow outline-none focus:border-primary-500 focus:ring-0 dark:bg-gray-700 dark:border-gray-600 dark:focus:border-primary-500 dark:placeholder-gray-300 py-2.5" />
      {#if $errors.name}
        <small class="text-red-500">{$errors.name}</small>
      {/if}
    </div>

    <div>
      <label for="email" class="text-gray-800 dark:text-gray-200">Email address</label>
      <input
        required
        id="email"
        type="text"
        name="email"
        bind:value={$form.email}
        data-invalid={$errors.email}
        placeholder="Enter your email address."
        class="block w-full text-sm rounded-xl border-2 border-white shadow outline-none focus:border-primary-500 focus:ring-0 dark:bg-gray-700 dark:border-gray-600 dark:focus:border-primary-500 dark:placeholder-gray-300 py-2.5" />
      {#if $errors.email}
        <small class="text-red-500">{$errors.email}</small>
      {/if}
    </div>
    <div>
      <label for="username" class="text-gray-800 dark:text-gray-200">Username</label>
      <input
        type="text"
        id="username"
        name="username"
        bind:value={$form.username}
        data-invalid={$errors.username}
        placeholder="Enter a new username (optional)."
        class="block w-full text-sm rounded-xl border-2 border-white shadow outline-none focus:border-primary-500 focus:ring-0 dark:bg-gray-700 dark:border-gray-600 dark:focus:border-primary-500 dark:placeholder-gray-300 py-2.5" />
      {#if $errors.username}
        <small class="text-red-500">{$errors.username}</small>
      {/if}
    </div>

    <div>
      <label for="vendorName" class="text-gray-800 dark:text-gray-200">Vendor</label>
      <input
        type="text"
        id="vendorName"
        name="vendorName"
        bind:value={$form.vendorName}
        data-invalid={$errors.vendorName}
        class="block w-full text-sm rounded-xl border-2 border-white shadow outline-none focus:border-primary-500 focus:ring-0 dark:bg-gray-700 dark:border-gray-600 dark:focus:border-primary-500 dark:placeholder-gray-300 py-2.5"
        readonly />
      {#if $errors.vendorName}
        <small class="text-red-500">{$errors.vendorName}</small>
      {/if}
    </div>

    <div>
      <PasswordInput
        showHints
        id="password"
        name="password"
        class="shadow !border-2 border-white shadow focus:ring-0 !bg-white !dark:bg-gray-700"
        bind:value={$form.password}
        error={$errors.password?.[0]}
        required>
        <label
          slot="label"
          for="password"
          class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Password</label>
      </PasswordInput>

      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        class="shadow !border-2 border-white shadow focus:ring-0 !bg-white !dark:bg-gray-700"
        bind:value={$form.confirmPassword}
        error={$errors.confirmPassword?.[0]}
        required>
        <label
          slot="label"
          for="confirmPassword"
          class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
          >Confirm Password</label>
      </PasswordInput>
    </div>

    <div class="pt-2 pb-6">
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
    </div>
  </form>
</div>
