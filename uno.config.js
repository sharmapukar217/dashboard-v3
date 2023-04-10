import {
  defineConfig,
  extractorSvelte,
  transformerDirectives,
  transformerVariantGroup
} from "unocss";
import { presetForms } from "@julr/unocss-preset-forms";
import { presetWebFonts } from "unocss/preset-web-fonts";
import { colors, presetWind } from "unocss/preset-wind";
import { presetIcons } from "unocss/preset-icons";

export default defineConfig({
  transformers: [transformerDirectives(), transformerVariantGroup()],
  extractors: [extractorSvelte],
  presets: [
    presetWind(),
    presetIcons({
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle"
      }
    }),
    presetForms()
  ],
  theme: {
    colors: {
      primary: colors.blue
    }
  },
  shortcuts: [[/^hw-(.*)$/, ([, c]) => `h-${c} w-${c}`]]
});
