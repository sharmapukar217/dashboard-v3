<script lang="ts">
  import { navlinks } from "./utils";
  import { authStore } from "$lib/stores/authStore";
  import { NavLink } from "$lib/components/Navigation";
</script>

{#if !!$authStore.currentUser}
  <div
    id="bottom-nav"
    class="inline-flex md:hidden bg-white border-t pt-1.5 w-full children:w-full dark:(bg-black border-gray-700)">
    {#each navlinks as link (link.href)}
      <NavLink
        href={link.href}
        exact={link.href === "/"}
        activeclass="!text-primary-600 !dark:text-primary-400 font-medium"
        class="inline-flex flex-col items-center text-center justify-center text-gray-800/80 hover:text-black dark:(text-gray-400 hover:text-white)">
        <i class="w-6 h-6 {link.icon}" />
        <small class="text-xs">{link.title}</small>
      </NavLink>
    {/each}

    <NavLink
      exact
      href="/settings/account"
      activeclass="!text-primary-600 !dark:text-primary-400"
      class="inline-flex flex-col items-center text-gray-800/80 hover:text-black dark:(text-gray-400 hover:text-white)">
      <i class="w-6 h-6 i-bi-person-circle" />
      <small class="text-xs">Profile</small>
    </NavLink>
  </div>
{/if}
