<script>
  import { pageMeta } from "$lib/stores/pageMeta";
  import WithAuth from "$lib/components/WithAuth.svelte";

  pageMeta.set({ title: "Dashboard" });
</script>

<WithAuth />
