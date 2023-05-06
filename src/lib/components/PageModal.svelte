<script lang="ts">
  export let onClose: (() => void) | undefined = undefined;
</script>

<div class="z-15 fixed inset-0 bg-black/30" on:click={onClose} on:keyup />
<div
  class="z-100 hw-full dark:bg-dark-800 fixed top-0 right-0 select-none overflow-auto bg-white shadow md:max-w-3xl flex flex-col">
  <slot name="header" />
  <div class="hw-full overflow-auto">
    <slot />
  </div>
  <slot name="footer" />
</div>
