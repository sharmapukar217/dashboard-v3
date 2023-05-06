<script lang="ts">
  import { toast } from "$lib/utilities/toast";
  import { authStore } from "$lib/stores/authStore";
  import { previousUrl } from "$lib/stores/previousUrl";
  import { Redirect } from "$lib/components/Navigation";
  import { ensureRoles } from "$lib/utilities/functions";

  const showLoginToast = () => {
    if (window.__PREVENT_AUTH_TOAST__) return;
    toast.show({
      id: "auth",
      type: "error",
      dismissable: false,
      message: "Please login to your account to continue..."
    });
  };

  const showUnauthorizedToast = () => {
    if (window.__PREVENT_AUTH_TOAST__) return;
    toast.show({
      id: "auth",
      type: "warning",
      dismissable: false,
      message: "You're not allowed to perform this action..."
    });
  };

  let isAuthorized = true;
  export let roles: Array<string> | undefined = [];
  $: if (roles?.length) {
    isAuthorized = ensureRoles($authStore.currentUser?.role, roles);
  }
</script>

{#if $authStore.isLoading}
  <slot name="loading">loading...</slot>
{:else if !$authStore.currentUser}
  <slot name="unauthenticated">
    <Redirect to="/login" on:redirect-complete={showLoginToast} />
  </slot>
{:else if !isAuthorized}
  <slot name="unauthorized">
    <Redirect to="/" on:redirect-complete={showUnauthorizedToast} />
  </slot>
{:else}
  <slot />
{/if}
