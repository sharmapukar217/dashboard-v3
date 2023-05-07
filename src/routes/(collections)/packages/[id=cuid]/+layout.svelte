<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  import { NavLink } from "$lib/components/Navigation";
  import WithAuth from "$lib/components/WithAuth.svelte";
  import PageModal from "$lib/components/PageModal.svelte";
</script>

<WithAuth>
  <PageModal onClose={() => goto("/packages")}>
    <div slot="header" class="inline-flex items-center w-full p-1 border-b dark:border-gray-700">
      <NavLink
        exact
        href="/packages/{$page.params.id}"
        class="w-full rounded-xl py-3 text-center font-medium"
        activeclass="text-primary-500 dark:text-primary-400 bg-gray-100 dark:bg-gray-800 border dark:border-2 dark:border-gray-600"
        >Package Info</NavLink>
     <!--  <NavLink
        exact
        href="/packages/{$page.params.id}/activities"
        class="w-full rounded-xl py-3 text-center font-medium"
        activeclass="text-primary-500 dark:text-primary-400 bg-gray-100 dark:bg-gray-800 border dark:border-2 dark:border-gray-600"
        >Activities</NavLink> -->
    </div>

    <slot />
  </PageModal>
</WithAuth>
