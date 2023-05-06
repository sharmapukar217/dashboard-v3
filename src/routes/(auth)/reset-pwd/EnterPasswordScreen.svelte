<script lang="ts">
  import { page } from "$app/stores";
  import { pageMeta } from "$lib/stores/pageMeta";
  import { superForm } from "sveltekit-superforms/client";
  import * as flashModule from "sveltekit-flash-message/client";

  import { PasswordInput } from "$lib/components/Inputs";
  import { resetPasswordSchema } from "$lib/utilities/zod-schema";

  pageMeta.set({ title: "Reset your password" });
  const { form, values, errors, enhance, submitting } = superForm($page.form, {
    resetForm: true,
    invalidateAll: false,
    taintedMessage: false,
    defaultValidator: "clear",
    validators: resetPasswordSchema,
    flashMessage: { module: flashModule },
    async onResult({ result }) {
      if (result.type === "redirect" && result.location === "/login") {
        if (confirm("Logout your account from other devices?")) {
          await fetch("/logout?/revokeAll", { method: "POST", body: new FormData() });
          await flashModule.updateFlash(page);
        }
      }
    }
  });

  if ($page.url.searchParams.has("otp")) {
    $form.otp = $page.url.searchParams.get("otp");
  }

  if ($page.url.searchParams.has("email")) {
    $form.email = $page.url.searchParams.get("email");
  }

  if ($page.url.searchParams.has("token")) {
    $form.token = $page.url.searchParams.get("token");
  }
</script>

<form class="space-y-3" method="post" action="?/resetPassword" use:enhance>
  <input type="number" name="otp" value={$form.otp} hidden />
  <input type="text" name="token" value={$form.token} hidden />
  <input type="email" name="email" value={$form.email} hidden />
  <div class="w-full">
    <PasswordInput
      showHints
      id="newPassword"
      name="newPassword"
      class="shadow !border-2 border-white shadow focus:ring-0 !bg-white !dark:bg-gray-700"
      bind:value={$form.newPassword}
      error={$errors.newPassword?.[0]}
      required>
      <label
        slot="label"
        for="newPassword"
        class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">New Password</label>
    </PasswordInput>
  </div>

  <div class="w-full">
    <PasswordInput
      id="confirmPassword"
      name="confirmPassword"
      class="shadow !border-2 border-white shadow focus:ring-0 !bg-white !dark:bg-gray-700"
      bind:value={$form.confirmPassword}
      error={$errors.confirmPassword?.[0]}
      required={!$form.autoGeneratePassword}>
      <label
        slot="label"
        for="confirmPassword"
        class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
        >Confirm Password</label>
    </PasswordInput>
  </div>

  <div class="mt-2">
    <button
      type="submit"
      class="inline-flex items-center justify-center w-full text-base text-white !bg-primary-500 !hover:bg-primary-600 rounded-xl py-2.5 border-2 border-white shadow dark:border-gray-600"
      disabled={$submitting}>
      {#if $submitting}
        <i class="i-svg-spinners:3-dots-scale w-6 h-6 mr-2" />
      {:else}
        Submit
      {/if}
    </button>
  </div>
</form>
