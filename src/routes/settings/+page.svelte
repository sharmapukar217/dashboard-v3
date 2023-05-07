<script lang="ts">
  import { clsx } from "clsx";
  import { page } from "$app/stores";
  import UAParser from "ua-parser-js";
  import { goto } from "$app/navigation";
  import { deserialize } from "$app/forms";
  import { superForm } from "sveltekit-superforms/client";
  import * as flashModule from "sveltekit-flash-message/client";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";

  import { pageMeta } from "$lib/stores/pageMeta";
  import { authStore } from "$lib/stores/authStore";
  import { ensureRoles } from "$lib/utilities/functions";
  import { PasswordInput } from "$lib/components/Inputs";
  import WithAuth from "$lib/components/WithAuth.svelte";
  import { PALETTES, appTheme } from "$lib/stores/appTheme";
  import { onLoadUserSessions, onLoadConnectedAccounts } from "$lib/functions/auth.telefunc";

  import {
    profileSchema,
    updateVendorSchema,
    updatePasswordSchema
  } from "$lib/utilities/zod-schema";

  export let data;

  $: if ($authStore.currentUser) {
    pageMeta.set({
      title: `Accounts & Settings (@${$authStore.currentUser.username})`
    });
  }

  const queryClient = useQueryClient();
  const userSessions = createQuery({
    queryKey: ["user-sessions"],
    staleTime: 10_000,
    refetchOnWindowFocus: true,
    initialData: data.userSessions,
    queryFn: () => onLoadUserSessions()
  });

  const connectedAccounts = createQuery({
    queryKey: ["user-accounts"],
    staleTime: 10_000,
    refetchOnWindowFocus: true,
    initialData: data.connectedAccounts,
    queryFn: () => onLoadConnectedAccounts()
  });

  const {
    form: profileForm,
    errors: profileErrors,
    enhance: profileFormEnhance,
    submitting: profileSubmitting
  } = superForm(data.profileForm, {
    id: "profile-form",
    invalidateAll: false,
    taintedMessage: false,
    validators: profileSchema,
    defaultValidator: "clear",
    flashMessage: { module: flashModule },
    onResult({ result }) {
      if (result.type === "success" && result.data.updatedProfile) {
        queryClient.setQueryData(["current-user"], (prev: any) => ({
          ...prev,
          ...result.data.updatedProfile
        }));
      }
    }
  });

  const {
    form: vendorForm,
    errors: vendorErrors,
    enhance: vendorFormEnhance,
    submitting: vendorSubmitting
  } = superForm(data.vendorForm, {
    id: "vendor-form",
    invalidateAll: false,
    taintedMessage: false,
    defaultValidator: "clear",
    validators: updateVendorSchema,
    flashMessage: { module: flashModule }
  });

  const {
    form: updatePasswordForm,
    errors: updatePasswordErrors,
    enhance: updatePasswordFormEnhance,
    submitting: updatePasswordSubmitting
  } = superForm($page.form?.updatePasswordForm, {
    id: "update-password-form",
    resetForm: true,
    invalidateAll: false,
    taintedMessage: false,
    defaultValidator: "clear",
    validators: updatePasswordSchema,
    flashMessage: { module: flashModule },
    async onResult({ result }) {
      if (result.type === "success") {
        if (confirm("Do you want to logout from other devices too?")) {
          await fetch("/logout?/revokeAll", { method: "POST", body: new FormData() });
          await queryClient.invalidateQueries(["user-sessions"]);
          await flashModule.updateFlash(page);
        }
      }
    }
  });

  const handleRevokeAll = async (ev: any) => {
    ev.preventDefault();
    if (!confirm("Do you really want to logout your account from all the device?")) {
      return;
    }

    await fetch("/logout?/revokeAll", { method: "POST", body: new FormData() });
    await queryClient.invalidateQueries(["user-sessions"]);
    await flashModule.updateFlash(page);
  };

  const handleRevoke = async (ev: any) => {
    ev.preventDefault();

    if (!confirm("Do you really want to logout your account from this device?")) {
      return;
    }

    const body = new FormData(ev.target);
    const response = await fetch(ev.target.action, {
      body,
      method: "post",
      headers: { "x-sveltekit-action": true }
    });
    const result = deserialize(await response.text());
    if (result.type === "success") {
      const sid = body.get("sid");
      queryClient.setQueryData(["user-sessions"], (prev: any) => {
        return prev.filter((p) => p.sid !== sid);
      });
    }
    await flashModule.updateFlash(page);
  };

  let imgRef: any;
  let _imgSrc: any;
  let isUploaded = false;

  const handleUpload = (ev: any) => {
    const imgFile = ev.target.files[0];
    if (imgFile) {
      isUploaded = true;
      _imgSrc = imgRef.src;
      imgRef.src = window.URL.createObjectURL(imgFile);
    }
  };

  const handleCancelUploadProfile = () => {
    if(inputEl) inputEl.reset()
    imgRef.src = _imgSrc;
    isUploaded = false;
  };

  const handleDisconnect = (ev: any) => {
    ev.preventDefault();
    const provider = ev.target.getAttribute("data-provider");
    if (provider && confirm(`Do you really want to disconnect your account from ${provider}?`)) {
      goto(ev.target.href);
    }
  };

  const handleCancelBugReport = (ev: any) => {
    if (confirm(`Do you really want to cancel reporting?`)) {
      // todo cancel report form
    }
  }
</script>

<WithAuth>
  <div class="grid grid-cols-1 px-4 xl:grid-cols-3 xl:gap-4 select-none">
    <div class="col-span-full">
      <div class="inline-flex items-center space-x-2 text-sm font-medium mt-4 mb-2">
        <a
          href="/"
          class="inline-flex items-center text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
          <i class="i-bi-house w-5 h-5 mr-1" />
          Home
        </a>
        <span>/</span>
        <a
          href="/packages"
          class="ml-1 text-gray-700 pointer-events-none md:ml-2 dark:text-gray-300">
          <i class="i-bi-gear-wide-connected w-4 h-4 mr-1" />
          Settings
        </a>
      </div>

      <h1 class="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
        Accounts &amp; settings
      </h1>
    </div>
    <!-- left side content -->
    <div class="col-span-full xl:col-auto">
      <!-- profile picture -->
      <div
        class="p-4 mb-4 bg-white border border-gray-200 rounded-xl shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <div class="items-center sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4">
          <img
            alt=""
            bind:this={imgRef}
            src={$authStore.currentUser?.picture}
            class="mb-4 rounded-xl w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0" />
          <div>
            <h3 class="mb-1 text-xl font-bold text-gray-900 dark:text-white">Profile picture</h3>
            <div class="mb-4 text-sm text-gray-500 dark:text-gray-400">
              JPG, GIF or PNG. Max size of 800K
            </div>
            <div class="flex items-center space-x-4">
              <form class="inline-flex items-center space-x-2">
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  accept="image/*"
                  hidden
                  on:change={handleUpload} />
                {#if isUploaded}
                  <button
                    type="submit"
                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-xl !bg-primary-700 !hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 !dark:bg-primary-600 !dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                    <i class="i-heroicons-cloud-arrow-up h-5 w-5 mr-2" />
                    Submit
                  </button>

                  <button
                    type="button"
                    on:click={handleCancelUploadProfile}
                    class="py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-xl border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                    Cancel
                  </button>
                {:else}
                  <label
                    for="profilePicture"
                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-xl !bg-primary-700 !hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 !dark:bg-primary-600 !dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                    <i class="i-heroicons-cloud-arrow-up h-5 w-5 mr-2" />
                    Upload picture
                  </label>
                  <button
                    type="button"
                    class="py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-xl border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                    Delete
                  </button>
                {/if}
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- social menu -->
      <div
        class="p-4 bg-white border border-gray-200 rounded-xl shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <h3 class="text-xl font-semibold dark:text-white">Social accounts</h3>
        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
          <li class="py-2">
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <i class="i-bi-google w-6 h-6 text-[#4285F4]" />
              </div>
              <div class="flex-1 min-w-0">
                <span class="block text-base font-semibold text-gray-900 truncate dark:text-white">
                  Google account
                </span>
              </div>
              <div class="inline-flex items-center">
                {#if $connectedAccounts.data?.has("google")}
                  <a
                    data-provider="google"
                    on:click={handleDisconnect}
                    href="/oauth/google/disconnect"
                    class="px-3 py-2 mb-3 mr-3 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                    >Disconnect</a>
                {:else}
                  <a
                    href="/oauth/google?action=link-account"
                    class="px-3 py-2 mb-3 mr-3 text-sm font-medium text-center text-white rounded-xl bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    >Connect</a>
                {/if}
              </div>
            </div>
          </li>
          <li class="py-2">
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <i class="i-bi-facebook w-6 h-6 text-[#3b5998] dark:text-blue-400" />
              </div>
              <div class="flex-1 min-w-0">
                <span class="block text-base font-semibold text-gray-900 truncate dark:text-white">
                  Facebook account
                </span>
              </div>
              <div class="inline-flex items-center">
                {#if $connectedAccounts.data?.has("facebook")}
                  <a
                    data-provider="facebook"
                    on:click={handleDisconnect}
                    href="/oauth/facebook/disconnect"
                    class="px-3 py-2 mb-3 mr-3 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                    >Disconnect</a>
                {:else}
                  <a
                    href="/oauth/facebook?action=link-account"
                    class="px-3 py-2 mb-3 mr-3 text-sm font-medium text-center text-white rounded-xl bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    >Connect</a>
                {/if}
              </div>
            </div>
          </li>
          <!-- WIP: Not implemented twitter -->
          <li class="py-4 hidden">
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <i class="i-bi-twitter h-6 w-6 text-[#1da1f2]" />
              </div>
              <div class="flex-1 min-w-0">
                <span class="block text-base font-semibold text-gray-900 truncate dark:text-white">
                  Twitter account
                </span>
              </div>
              <div class="inline-flex items-center">
                {#if $connectedAccounts.data?.has("twitter")}
                  <a
                    data-provider="twitter"
                    on:click={handleDisconnect}
                    href="/oauth/twitter/disconnect"
                    class="px-3 py-2 mb-3 mr-3 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                    >Disconnect</a>
                {:else}
                  <a
                    href="/oauth/twitter?action=link-account"
                    class="px-3 py-2 mb-3 mr-3 text-sm font-medium text-center text-white rounded-xl bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    >Connect</a>
                {/if}
              </div>
            </div>
          </li>
          <li class="py-4">
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <i class="i-bi-github h-6 w-6 text-[#24292F] dark:text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <span class="block text-base font-semibold text-gray-900 truncate dark:text-white">
                  Github account
                </span>
                <span class="block text-sm font-normal text-gray-500 truncate dark:text-gray-400">
                  Not connected
                </span>
              </div>
              <div class="inline-flex items-center">
                {#if $connectedAccounts.data?.has("github")}
                  <a
                    data-provider="github"
                    on:click={handleDisconnect}
                    href="/oauth/github/disconnect"
                    class="px-3 py-2 mb-3 mr-3 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                    >Disconnect</a>
                {:else}
                  <a
                    href="/oauth/github?action=link-account"
                    class="px-3 py-2 mb-3 mr-3 text-sm font-medium text-center text-white rounded-xl bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    >Connect</a>
                {/if}
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- vendor info settings -->

      <div
        class="p-4 mt-4 bg-white border border-gray-200 rounded-xl shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <h3 class="text-xl font-semibold dark:text-white">Vendor information</h3>
        <form
          method="post"
          action="?/updateVendorInfo"
          autocomplete="off"
          class="space-y-3 mt-3"
          use:vendorFormEnhance
          disabled={!ensureRoles($authStore.currentUser?.role, [
            "SUPERUSER",
            "ADMINUSER",
            "VENDORUSER"
          ])}>
          <div class="w-full sm:w-3/4">
            <label
              for="vendorName"
              class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
              >Vendor name</label>
            <input
              type="text"
              id="vendorName"
              name="vendorName"
              bind:value={$vendorForm.vendorName}
              aria-invalid={!!$vendorErrors.vendorName}
              class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Enter the vendor name"
              required />
            {#if $vendorErrors.vendorName}
              <small class="text-red-500">{$vendorErrors.vendorName}</small>
            {/if}
          </div>

          <div class="w-full">
            <label
              for="vendorAddress"
              class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
              >Vendor address</label>
            <input
              type="text"
              id="vendorAddress"
              name="vendorAddress"
              bind:value={$vendorForm.vendorAddress}
              aria-invalid={!!$vendorErrors.vendorAddress}
              class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Enter the full address"
              required />
            {#if $vendorErrors.vendorAddress}
              <small class="text-red-500">{$vendorErrors.vendorAddress}</small>
            {/if}
          </div>

          <div class="w-full">
            <label
              for="vendorEmail"
              class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
              >Email Address</label>
            <input
              type="email"
              id="vendorEmail"
              name="vendorEmail"
              bind:value={$vendorForm.vendorEmail}
              aria-invalid={!!$vendorErrors.vendorEmail}
              class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Enter the email address of vendor"
              required />
            {#if $vendorErrors.vendorEmail}
              <small class="text-red-500">{$vendorErrors.vendorEmail}</small>
              <br />
            {/if}
            <small class="text-gray-500 text-xs"
              >This email is used for emails, notifications and alerts.</small>
          </div>

          {#if $vendorForm.mainVendorName}
            <div class="w-full">
              <label
                for="mainVendorName"
                class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
                >Main Vendor</label>
              <input
                type="text"
                id="mainVendorName"
                name="mainVendorName"
                bind:value={$vendorForm.mainVendorName}
                class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                readonly
                disabled />
            </div>
          {/if}

          <div class="col-span-6 sm:col-full">
            <button
              class="text-white !bg-primary-700 !hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-xl text-sm px-5 py-2.5 text-center !dark:bg-primary-600 !dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              type="submit"
              disabled={$vendorSubmitting}>
              {#if $vendorSubmitting}
                <i class="i-svg-spinners:3-dots-scale w-6 h-6 mr-2" />
              {:else}
                Update information
              {/if}
            </button>
          </div>
        </form>
      </div>

      <!-- report bugs -->
      <details
        class="p-4 mt-4 bg-white border border-gray-200 rounded-xl shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <summary class="text-xl font-semibold dark:text-white cursor-pointer"
          >Bugs & Reports</summary>
        <div class="text-xs text-gray-500 dark:text-gray-300">
          Report for the bugs or provide feedbacks.
        </div>

        <form method="post" action="?/report" autocomplete="off" class="space-y-3 pt-4">
          <div class="w-full sm:w-2/3">
            <label
              for="reporterUsername"
              class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Username</label>
            <input
              type="text"
              id="reporterUsername"
              name="reporterUsername"
              value={$authStore.currentUser?.username}
              class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Enter your username"
              disabled
              readonly />
            {#if $profileErrors.username}
              <small class="text-red-500">{$profileErrors.username}</small>
            {/if}
          </div>

          <div class="w-full sm:w-3/4">
            <label
              for="reportType"
              class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Type</label>
            <select
              id="reportType"
              name="reportType"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
              <option disabled selected>Please select an option.</option>
              <option value="report">Report a bug</option>
              <option value="feedback">Provide feedback</option>
              <option value="featueRequest">Request for feature</option>
            </select>
          </div>

          <div class="w-full">
            <label for="description" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Description</label>
            <textarea id="description" name="description" class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"></textarea>
          </div>

          <div class="w-full">
            <label for="screenshots" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Screenshots</label>
            <input type="file" name="screenshots" id="screenshots" class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" multiple>
          </div>

        </form>
      </details>
    </div>

    <!-- right side -->
    <div class="col-span-2 mt-4 md:m-0">
      <!-- general info -->
      <div
        class="p-4 mb-4 bg-white border border-gray-200 rounded-xl shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <h3 class="mb-4 text-xl font-semibold dark:text-white">General information</h3>
        <form
          method="post"
          action="?/updateProfile"
          autocomplete="off"
          class="space-y-3"
          use:profileFormEnhance>
          <div class="w-full sm:w-3/4">
            <label for="name" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
              >Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              bind:value={$profileForm.name}
              aria-invalid={!!$profileErrors.name}
              class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Enter your full name"
              required />
            {#if $profileErrors.name}
              <small class="text-red-500">{$profileErrors.name}</small>
            {/if}
          </div>

          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <div class="w-full">
              <label
                for="email"
                class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
                >Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                bind:value={$profileForm.email}
                aria-invalid={!!$profileErrors.email}
                class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Please enter your email address"
                required />
              {#if $profileErrors.email}
                <small class="text-red-500">{$profileErrors.email}</small>
              {/if}
            </div>

            <div class="w-full">
              <label
                for="username"
                class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
                >Username</label>
              <input
                type="text"
                id="username"
                name="username"
                bind:value={$profileForm.username}
                aria-invalid={!!$profileErrors.username}
                class="shadow-sm bg-gray-50 block border border-gray-300 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Please enter your username address" />
              {#if $profileErrors.username}
                <small class="text-red-500 block">{$profileErrors.username}</small>
              {/if}
            </div>
          </div>

          <div class="col-span-6 sm:col-full">
            <button
              class="text-white !bg-primary-700 !hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-xl text-sm px-5 py-2.5 text-center !dark:bg-primary-600 !dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              type="submit"
              disabled={$profileSubmitting}>
              {#if $profileSubmitting}
                <i class="i-svg-spinners:3-dots-scale w-6 h-6 mr-2" />
              {:else}
                Update profile
              {/if}
            </button>
          </div>
        </form>
      </div>

      <!-- update password -->
      <div
        class="p-4 mb-4 bg-white border border-gray-200 rounded-xl shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <h3 class="mb-4 text-xl font-semibold dark:text-white">Password information</h3>
        <form
          method="post"
          action="?/updatePassword"
          autocomplete="off"
          use:updatePasswordFormEnhance>
          <div class="grid grid-cols-6 gap-6">
            <div class="col-span-6 sm:col-span-3">
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                bind:value={$updatePasswordForm.currentPassword}
                error={$updatePasswordErrors.currentPassword?.[0]}
                required>
                <label
                  slot="label"
                  for="currentPassword"
                  class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
                  >Current password</label>
              </PasswordInput>
            </div>
            <div class="col-span-6 sm:col-span-3 relative">
              <PasswordInput
                showHints
                id="newPassword"
                name="newPassword"
                bind:value={$updatePasswordForm.newPassword}
                error={$updatePasswordErrors.newPassword?.[0]}
                required>
                <label
                  slot="label"
                  for="newPassword"
                  class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
                  >New password</label>
              </PasswordInput>
            </div>
            <div class="col-span-6 sm:col-span-3">
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                bind:value={$updatePasswordForm.confirmPassword}
                error={$updatePasswordErrors.confirmPassword?.[0]}
                required>
                <label
                  slot="label"
                  for="confirmPassword"
                  class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
                  >Confirm password</label>
              </PasswordInput>
            </div>
            <div class="col-span-6 sm:col-full">
              <button
                class="text-white !bg-primary-700 !hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-xl text-sm px-5 py-2.5 text-center !dark:bg-primary-600 !dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                type="submit"
                disabled={$updatePasswordSubmitting}>
                {#if $updatePasswordSubmitting}
                  <i class="i-svg-spinners:3-dots-scale w-6 h-6 mr-2" />
                {:else}
                  Update password
                {/if}</button>
            </div>
          </div>
        </form>
      </div>

      <!-- sessions -->
      <div
        class="p-4 mb-4 bg-white border border-gray-200 rounded-xl shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <div class="inline-flex items-center w-full pr-4">
          <h3 class="text-xl font-semibold dark:text-white">Sessions</h3>
          <button class="ml-auto" on:click={() => $userSessions.refetch()}>
            <i class="i-bi-arrow-repeat w-6 h-6" class:animate-spin={$userSessions.isRefetching} />
          </button>
        </div>
        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
          {#if $userSessions.isLoading}
            <h1>Loading...</h1>
          {:else}
            {#each $userSessions.data as session (session.sid)}
              {@const ua = UAParser(session.userAgent)}
              <li class="py-4">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    {#if ua.os.name.startsWith("Android")}
                      <i class="i-bi-android2 w-6 h-6 text-green-600" />
                    {:else if ua.os.name === "Linux"}
                      <i class="i-bi-ubuntu w-6 h-6 text-orange-600" />
                    {:else if ua.os.name.startsWith("Windows")}
                      <i class="i-bi-windows w-6 h-6 text-blue-500 dark:text-blue-400" />
                    {:else if ua.os.name === "iOS"}
                      <i class="i-bi-apple w-6 h-6 text-slate-400 dark:text-slate-200" />
                    {:else}
                      <i class="i-heroicons-computer-desktop w-6 h-6" />
                    {/if}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-normal text-gray-500 truncate dark:text-gray-400">
                      {ua.browser.name} on {ua.os.name}
                    </p>
                    <div class="text-base font-semibold text-gray-900 truncate dark:text-white">
                      <!-- <span>California</span> -->
                      <div
                        title={session.loggedIn ? "Logged in currently." : "Logged out."}
                        class={clsx("text-sm", {
                          "text-green-900 dark:text-green-400": session.loggedIn,
                          "text-gray-500": !session.loggedIn
                        })}>
                        {session.ipAddress}
                      </div>
                    </div>
                  </div>
                  <div class="inline-flex items-center">
                    <form method="post" action="?/revokeSession" on:submit={handleRevoke}>
                      <input type="hidden" name="sid" value={session.sid} />
                      <button
                        type="submit"
                        class="px-3 py-2 mb-3 mr-3 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                        class:disabled={session.current}
                        disabled={session.current ? "true" : undefined}>
                        {session.current ? "Current" : "Revoke"}
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            {/each}
          {/if}
        </ul>
        {#if $userSessions.data?.length > 1}
          <form
            method="post"
            action="/logout?/revokeAll"
            on:submit={handleRevokeAll}
            class="inline-flex items-center w-full border-t-2 pt-3 dark:border-gray-700">
            <button
              class="ml-auto px-3 py-2 mb-3 mr-3 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              >Revoke all</button>
          </form>
        {/if}
      </div>
      <!-- themes -->
      <div
        class="p-4 mb-4 bg-white border border-gray-200 rounded-xl shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <h3 class="text-xl font-semibold dark:text-white mb-3">Themes</h3>

        <div class="space-y-8">
          <div class="mb-10">
            <h1 class="font-medium text-sm">Interface theme</h1>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Customize your application theme
            </div>

            <div class="flex space-x-3 md:space-x-6 my-4">
              <div class="h-20 sm:h-25 md:h-30 w-full">
                <button
                  class={clsx(
                    "w-full h-full rounded-xl p-1 sm:p-1.5 bg-white shadow-sm border dark:border-gray-800 dark:bg-gray-700 relative flex",
                    {
                      "ring-2 ring-primary-500": $appTheme.mode === "system"
                    }
                  )}
                  on:click={() => ($appTheme.mode = "system")}>
                  <div
                    class="h-full w-full rounded-l-xl bg-gray-100 border border-r-0 border-gray-300" />
                  <div
                    class="h-full w-full rounded-r-xl bg-dark border border-l-0 border-gray-600" />
                </button>
                <span class="text-sm dark:text-gray-300 font-medium">System</span>
              </div>

              <div class="h-20 sm:h-25 md:h-30 w-full">
                <button
                  class={clsx(
                    "w-full h-full rounded-xl p-1 sm:p-1.5 bg-white shadow-sm border dark:border-gray-800 dark:bg-gray-700 relative flex",
                    {
                      "ring-2 ring-primary-500": $appTheme.mode === "light"
                    }
                  )}
                  on:click={() => ($appTheme.mode = "light")}>
                  <div class="h-full w-full rounded-lg bg-gray-100 border border-gray-300" />
                </button>
                <span class="text-sm dark:text-gray-300 font-medium">Light</span>
              </div>

              <div class="h-20 sm:h-25 md:h-30 w-full">
                <button
                  class={clsx(
                    "w-full h-full rounded-xl p-1 sm:p-1.5 bg-white shadow-sm border dark:border-gray-800 dark:bg-gray-700 relative flex",
                    {
                      "ring-2 ring-primary-500": $appTheme.mode === "dark"
                    }
                  )}
                  on:click={() => ($appTheme.mode = "dark")}>
                  <div class="h-full w-full rounded-xl bg-dark border border-gray-600" />
                </button>
                <span class="text-sm dark:text-gray-300 font-medium">Dark</span>
              </div>
            </div>
          </div>

          <div class="sm:flex space-y-2 items-center">
            <div>
              <h1 class="font-medium text-sm">Accent theme</h1>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                Select your application primary color (blue)
              </div>
            </div>
            <div class="ml-auto space-x-2 inline-flex items-center">
              {#each PALETTES as palette (palette)}
                <button
                  class={clsx(
                    `w-6 h-6 rounded-full bg-${palette}-500 ring-offset-2 dark:ring-offset-gray-800`,
                    {
                      "ring-2 ring-primary-500": palette === $appTheme.palette
                    }
                  )}
                  on:click={() => ($appTheme.palette = palette)} />
              {/each}
            </div>
          </div>

          <div>
            <h1 class="font-medium text-sm">Light navbar</h1>
            <div class="inline-flex items-center w-full">
              <div class="text-sm text-gray-500 dark:text-gray-400">
                Use light colored navbar on light mode
              </div>
              <label class="relative inline-flex items-center cursor-pointer ml-auto">
                <input type="checkbox" class="sr-only peer" bind:checked={$appTheme.lightNavBar} />
                <div
                  class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600" />
              </label>
            </div>
          </div>

          <div>
            <button
              class="text-white !bg-primary-700 !hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-xl text-sm px-5 py-2.5 text-center !dark:bg-primary-600 !dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              on:click={() => appTheme.saveTheme()}>Save preferences</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!--  <div class="grid grid-cols-1 px-4 xl:grid-cols-2 xl:gap-4 my-4">
    <div
      class="p-4 mb-4 bg-white border border-gray-200 rounded-xl shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800 xl:mb-0">
      <div class="flow-root">
        <h3 class="text-xl font-semibold dark:text-white">Alerts & Notifications</h3>
        <p class="text-sm font-normal text-gray-500 dark:text-gray-400">
          Update your preference to get push notifications.
        </p>
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div class="flex items-center justify-between py-4">
            <div class="flex flex-col flex-grow">
              <div class="text-lg font-semibold text-gray-900 dark:text-white">Company News</div>
              <div class="text-base font-normal text-gray-500 dark:text-gray-400">
                Get Themesberg news, announcements, and product updates
              </div>
            </div>
            <label for="company-news" class="relative flex items-center cursor-pointer">
              <input type="checkbox" id="company-news" class="sr-only" />
              <span
                class="h-6 bg-gray-200 border border-gray-200 rounded-full w-11 toggle-bg dark:bg-gray-700 dark:border-gray-600" />
            </label>
          </div>
          <div class="flex items-center justify-between py-4">
            <div class="flex flex-col flex-grow">
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                Account Activity
              </div>
              <div class="text-base font-normal text-gray-500 dark:text-gray-400">
                Get important notifications about you or activity you've missed
              </div>
            </div>
            <label for="account-activity" class="relative flex items-center cursor-pointer">
              <input type="checkbox" id="account-activity" class="sr-only" checked />
              <span
                class="h-6 bg-gray-200 border border-gray-200 rounded-full w-11 toggle-bg dark:bg-gray-700 dark:border-gray-600" />
            </label>
          </div>
          <div class="flex items-center justify-between py-4">
            <div class="flex flex-col flex-grow">
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                Meetups Near You
              </div>
              <div class="text-base font-normal text-gray-500 dark:text-gray-400">
                Get an email when a Dribbble Meetup is posted close to my location
              </div>
            </div>
            <label for="meetups" class="relative flex items-center cursor-pointer">
              <input type="checkbox" id="meetups" class="sr-only" checked />
              <span
                class="h-6 bg-gray-200 border border-gray-200 rounded-full w-11 toggle-bg dark:bg-gray-700 dark:border-gray-600" />
            </label>
          </div>
          <div class="flex items-center justify-between pt-4">
            <div class="flex flex-col flex-grow">
              <div class="text-lg font-semibold text-gray-900 dark:text-white">New Messages</div>
              <div class="text-base font-normal text-gray-500 dark:text-gray-400">
                Get Themsberg news, announcements, and product updates
              </div>
            </div>
            <label for="new-messages" class="relative flex items-center cursor-pointer">
              <input type="checkbox" id="new-messages" class="sr-only" />
              <span
                class="h-6 bg-gray-200 border border-gray-200 rounded-full w-11 toggle-bg dark:bg-gray-700 dark:border-gray-600" />
            </label>
          </div>
        </div>
        <div class="mt-6">
          <button
            class="text-white !bg-primary-700 !hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-xl text-sm px-5 py-2.5 text-center !dark:bg-primary-600 !dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >Save all</button>
        </div>
      </div>
    </div>
    <div
      class="p-4 mb-4 bg-white border border-gray-200 rounded-xl shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800 xl:mb-0">
      <div class="flow-root">
        <h3 class="text-xl font-semibold dark:text-white">Email Notifications</h3>
        <p class="text-sm font-normal text-gray-500 dark:text-gray-400">
          Update your preference to get notified on email.
        </p>
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div class="flex items-center justify-between py-4">
            <div class="flex flex-col flex-grow">
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                Rating reminders
              </div>
              <div class="text-base font-normal text-gray-500 dark:text-gray-400">
                Send an email reminding me to rate an item a week after purchase
              </div>
            </div>
            <label for="rating-reminders" class="relative flex items-center cursor-pointer">
              <input type="checkbox" id="rating-reminders" class="sr-only" />
              <span
                class="h-6 bg-gray-200 border border-gray-200 rounded-full w-11 toggle-bg dark:bg-gray-700 dark:border-gray-600" />
            </label>
          </div>
          <div class="flex items-center justify-between py-4">
            <div class="flex flex-col flex-grow">
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                Item update notifications
              </div>
              <div class="text-base font-normal text-gray-500 dark:text-gray-400">
                Send user and product notifications for you
              </div>
            </div>
            <label for="item-update" class="relative flex items-center cursor-pointer">
              <input type="checkbox" id="item-update" class="sr-only" checked />
              <span
                class="h-6 bg-gray-200 border border-gray-200 rounded-full w-11 toggle-bg dark:bg-gray-700 dark:border-gray-600" />
            </label>
          </div>
          <div class="flex items-center justify-between py-4">
            <div class="flex flex-col flex-grow">
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                Item comment notifications
              </div>
              <div class="text-base font-normal text-gray-500 dark:text-gray-400">
                Send me an email when someone comments on one of my items
              </div>
            </div>
            <label for="item-comment" class="relative flex items-center cursor-pointer">
              <input type="checkbox" id="item-comment" class="sr-only" checked />
              <span
                class="h-6 bg-gray-200 border border-gray-200 rounded-full w-11 toggle-bg dark:bg-gray-700 dark:border-gray-600" />
            </label>
          </div>
          <div class="flex items-center justify-between pt-4">
            <div class="flex flex-col flex-grow">
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                Buyer review notifications
              </div>
              <div class="text-base font-normal text-gray-500 dark:text-gray-400">
                Send me an email when someone leaves a review with their rating
              </div>
            </div>
            <label for="buyer-rev" class="relative flex items-center cursor-pointer">
              <input type="checkbox" id="buyer-rev" class="sr-only" />
              <span
                class="h-6 bg-gray-200 border border-gray-200 rounded-full w-11 toggle-bg dark:bg-gray-700 dark:border-gray-600" />
            </label>
          </div>
        </div>
        <div class="mt-6">
          <button
            class="text-white !bg-primary-700 !hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-xl text-sm px-5 py-2.5 text-center !dark:bg-primary-600 !dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >Save all</button>
        </div>
      </div>
    </div>
  </div> -->
</WithAuth>
