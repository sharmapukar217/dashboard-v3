<script lang="ts">
  import { swipe } from "$lib/actions";

  export let onClose: (() => void) | undefined = undefined;

  let closing = false;
  const handleSwipe = async (ev: any) => {
    if (closing) return;

    const { dy, direction } = ev.detail;
    const box = ev.target.getBoundingClientRect();
    if (direction === "bottom" || (direction === "top" && box.top > 0)) {
      ev.target.style.transform = `translateY(${dy}px)`;
    }

    if (dy > 250) {
      closing = true;
      ev.target.style.transform = `translateY(-1000px)`;
      onClose?.();
    }
  };
  const handleSwipeEnd = (ev: any) => {
    closing = false;
    ev.target.style.transform = "none";
  };
</script>

<div class="z-15 fixed inset-0 bg-black/30" on:click={onClose} on:keyup />
<div
  class="z-100 hw-full dark:bg-dark-800 fixed top-0 right-0 select-none overflow-auto bg-white shadow md:max-w-3xl flex flex-col"
  use:swipe
  on:swiping={handleSwipe}
  on:swipeend={handleSwipeEnd}>
  <slot name="header" />
  <div class="hw-full overflow-auto">
    <slot />
  </div>
  <slot name="footer" />
</div>
