<script lang="ts">
  import type { SvelteComponentTyped } from "svelte/internal";
  import { ComponentRenderConfig, Render } from "svelte-render";
  type Component = $$Generic<typeof SvelteComponentTyped<unknown, unknown, unknown>>;
  export let component: Component | ComponentRenderConfig | string | undefined = undefined;
</script>

{#if component instanceof ComponentRenderConfig}
  <Render of={component} {...$$restProps} />
{:else if typeof component === "string"}
  {@html component}
{:else}
  <svelte:component this={component} {...$$restProps} />
{/if}
