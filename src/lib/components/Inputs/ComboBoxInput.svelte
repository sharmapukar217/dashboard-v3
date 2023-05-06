<script lang="ts">
  import AutoComplete from "simple-svelte-autocomplete";

  type T = $$Generic;

  export let items: T;
  export let id: string;
  export let name: string = id;
  export let error: string | undefined = undefined;
  export let value: string | null = undefined;
  export let inputClassName: string | undefined = undefined;
  export let valueFieldName: string | undefined = undefined;
  export let refetchFunction: () => void = undefined;

  let selected = items?.find((i) => i[valueFieldName] === value);
</script>

<slot name="label">
  <label for={id} class="capitalize">{id}</label>
</slot>
<div class="relative">
  <AutoComplete
    bind:selectedItem={selected}
    hideArrow
    inputId={id}
    noInputStyles
    {inputClassName}
    {valueFieldName}
    className="w-full"
    aria-invalid={!!error}
    bind:value
    {name}
    {items}
    dropdownClassName="!border-gray-300 shadow rounded-md !dark:bg-gray-700 !dark:text-white !dark:border-gray-500 p-0.5! children:rounded-md dark:children:text-white! children:py-2! max-h-30 overflow-auto !max-h-50"
    {...$$restProps}>
    <div slot="item" let:item let:label>
      <slot name="item" {item} {label}>
        {@html label}
      </slot>
    </div>
  </AutoComplete>
  {#if !!refetchFunction}
    <button type="button" class="absolute right-2 top-2" on:click={refetchFunction}
      ><i class="i-bi-arrow-repeat w-5 h-5" /></button>
  {/if}
</div>

{#if error}
  <small class="text-red-500">{error}</small>
{/if}
