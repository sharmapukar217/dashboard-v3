<script lang="ts">
  export let data: any = {};
  const date = new Date(data.statusUpdatedAt).toLocaleString();
  const { status, PickupPerson, DeliveryPerson, ReturnPerson } = data;
  const assignedTo = ReturnPerson?.username || DeliveryPerson?.username || PickupPerson?.username;
  const assignedFor = ReturnPerson?.username
    ? "return"
    : DeliveryPerson?.username
    ? "delivery"
    : PickupPerson?.username
    ? "pickup"
    : null;

  const title = assignedFor ? `assigned as \`${assignedFor}Person\` to @${assignedTo}` : undefined;

  const getBadgeForStatus = (status: string) => {
    if (status.includes("PROCESSING")) return "badge-primary";
    else if (status.includes("CANCELLED")) return "badge-red";
    else if (status.includes("POSPONED")) return "badge-yellow";
    else if (status.includes("DELIVERED")) return "badge-green";
    else return "badge-teal";
  };
</script>

<details class="block inline-block" open>
  <summary class="badge {getBadgeForStatus(status)} text-sm text-center">{status}</summary>
  <div class="">
    <div class="text-xs">
      Last updated by: <div class="text-primary-500">@{data.StatusUpdatedBy?.username}</div>
    </div>
    <small class="font-bold text-gray-700 dark:text-gray-300">at {date}</small>
    {#if assignedFor && assignedTo}
      <hr class="my-1 dark:border-gray-700" />
      <div class="text-xs">
        {assignedFor} assigned to:
        <div class="text-primary-500">@{assignedTo}</div>
      </div>
    {:else if data}{/if}
  </div>
</details>
{#if assignedTo}
  <span class="text-blue-500 hover:underline block" {title}>@{assignedTo}</span>
{/if}
