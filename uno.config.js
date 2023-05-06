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

// to get the palette keys
const palette = {};
Object.keys(colors["blue"]).forEach((key) => {
  palette[key] = `rgb(var(--primary-${key}))`;
});

const hexToRgb = (hex) => {
  return hex
    .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => "#" + r + r + g + g + b + b)
    .substring(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16))
    .join(", ");
};

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
      primary: palette
    }
  },
  safelist: ["bg-blue-500", "bg-red-500", "bg-cyan-500", "bg-gray-500", "bg-pink-500", "bg-purple-500", "bg-indigo-500"],
  shortcuts: [[/^hw-(.*)$/, ([, c]) => `h-${c} w-${c}`],
    {
      "badge": "inline-block items-center text-sm bg-gray-200 dark:bg-gray-700 px-2 rounded-lg font-medium cursor-pointer select-none truncate"
    },
    [
      /^badge-(.*)$/,
      ([, c]) => {
        return `text-${c}-600 bg-${c}-100 dark:text-white dark:bg-${c}-600`;
      },
    ]
    ],
  preflights: [
    {
      getCSS: ({ theme }) => {
        const css = [];
        const colors = theme.colors;

        const paletteConfig = {
          ":root": "blue",
          '[data-palette="red"]': "red",
          '[data-palette="cyan"]': "cyan",
          '[data-palette="gray"]': "gray",
          '[data-palette="pink"]': "pink",
          '[data-palette="purple"]': "purple",
          '[data-palette="indigo"]': "indigo",

        };

        Object.keys(paletteConfig).forEach((themeKey) => {
          const themes = [];
          const value = paletteConfig[themeKey];

          Object.keys(colors[value]).forEach((colorKey) => {
            themes.push(`--primary-${colorKey}: ${hexToRgb(colors[value][colorKey])};`);
          });

          css.push(`\n${themeKey} {\n${themes.join("")}}`);
        });

        return css.join("");
      }
    }
  ]
});
