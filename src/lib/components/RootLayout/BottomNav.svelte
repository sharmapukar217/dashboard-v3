<script lang="ts">
  import { navlinks } from "./utils";
  import { swipe } from "$lib/actions/swipe";
  import { authStore } from "$lib/stores/authStore";
  import { NavLink } from "$lib/components/Navigation";
  import { ensureRoles } from "$lib/utilities/functions";

  const handleSwipe = (ev: any) => {};
</script>

{#if !!$authStore.currentUser}
  <div
    use:swipe
    id="bottom-nav"
    on:swiping={handleSwipe}
    class="inline-flex md:hidden bg-white border-t pt-1.5 w-full children:w-full dark:(bg-black border-gray-700)">
    {#each navlinks as link (link.href)}
      {#if !link.roles || ensureRoles($authStore.currentUser?.role, link.roles)}
        <NavLink
          href={link.href}
          exact={link.href === "/"}
          activeclass="!text-primary-600 !dark:text-primary-400 font-medium border-b-2 border-primary-500"
          class="inline-flex flex-col items-center text-center justify-center text-gray-800/80 hover:text-black dark:(text-gray-400 hover:text-white)">
          <i class="w-6 h-6 {link.icon}" />
          <small class="text-xs">{link.title}</small>
        </NavLink>
      {/if}
    {/each}

    <NavLink
      exact
      href="/settings"
      activeclass="!text-primary-600 !dark:text-primary-400 font-medium border-b-2 border-primary-500"
      class="inline-flex flex-col items-center text-center justify-center text-gray-800/80 hover:text-black dark:(text-gray-400 hover:text-white)">
      <i class="w-6 h-6 i-bi-gear" />
      <small class="text-xs">Settings</small>
    </NavLink>
  </div>
{/if}
