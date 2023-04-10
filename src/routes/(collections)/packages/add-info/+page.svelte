<script lang="ts">
  import { goto } from "$app/navigation";
  import PageModal from "$lib/components/PageModal.svelte";

  const handleClose = () => {
    goto("/packages");
  };
</script>

<PageModal onClose={handleClose}>
  <div slot="header">header</div>
  <div slot="footer">footer</div>
</PageModal>
