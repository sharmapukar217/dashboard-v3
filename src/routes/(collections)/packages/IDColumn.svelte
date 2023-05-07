<script lang="ts">
  export let id: string;
  export let createdAt: string;
</script>

<div>
  <div class="inline-flex items-center">
    <small class="text-gray-500 dark:text-gray-300 font-bold block"
      >{new Date(createdAt).toLocaleString()}
    </small>
  </div>
  <br />
  <a href="/packages/{id}" class="badge text-center hover:text-primary-500">{id}</a>
</div>
