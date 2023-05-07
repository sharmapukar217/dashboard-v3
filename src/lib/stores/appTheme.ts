import Cookie from "js-cookie";
import { writable, get } from "svelte/store";
import { toast } from "$lib/utilities/toast";

export type AppTheme = {
  lightNavBar: boolean;
  palette: "blue" | "purple";
  mode: "light" | "dark" | "system";
};

export const PALETTES = ["blue", "red", "cyan", "gray", "pink", "purple", "indigo"];

const MODES = ["light", "dark", "system"];

function createStore() {
  const { set, update, subscribe } = writable<AppTheme>({
    mode: "light",
    palette: "blue",
    lightNavBar: false
  });

  function changeMode(mode?: AppTheme["mode"]) {
    update((t) => {
      if (!mode) {
        mode = (MODES[MODES.indexOf(t.mode) + 1] || "light") as AppTheme["mode"];
      }
      return { ...t, mode };
    });
  }

  function saveTheme(noPrompt = false) {
    const theme = JSON.stringify(get({ subscribe }));
    Cookie.set("theme", theme, { path: "/", expires: 100 });
    if(!noPrompt) {
      toast.show({ type: "info", id: "theme", message: "Theme preferences saved." });
    }
  }

  return { set, update, saveTheme, changeMode, subscribe };
}

export const appTheme = createStore();
