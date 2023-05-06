<script lang="ts">
  export let data: any;
  const date = new Date(data.statusUpdatedAt).toLocaleString();
  const { status, pickupPerson, deliveryPerson, returnPerson } = data;
  const assignedTo = returnPerson || deliveryPerson || pickupPerson;
  const assignedFor = returnPerson ? "return" : deliveryPerson ? "delivery" : "pickup";
  const title = `assigned as \`${assignedFor}Person\` to @${assignedTo}`;

  const getBadgeForStatus = (status: string) => {
    if (status.includes("PROCESSING")) return "badge-primary";
    else if (status.includes("CANCELLED")) return "badge-red";
    else if (status.includes("POSPONED")) return "badge-yellow";
    else if (status.includes("DELIVERED")) return "badge-green";
    else return "badge-teal";
  };
</script>

<div class="badge {getBadgeForStatus(status)} text-sm text-center">{status}</div>
<br />
{#if assignedTo}
  <span class="text-blue-500 hover:underline block" {title}>@{assignedTo}</span>
{:else}
  <small class="font-bold text-gray-700">{date}</small>
{/if}
