<script lang="ts">
  import { page } from "$app/stores";
  import { pageMeta } from "$lib/stores/pageMeta";

  pageMeta.set({ title: "Request for password reset" });
  $: params = Object.fromEntries($page.url.searchParams);
</script>

<div class="sm:w-md mx-auto mt-10 w-full select-none px-2">
  <div class="w-full md:max-w-md flex flex-col mx-auto px-6 md:py-6 select-none">
    <div class="mx-auto text-center mt-5">
      <h1 class="text-2xl">LogikinNepal</h1>
      <h2>
        {#if !params.otp && !params.token}
          Request for password reset
        {:else}
          Reset your password
        {/if}
      </h2>
    </div>
  </div>
  {#if !params.otp && !params.token}
    {#await import("./EnterEmailScreen.svelte") then comp}
      <svelte:component this={comp.default} />
    {/await}
  {:else}
    {#await import("./EnterPasswordScreen.svelte") then comp}
      <svelte:component this={comp.default} />
    {/await}
  {/if}

  <div class="py-5 text-center">
    <a href="/login">back to login</a>
  </div>
</div>
