/// <reference types="svelte-gestures" />

import "telefunc";
import "@total-typescript/ts-reset";

declare global {
  namespace App {
    interface Error {
      message: string;
      errorId: string;
    }
    interface Locals {
      sid: string;
    }
    interface PageData {
      currentUser: ReturnType<Awaited<import("$lib/functions/auth.server").getCurrentUser>>;
      flash?: { type: "success" | "error" | "warning" | "loading"; id?: string; message: string };
    }
  }

  namespace svelte.JSX {
    type Direction = "top" | "right" | "bottom" | "left";

    interface HTMLAttributes {
      onswiping: (event: CustomEvent<{ dx: number; dy: number; direction: Direction }>) => void;
      onswipeend: (event: CustomEvent) => void;
    }
  }
}

declare module "telefunc" {
  namespace Telefunc {
    interface Context {
      sid: string;
    }
  }
}

export {};
