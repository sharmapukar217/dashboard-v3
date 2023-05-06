<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { Workbox } from "workbox-window";
  import { dev, browser } from "$app/environment";

  import { toast } from "$lib/utilities/toast";
  import UpdatePrompt from "./UpdatePrompt.svelte";

  const handleMessage = (e: any) => {
    if (e.data?.command === "navigate") {
      goto(e.data.url || "/");
    }
  };

  onMount(() => {
    const wb = new Workbox("/service-worker.js", {
      type: dev ? "module" : "classic"
    });

    wb.addEventListener("activated", (event) => {
      if (!event.isUpdate) {
        toast.show({
          type: "info",
          id: "service-worker",
          message: "App is ready to work in offline mode."
        });
      }
    });
    wb.addEventListener("controlling", () => {
      window.location.reload();
    });
    wb.addEventListener("waiting", (event) => {
      toast.show({
        type: "custom",
        timeout: Infinity,
        id: "service-worker",
        component: UpdatePrompt,
        props: {
          handleUpdate: () => wb.messageSkipWaiting()
        }
      });
    });

    wb.register();

    navigator.serviceWorker?.addEventListener("message", handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  });
</script>

<!-- {#if updateAvailable} -->

<!-- {/if} -->
