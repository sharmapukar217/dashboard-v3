<script lang="ts">
  import { page } from "$app/stores";
  import { superForm } from "sveltekit-superforms/client";
  import * as flashModule from "sveltekit-flash-message/client";

  import { pageMeta } from "$lib/stores/pageMeta";
  import { resetPasswordSchema } from "$lib/utilities/zod-schema";

  $: step = parseInt($page.url.searchParams.get("step") || "1");
  $: pageMeta.set({ title: step === 1 ? "Request for password reset" : "Verify otp code" });

  const { form, errors, enhance, submitting } = superForm($page.form, {
    resetForm: true,
    invalidateAll: false,
    taintedMessage: false,
    validators: resetPasswordSchema,
    defaultValidator: "clear",
    flashMessage: { module: flashModule }
  });

  $: if ($page.url.searchParams.has("email")) {
    $form.email = $page.url.searchParams.get("email");
  }

  const resend = () => {
    toast.loading("Please wait...", { id: "reset-pwd" });
  };

  $: validEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
    $form.email
  );
  $: if (!validEmail) {
    step = 1;
  }
</script>

<form
  method="post"
  action={step === 1 ? "?/requestReset" : "?/verifyResetPwdOtp"}
  class="space-y-3"
  use:enhance>
  <div class="mt-2">
    <label for="email" class="text-gray-800 dark:text-gray-200">Email address</label>
    <input
      id="email"
      type="email"
      name="email"
      bind:value={$form.email}
      data-invalid={$errors.email}
      placeholder="Enter your email address."
      class="block w-full text-sm rounded-xl border-2 border-white shadow outline-none focus:border-primary-500 focus:ring-0 dark:bg-gray-700 dark:border-gray-600 dark:focus:border-primary-500 dark:placeholder-gray-300 py-2.5"
      class:disabled={step === 2}
      readonly={step === 2} />
    {#if $errors.email}
      <small class="text-red-500">{$errors.email}</small>
    {/if}

    <div class="inline-flex w-full justify-end text-sm">
      {#if step === 2}
        <a
          href="/reset-pwd?step=1&email="
          class="text-primary-500 hover:underline"
          on:click|preventDefault={() => (step = 1)}>Wrong email address?</a>
      {:else if validEmail}
        <a
          href="/reset-pwd?step=2"
          class="text-primary-500 hover:underline"
          on:click|preventDefault={() => (step = 2)}>Already have a code?</a>
      {/if}
    </div>

    {#if step === 2}
      <div class="flex flex-col">
        <label for="otp" class="text-gray-800 dark:text-gray-200">OTP Code</label>
        <input
          id="otp"
          name="otp"
          type="number"
          bind:value={$form.otp}
          data-invalid={$errors.otp}
          placeholder="Enter your otp code."
          class="block w-full text-sm rounded-xl border-2 border-white shadow outline-none focus:border-primary-500 focus:ring-0 dark:bg-gray-700 dark:border-gray-600 dark:focus:border-primary-500 dark:placeholder-gray-300 py-2.5" />

        <button
          type="submit"
          formaction="?/requestReset"
          class="ml-auto text-primary-500 dark:text-primary-400 hover:underline">Resend otp</button>

        {#if $errors.otp}
          <small class="text-red-500">{$errors.otp}</small>
        {/if}
      </div>
    {/if}

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

    <!--   <TextInput
    required
    id="email"
    disabled={step === 2}
    error={$errors.email?.[0]}
    placeholder="Please enter your email address.">
    <svelte:fragment slot="label">
      <i class="i-bi-at" />
      <small>Email address</small>
    </svelte:fragment>
    <div slot="help-block" class="inline-flex w-full justify-end text-sm">
      {#if step === 2}
        <button type="button" class="text-primary-500 hover:underline" on:click={() => (step = 1)}
          >Wrong email address?</button>
      {:else if $isValid}
        <button type="button" class="text-primary-500 hover:underline" on:click={() => (step = 2)}
          >Already have a code?</button>
      {/if}
    </div>
  </TextInput>
  {#if step === 2}
    <TextInput
      required
      id="otp"
      type="tel"
      maxlength="6"
      error={$errors.otp?.[0]}
      placeholder="Please enter the six digit otp.">
      <svelte:fragment slot="label">
        <i class="i-bi-at" />
        <small>OTP Code</small>
      </svelte:fragment>
      <svelte:fragment slot="addon-block">
        <button type="button" class="pr-3" title="resend code" on:click={resend}
          ><i class="i-bi-arrow-repeat" /></button>
      </svelte:fragment>
    </TextInput>
  {/if}
  {#if step === 1}
    <button
      type="submit"
      class="btn btn-primary w-full"
      disabled={$requestResetPasswordMutation.isLoading}>
      {$requestResetPasswordMutation.isLoading ? "Submitting..." : "Submit"}
    </button>
  {:else}
    <button
      type="submit"
      class="btn btn-primary w-full"
      disabled={$requestResetPasswordMutation.isLoading}>
      {$requestResetPasswordMutation.isLoading ? "Verifying..." : "Verify Otp"}
    </button>
  {/if} -->
  </div>
</form>
