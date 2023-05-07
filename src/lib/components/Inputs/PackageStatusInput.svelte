<script lang="ts">
  import { clsx } from "clsx";
  import { authStore } from "$lib/stores/authStore";
  import { ensureRoles } from "$lib/utilities/functions";
  import { PACKAGE_STATUS } from "$lib/utilities/constants";

  export let id: string = undefined;
  let className: string | undefined = undefined;
  export let value: string | undefined = undefined;
  export let error: string | undefined = undefined;
  export { className as class };

  export let pickupPerson: string | undefined = undefined;
  export let returnPerson: string | undefined = undefined;
  export let deliveryPerson: string | undefined = undefined;

  let _initialValue = value;

  $: idx = PACKAGE_STATUS.indexOf(value);
  $: currentRole = $authStore.currentUser?.role;
  $: currentUsername = $authStore.currentUser?.username;

  $: options = PACKAGE_STATUS.map((s, i) => {
    let disabled = true;

    if (ensureRoles(currentRole, ["SUPERUSER"])) {
      disabled = false;
    } else if (ensureRoles(currentRole, ["ADMINUSER"])) {
      disabled = idx > i;
    } else if (ensureRoles(currentRole, ["VENDORUSER"])) {
      disabled = i > 1;
    } else {
      if (currentUsername === pickupPerson && value === "PICKUP_PROCESSING") {
        disabled = s !== "PICKUP_VERIFIED";
      }
      if (currentUsername === deliveryPerson && value === "DELIVERY_PROCESSING") {
        disabled = !["DELIVERY_POSPONED", "DELIVERED", "DELIVERY_CANCELLED"].includes(s);
      } else if (currentUsername === returnPerson && value === "RETURN_TO_VENDOR") {
        disabled = s !== "RETURNED";
      }
    }

    return { value: s, title: s, disabled };
  });
</script>

<label for="status" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
  >Package Status</label>
<div class="relative">
  <select
    {id}
    bind:value
    class={clsx(
      "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500",
      {
        [`${className}`]: !!className
      }
    )}
    {...$$restProps}
    aria-invalid={!!error}>
    <option disabled value>Please select a package status.</option>
    {#each options as option (option.value)}
      <option value={option.value} disabled={option.disabled}>{option.title}</option>
    {/each}
  </select>

  {#if _initialValue !== value}
    <button
      class="absolute h-90% right-0.5 top-0.5 bottom-0.5 bg-gray-50 dark:bg-gray-700 z-10 rounded-r-lg px-2"
      on:click={() => (value = _initialValue)}>
      <i class="i-bi-arrow-clockwise w-6 h-6" title="Reselect" />
    </button>
  {/if}

  {#if error}
    <small class="text-red-500">{error}</small>
  {/if}
</div>
