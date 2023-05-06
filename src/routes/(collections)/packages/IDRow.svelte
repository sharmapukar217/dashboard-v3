<script lang="ts">
  export let id: string;
  export let createdAt: string;
  // const handlePin = () => {
  // 	console.log("pin this");
  // }
</script>

<div>
  <div class="inline-flex items-center">
    <small class="text-primary-500 font-bold block">{new Date(createdAt).toLocaleString()} </small>
  </div>
  <br />
  <a href="/packages/{id}" class="badge text-center hover:text-blue-500">{id}</a>
</div>
