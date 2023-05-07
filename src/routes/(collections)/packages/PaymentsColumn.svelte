<script lang="ts">
  export let method: string = "NOT_PAID";
  export let verifiedAt: Date | undefined = undefined;
  export let verifiedBy: string | undefined = undefined;

  const getBadgeForMethod = (method: string) => {
    if (method === "NOT_PAID") return "badge-red";
    else return "badge-green";
  };
</script>

<details class="block inline-block" open>
  <summary class="badge {getBadgeForMethod(method)} text-sm text-center">{method}</summary>
  {#if verifiedBy && verifiedAt}
    <div class="">
      <div class="text-xs">
        Verified by: <div class="text-primary-500">@{verifiedBy}</div>
      </div>
      <small class="font-bold text-gray-700 dark:text-gray-300"
        >at {new Date(verifiedAt).toLocaleString()}</small>
    </div>
  {/if}
</details>
