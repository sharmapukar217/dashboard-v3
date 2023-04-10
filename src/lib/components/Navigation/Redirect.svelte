<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount, createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  onMount(() => {
    dispatch("redirect-start");
    goto(to)
      .then(() => dispatch("redirect-complete"))
      .catch(() => dispatch("redirect-error"));
  });

  export let to: string;
</script>
