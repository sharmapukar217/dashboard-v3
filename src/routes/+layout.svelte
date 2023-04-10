<script lang="ts">
  import "../app.css";
  import "virtual:uno.css";

  import nProgress from "nprogress";
  import { onMount, setContext } from "svelte";
  import { page, navigating } from "$app/stores";
  import { initFlash } from "sveltekit-flash-message/client";
  import { QueryClient, createQuery } from "@tanstack/svelte-query";

  import { toast } from "$lib/utilities/toast";
  import { authStore } from "$lib/stores/authStore";
  import { previousUrl } from "$lib/stores/previousUrl";
  import { onLoadCurrentUser } from "$lib/functions/auth.telefunc";
  import {
    Toaster,
    AppNavBar,
    BottomNav,
    ThemeScript,
    ServiceWorker
  } from "$lib/components/RootLayout";

  export let data;

  const flash = initFlash(page);
  $: if ($flash) toast.show($flash);

  $: $navigating ? nProgress.start() : nProgress.done();

  $: if ($navigating?.from && $navigating.from?.url.toString() != $navigating.to?.url.toString()) {
    if ($navigating.from.url.pathname !== "/login") {
      previousUrl.set($navigating.from.url.toString());
    }
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnMount: false,
        enabled: !import.meta.env.SSR,
        cacheTime: 1000 * 60 * 60 * 24
      }
    }
  });

  setContext("$$_queryClient", queryClient);

  const currentUser = createQuery({
    queryKey: ["current-user"],
    refetchOnWindowFocus: true,
    initialData: data.currentUser,
    queryFn: () => onLoadCurrentUser()
  });

  $: authStore.set({
    isLoading: $currentUser.isLoading,
    currentUser: $currentUser.data
  });

  onMount(() => {
    queryClient.mount();
    return () => {
      queryClient.unmount();
    };
  });
</script>

<ServiceWorker />
<ThemeScript>
  <AppNavBar />
  <div class="relative h-full overflow-y-auto">
    <slot />
    <Toaster />
  </div>
  <BottomNav />
</ThemeScript>
