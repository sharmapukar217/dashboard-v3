<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { deserialize, applyAction } from "$app/forms";
  import { updateFlash } from "sveltekit-flash-message/client";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";

  import { pageMeta } from "$lib/stores/pageMeta";
  import { authStore } from "$lib/stores/authStore";
  import { onLoadSavedAccounts } from "$lib/functions/auth.telefunc";

  export let data;

  pageMeta.set({ title: "Switch account" });

  const query = createQuery({
    refetchOnMount: true,
    queryKey: ["saved-accounts"],
    initialData: data.savedAccounts,
    queryFn: () => onLoadSavedAccounts()
  });

  const queryClient = useQueryClient();

  const handleSubmit = async (ev: SubmitEvent) => {
    ev.preventDefault();
    if (!ev.submitter) return;

    const action = ev.submitter.getAttribute("formaction");
    if (!action) return;

    const url = new URL(action, location.origin);
    const username = url.searchParams.get("username");

    const isLoginAction = url.search.includes("?/remove");

    if (!username) return;

    const message = isLoginAction
      ? `Remove @${username} from saved accounts?`
      : `Login as @${username}?`;

    if (confirm(message)) {
      const response = await fetch(action, {
        method: "POST",
        body: new FormData(),
        headers: {
          accept: "application/json",
          "x-sveltekit-action": "true"
        }
      });

      const result = deserialize(await response.text());
      await updateFlash(page);

      if (result.type === "success") {
        if (result.data?.currentUser) {
          queryClient.setQueryData(["current-user"], result.data.currentUser);
          await queryClient.invalidateQueries();
          await goto("/");
        } else if (result.data?.removed) {
          queryClient.setQueryData(["saved-accounts"], (data: any) => {
            return data.filter((d: any) => d.username !== username);
          });
        }
      } else {
        applyAction(result);
      }
    }
  };
</script>

<div class="h-full p-0.5 flex flex-col">
  <form
    method="POST"
    on:submit={handleSubmit}
    class="rounded-lg border-2 border-white dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shadow p-0.5 space-y-0.5 h-full overflow-auto">
    {#if $query.data?.length}
      {#each $query.data as account (account.id)}
        <div
          class="bg-white dark:bg-gray-800 rounded-lg py-1.5 px-2 text-base inline-flex w-full border-b dark:border-gray-700 dark:rounded-b-0">
          <div class="border-r dark:border-gray-600 pr-2">
            <img src={account.picture} alt="" class="rounded-full w-10 h-10" />
          </div>
          <div class="ml-2 text-left">
            <div class="block">{account.name}</div>
            <div class="inline-flex items-center block text-xs">
              <span class="text-primary-500 hover:underline cursor-pointer"
                >@{account.username}</span>
              {#if account.id === $authStore.currentUser?.id}
                <div class="ml-1 text-gray-500">(current)</div>
              {/if}
            </div>
          </div>

          <div class="ml-auto inline-flex space-x-1">
            {#if account.id !== $authStore.currentUser?.id}
              <button
                type="submit"
                formaction="?/login&username={account.username}&userId={account.id}"
                title="login as @{account.username}"
                class="my-auto text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md focus:ring-2 focus:ring-green-400 p-1 inline-flex justify-center">
                <i class="i-heroicons-chevron-right w-6 h-6" />
              </button>
            {/if}

            <button
              type="submit"
              formaction="?/remove&username={account.username}&userId={account.id}"
              title="remove @{account.username} from saved accounts."
              class="my-auto text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md focus:ring-2 focus:ring-red-400 p-1 inline-flex justify-center">
              <i class="i-heroicons-x-mark w-6 h-6" />
            </button>
          </div>
        </div>
      {/each}
    {:else}
      <div class="bg-white dark:bg-gray-700 rounded-lg py-1.5 px-2 text-base text-center">
        No saved accounts.
      </div>
    {/if}
  </form>
  <a
    href="/login?saveLogin=true"
    class="bg-gray-100 border-2 border-white dark:border-gray-800 shadow dark:bg-gray-700 dark:text-white text-primary-600 rounded-lg !mt-1 p-2 text-base text-center inline-flex items-center justify-center space-x-2">
    <i class="i-bi-person-plus w-5 h-5" />
    <span>Add account</span>
  </a>
</div>
