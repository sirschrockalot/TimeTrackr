import { defineConfig, presetUno, presetIcons, presetWebFonts } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons(),
    presetWebFonts({
      fonts: {
        sans: 'Inter',
        serif: 'Merriweather',
        mono: 'Fira Mono',
      },
    }),
  ],
}); 