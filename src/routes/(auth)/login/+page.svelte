<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { applyAction } from "$app/forms";
  import { superForm } from "sveltekit-superforms/client";
  import { useQueryClient } from "@tanstack/svelte-query";
  import * as flashModule from "sveltekit-flash-message/client";

  import { pageMeta } from "$lib/stores/pageMeta";
  import { previousUrl } from "$lib/stores/previousUrl";
  import { loginSchema } from "$lib/utilities/zod-schema";

  pageMeta.set({ title: "Welcome to login" });

  const queryClient = useQueryClient();

  const { form, errors, enhance, submitting } = superForm($page.form, {
    resetForm: true,
    invalidateAll: false,
    taintedMessage: false,
    validators: loginSchema,
    defaultValidator: "clear",
    flashMessage: { module: flashModule },
    onResult({ result }) {
      if (result.type === "success" && result.data?.currentUser) {
        queryClient.setQueryData(["current-user"], result.data.currentUser);
        goto($previousUrl);
      } else {
        applyAction(result);
      }
    }
  });

  let isPassword = true;
  const togglePassword = () => {
    const el: HTMLInputElement | null = document.querySelector("input[id='password']");
    if (el) {
      el.type = isPassword ? "text" : "password";
      isPassword = !isPassword;
    }
  };

  if ($page.url.searchParams.get("saveLogin") === "true") {
    $form.saveLogin = true;
  }
</script>

<form method="post" action="?/credentials" class="h-full" autocomplete="off" use:enhance>
  <div class="mt-2">
    <label for="login" class="text-gray-800 dark:text-gray-200">Username or email address</label>
    <input
      required
      type="text"
      id="login"
      name="login"
      bind:value={$form.login}
      data-invalid={$errors.login}
      placeholder="Enter your email address or username."
      class="block w-full text-sm rounded-xl border-2 border-white shadow outline-none focus:border-primary-500 focus:ring-0 dark:bg-gray-700 dark:border-gray-600 dark:focus:border-primary-500 dark:placeholder-gray-300 py-2.5" />
    {#if $errors.login}
      <small class="text-red-500">{$errors.login}</small>
    {/if}
  </div>

  <div class="mt-2 relative">
    <label for="password" class="text-gray-800 dark:text-gray-200">Password</label>
    <input
      required
      id="password"
      type="password"
      name="password"
      autocomplete="off"
      bind:value={$form.password}
      data-invalid={$errors.password}
      placeholder="Enter your password."
      class="block w-full text-sm rounded-xl border-2 border-white shadow outline-none focus:border-primary-500 focus:ring-0 dark:bg-gray-700 dark:border-gray-600 dark:focus:border-primary-500 dark:placeholder-gray-300 pr-8 py-2.5" />
    <button type="button" class="absolute right-2 top-8" on:click={togglePassword}>
      <i class="{isPassword ? 'i-heroicons-eye' : 'i-heroicons-eye-slash'} w-6 h-6" />
    </button>
    {#if $errors.password}
      <small class="text-red-500">{$errors.password}</small>
    {/if}
  </div>

  <div class="w-full inline-flex items-center mt-2">
    <div class="inline-flex items-center">
      <input
        id="saveLogin"
        type="checkbox"
        name="saveLogin"
        bind:checked={$form.saveLogin}
        class="w-4 h-4 text-primary-600 bg-gray-100 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
      <label for="saveLogin" class="ml-1.6 text-gray-800 dark:text-gray-200">Save login info</label>
    </div>

    <a href="/reset-pwd" class="ml-auto text-primary-500 dark:text-primary-400 hover:underline">
      Forgot password?
    </a>
  </div>

  <div class="mt-2">
    <button
      type="submit"
      class="inline-flex items-center justify-center w-full text-base text-white !bg-primary-500 !hover:bg-primary-600 rounded-xl py-2.5 border-2 border-white shadow dark:border-gray-600"
      disabled={$submitting}>
      {#if $submitting}
        <i class="i-svg-spinners:3-dots-scale w-6 h-6 mr-2" />
      {:else}
        Login
      {/if}
    </button>
  </div>
</form>
